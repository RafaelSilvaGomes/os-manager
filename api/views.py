# api/views.py
from django.contrib.auth.models import User
from rest_framework import generics, viewsets, status, serializers
from rest_framework.decorators import action
from .serializers import UserSerializer,ClienteSerializer, ServicoSerializer, OrdemDeServicoSerializer, MaterialSerializer, MaterialUtilizadoSerializer, PagamentoSerializer, AgendaOrdemSerializer, RegisterSerializer
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from .models import Cliente, Servico, OrdemDeServico, Material, MaterialUtilizado, Pagamento
from rest_framework.views import APIView
from django.utils import timezone
from django.shortcuts import get_object_or_404
from django.db.models import Sum, Value, F, Count, Q
from django.db.models.functions import Coalesce
from decimal import Decimal
from django.utils import timezone
from django.db.models import ProtectedError
from django.core.mail import EmailMessage
from django.conf import settings
from textwrap import dedent

class CreateUserView(generics.CreateAPIView):
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [AllowAny]

class ClienteViewSet(viewsets.ModelViewSet):
    serializer_class =ClienteSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Cliente.objects.filter(profissional=self.request.user)
    def perform_create(self, serializer):
        serializer.save(profissional=self.request.user)

    def destroy(self, request, *args, **kwargs):
        instance = self.get_object()
        try:
            self.perform_destroy(instance)
            return Response(status=status.HTTP_204_NO_CONTENT)
        
        except ProtectedError as e:
            return Response(
                {"detail": "Este cliente não pode ser excluído pois está associado a uma ou mais Ordens de Serviço."},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        except Exception as e:
            return Response(
                {"detail": f"Erro inesperado: {str(e)}"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

class ClienteStatsView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, pk=None):
        cliente = get_object_or_404(Cliente, pk=pk, profissional=request.user)

        ordens_cliente = OrdemDeServico.objects.filter(
            cliente=cliente,
            profissional=request.user
        ).exclude(status='CA')

        total_os_concluidas = ordens_cliente.filter(
            status__in=['FN', 'PG']
        ).count()

        total_faturado = Pagamento.objects.filter(
            ordem_de_servico__in=ordens_cliente
        ).aggregate(
            total=Coalesce(Sum('valor_pago'), Value(Decimal('0.00')))
        )['total']

        total_em_contratos = ordens_cliente.aggregate(
            total=Coalesce(Sum('valor_total'), Value(Decimal('0.00')))
        )['total']

        total_pendente = (total_em_contratos - total_faturado).quantize(Decimal('0.01'))

        total_os_geral = ordens_cliente.count()

        return Response({
            'cliente_id': cliente.id,
            'cliente_nome': cliente.nome,
            'total_os_concluidas': total_os_concluidas,
            'total_os_geral': total_os_geral,
            'total_faturado': total_faturado,
            'total_pendente': total_pendente,
        })
        
class ServicoViewSet(viewsets.ModelViewSet):
    serializer_class = ServicoSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Servico.objects.filter(profissional=self.request.user)

    def perform_create(self, serializer):
        serializer.save(profissional=self.request.user)

    def destroy(self, request, *args, **kwargs):
        instance = self.get_object()

        if instance.ordemdeservico_set.exists():

            return Response(
                {"detail": "Este serviço não pode ser excluído pois está associado a uma ou mais Ordens de Serviço."},
                status=status.HTTP_400_BAD_REQUEST
            )

        try:
            self.perform_destroy(instance)
            return Response(status=status.HTTP_204_NO_CONTENT)

        except ProtectedError as e:
            return Response(
                {"detail": "Este serviço não pode ser excluído pois está protegido por outra relação."},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        except Exception as e:
            return Response(
                {"detail": f"Erro inesperado: {str(e)}"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
        
class AgendaOrdemListView(generics.ListAPIView):
    serializer_class = AgendaOrdemSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user

        return OrdemDeServico.objects.filter(
            profissional=user,
            data_agendamento__isnull=False
        ).exclude(
            status='CA'
        ).select_related('cliente')

class OrdemDeServicoViewSet(viewsets.ModelViewSet):

    serializer_class = OrdemDeServicoSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return OrdemDeServico.objects.filter(profissional=self.request.user)

    def perform_create(self, serializer):
        nova_os = serializer.save(profissional=self.request.user)
        nova_os.refresh_from_db()
        nova_os.calcular_e_salvar_total()

        try:
            cliente = nova_os.cliente
            
            if cliente.email:
                subject = f"Ordem de Serviço Criada: OS #{nova_os.id}"

                data_agendada_str = "Ainda não agendada."
                if nova_os.data_agendamento:
                    data_local = timezone.localtime(nova_os.data_agendamento)
                    data_agendada_str = data_local.strftime('%d/%m/%Y às %H:%M')

                servicos_da_os = nova_os.servicos.all()
                lista_servicos_html = "<li>Nenhum serviço especificado.</li>"
                if servicos_da_os.exists():
                    lista_servicos_html = "".join(
                        [f"<li style='margin-bottom: 5px;'>{servico.nome} (R$ {servico.preco})</li>" for servico in servicos_da_os]
                    )

                materiais_da_os = nova_os.materiais_utilizados.all()
                lista_materiais_html = "<li>Nenhum material adicionado.</li>"
                
                if materiais_da_os.exists():
                    lista_materiais_html = "".join(
                        [f"<li style='margin-bottom: 5px;'>{item.quantidade}x {item.material.nome} (R$ {item.material.preco_unidade} / {item.material.unidade_medida})</li>" for item in materiais_da_os]
                    )

                html_message_body = f"""
                <html>
                <body style="font-family: Arial, sans-serif; margin: 0; padding: 0; background-color: #f4f4f4;">
                    <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #f4f4f4;">
                        <tr>
                            <td align="center" style="padding: 20px 0;">
                                <table width="600" border="0" cellspacing="0" cellpadding="0" style="background-color: #ffffff; border: 1px solid #ddd; border-radius: 8px; overflow: hidden;">
                                    
                                    <tr>
                                        <td align="center" style="padding: 20px 0; background-color: #0d47a1; color: #ffffff;">
                                            <h1 style="margin: 0; font-size: 24px;">OrdemPro</h1>
                                        </td>
                                    </tr>
                                    
                                    <tr>
                                        <td style="padding: 30px 25px; font-size: 16px; line-height: 1.6; color: #333;">
                                            <h2 style="font-size: 20px; color: #0d47a1; margin-top: 0;">Nova Ordem de Serviço Criada</h2>
                                            <p>Olá, {cliente.nome}!</p>
                                            <p>Uma nova Ordem de Serviço foi aberta em seu nome. Confira os detalhes abaixo:</p>
                                            
                                            <table width="100%" border="0" cellspacing="0" cellpadding="0" style="margin-top: 20px; border-top: 1px solid #eee;">
                                                <tr>
                                                    <td style="padding: 10px 0; font-weight: bold; color: #555; width: 150px;">ID do Serviço:</td>
                                                    <td style="padding: 10px 0;">OS #{nova_os.id}</td>
                                                </tr>
                                                <tr>
                                                    <td style="padding: 10px 0; font-weight: bold; color: #555;">Agendamento:</td>
                                                    <td style="padding: 10px 0;">{data_agendada_str}</td>
                                                </tr>
                                                <tr>
                                                    <td style="padding: 10px 0; font-weight: bold; color: #555;">Valor Total:</td>
                                                    <td style="padding: 10px 0; font-size: 18px; font-weight: bold; color: #0d47a1;">R$ {nova_os.valor_total}</td>
                                                </tr>
                                            </table>

                                            <h3 style="font-size: 18px; color: #0d47a1; margin-top: 25px; border-top: 1px solid #eee; padding-top: 20px;">Serviços a Realizar:</h3>
                                            <ul style="margin-top: 10px; padding-left: 25px; color: #333;">
                                                {lista_servicos_html}
                                            </ul>
                                            
                                            <h3 style="font-size: 18px; color: #0d47a1; margin-top: 25px; border-top: 1px solid #eee; padding-top: 20px;">Materiais a Utilizar:</h3>
                                            <ul style="margin-top: 10px; padding-left: 25px; color: #333;">
                                                {lista_materiais_html}
                                            </ul>
                                            <p style="margin-top: 25px;">Obrigado!</p>
                                            <p style="margin: 0;">{self.request.user.first_name or 'Equipe OrdemPro'}</p>
                                        </td>
                                    </tr>
                                    
                                    <tr>
                                        <td align="center" style="padding: 20px; font-size: 12px; color: #888; background-color: #f9f9f9; border-top: 1px solid #eee;">
                                            <p style="margin: 0;">Este é um e-mail automático. Por favor, não responda.</p>
                                        </td>
                                    </tr>
                                </table>
                            </td>
                        </tr>
                    </table>
                </body>
                </html>
                """
                
                message = dedent(html_message_body)

                email = EmailMessage(
                    subject,
                    message,
                    settings.DEFAULT_FROM_EMAIL,
                    [cliente.email]
                )
                email.content_subtype = "html"
                email.send(fail_silently=False)
        
        except Exception as e:
            print(f"!!! ERRO AO ENVIAR E-MAIL de nova OS: {e}")

    @action(detail=True, methods=['post'], url_path='finalizar')
    def finalizar(self, request, pk=None):
        try:
            ordem = self.get_object()
        except OrdemDeServico.DoesNotExist:
            return Response(status=status.HTTP_404_NOT_FOUND)
        
        ordem_status_calculado = self.get_serializer(ordem).data.get('status')

        if ordem_status_calculado in ['AB', 'EA']:
            
            valor_total = ordem.valor_total
            valor_pago_agregado = ordem.pagamentos.aggregate(
                total=Coalesce(Sum('valor_pago'), Value(Decimal('0.00')))
            )['total']
            valor_pendente = (valor_total - valor_pago_agregado).quantize(Decimal('0.01'))
            
            if valor_pendente <= Decimal('0.01'):
                ordem.status = 'PG'
            else:
                ordem.status = 'FN'
            
            if not ordem.data_finalizacao:
                 ordem.data_finalizacao = timezone.now()
                 
            ordem.save(update_fields=['status', 'data_finalizacao'])
            
            serializer = self.get_serializer(ordem)
            return Response(serializer.data, status=status.HTTP_200_OK)
        else:
            return Response(
                {"detail": f"Não é possível finalizar uma OS com status '{ordem.get_status_display()}'."},
                status=status.HTTP_400_BAD_REQUEST
            )

class MaterialStoreNamesView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, *args, **kwargs):
        stores = Material.objects.filter(
            profissional=request.user, 
            loja__isnull=False
        ).exclude(
            loja__exact=''
        ).values_list(
            'loja', flat=True 
        ).distinct().order_by('loja')
        
        return Response(list(stores))
    
class MaterialViewSet(viewsets.ModelViewSet):
    serializer_class = MaterialSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Material.objects.filter(profissional=self.request.user)

    def perform_create(self, serializer):
        serializer.save(profissional=self.request.user)

    def destroy(self, request, *args, **kwargs):
        instance = self.get_object()
        try:
            self.perform_destroy(instance)
            return Response(status=status.HTTP_204_NO_CONTENT)
        
        except ProtectedError as e:
            return Response(
                {"detail": "Este material não pode ser excluído pois está associado a uma ou mais Ordens de Serviço."},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        except Exception as e:
            return Response(
                {"detail": f"Erro inesperado: {str(e)}"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
        

class MaterialUtilizadoViewSet(viewsets.ModelViewSet):
    serializer_class = MaterialUtilizadoSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return MaterialUtilizado.objects.filter(ordem_de_servico__profissional=self.request.user)
    
    def perform_create(self, serializer):
        item_salvo = serializer.save()
        item_salvo.ordem_de_servico.calcular_e_salvar_total()

    def perform_destroy(self, instance):
        ordem_de_servico_relacionada = instance.ordem_de_servico
        instance.delete()
        ordem_de_servico_relacionada.calcular_e_salvar_total()

class PagamentoViewSet(viewsets.ModelViewSet):
    serializer_class = PagamentoSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Pagamento.objects.filter(ordem_de_servico__profissional=self.request.user)

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        ordem_de_servico_obj = serializer.validated_data.get('ordem_de_servico')
        
        valor_pago_frontend = serializer.validated_data.get('valor_pago')

        if not valor_pago_frontend or valor_pago_frontend <= 0:
             raise serializers.ValidationError("O valor pago deve ser maior que zero.")

        if ordem_de_servico_obj.profissional != request.user:
            raise serializers.ValidationError("Você não tem permissão para registrar pagamento para esta OS.")

        total_pago_anterior = ordem_de_servico_obj.pagamentos.aggregate(
            total=Coalesce(Sum('valor_pago'), Value(Decimal('0.00')))
        )['total']
        valor_pendente = (ordem_de_servico_obj.valor_total - total_pago_anterior).quantize(Decimal('0.01'), rounding='ROUND_HALF_UP')

        if valor_pendente <= 0 or ordem_de_servico_obj.status == 'CA':
            raise serializers.ValidationError(
                "Esta Ordem de Serviço já está Paga ou Cancelada e não aceita novos pagamentos."
            )
        
        if valor_pago_frontend > (valor_pendente + Decimal('0.01')):
            raise serializers.ValidationError(
                "O valor pago (R$ %.2f) é maior que o valor pendente (R$ %.2f)." %
                (valor_pago_frontend, valor_pendente)
            )

        is_pago_total = (valor_pendente - valor_pago_frontend) < Decimal('0.01')
        
        self.perform_create(serializer, is_pago_total=is_pago_total)
        
        headers = self.get_success_headers(serializer.data)
        return Response(serializer.data, status=status.HTTP_201_CREATED, headers=headers)

    def perform_create(self, serializer, is_pago_total):
        
        pagamento = serializer.save()
        ordem_de_servico = pagamento.ordem_de_servico
        
        if ordem_de_servico.status == 'FN' and is_pago_total:
            ordem_de_servico.status = 'PG'
            ordem_de_servico.save(update_fields=['status'])
            
    def perform_destroy(self, instance):
        ordem_de_servico = instance.ordem_de_servico

        instance.delete()

        ordem_de_servico.refresh_from_db()

        total_pago_agora = ordem_de_servico.pagamentos.aggregate(
            total=Coalesce(Sum('valor_pago'), Value(Decimal('0.00')))
        )['total']
        
        valor_total_os = ordem_de_servico.valor_total
        valor_pendente_novo = (valor_total_os - total_pago_agora).quantize(Decimal('0.01'))

        if ordem_de_servico.status == 'PG' and valor_pendente_novo > 0:
            ordem_de_servico.status = 'FN' 
            ordem_de_servico.data_finalizacao = None
            ordem_de_servico.save(update_fields=['status', 'data_finalizacao'])
            
class RegisterView(generics.CreateAPIView):
    queryset = User.objects.all()
    permission_classes = (AllowAny,)
    serializer_class = RegisterSerializer

class DashboardStatsView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, *args, **kwargs):
        profissional = request.user
        hoje = timezone.now()

        qs_ordens = OrdemDeServico.objects.filter(profissional=profissional)
        total_ordens_geral = qs_ordens.count()
        ordens_abertas_no_banco = qs_ordens.filter(status='AB')
        ordens_que_viraram_ea = ordens_abertas_no_banco.filter(
            data_agendamento__isnull=False,
            data_agendamento__lte=hoje
        ).count()
        ordens_abertas_real = ordens_abertas_no_banco.count() - ordens_que_viraram_ea
        ordens_ea_no_banco = qs_ordens.filter(status='EA').count()
        ordens_em_andamento_total = ordens_ea_no_banco + ordens_que_viraram_ea
        contagens_status = qs_ordens.values('status').annotate(count=Count('id'))
        status_map = {item['status']: item['count'] for item in contagens_status}
        ordens_finalizadas_pendentes = qs_ordens.filter(status='FN').count()
        ordens_pagas = qs_ordens.filter(status='PG').count()
        ordens_canceladas = qs_ordens.filter(status='CA').count()
        ordens_concluidas = ordens_finalizadas_pendentes + ordens_pagas

        total_clientes = Cliente.objects.filter(profissional=profissional).count()
        total_servicos = Servico.objects.filter(profissional=profissional).count()

        qs_pagamentos = Pagamento.objects.filter(
            ordem_de_servico__profissional=profissional
        )

        faturamento_mes = qs_pagamentos.filter(
            data_pagamento__year=hoje.year,
            data_pagamento__month=hoje.month
        ).aggregate(
            total=Coalesce(Sum('valor_pago'), Value(Decimal('0.00')))
        )['total']

        receita_total = qs_pagamentos.aggregate(
            total=Coalesce(Sum('valor_pago'), Value(Decimal('0.00')))
        )['total']
        
        if ordens_concluidas > 0:
            ticket_medio = (receita_total / ordens_concluidas).quantize(Decimal('0.01'))
        else:
            ticket_medio = Decimal('0.00')

        data = {
            'ordens_abertas': ordens_abertas_real,
            'ordens_em_andamento': ordens_em_andamento_total,
            'ordens_concluidas': ordens_concluidas,
            'ordens_pagas': ordens_pagas, 
            'ordens_finalizadas_pendentes': ordens_finalizadas_pendentes, 
            'ordens_canceladas': ordens_canceladas,
            'total_clientes': total_clientes,
            'total_servicos': total_servicos,
            'faturamento_mes': faturamento_mes,
            'receita_total': receita_total,
            'ticket_medio': ticket_medio,
            'total_ordens_geral': total_ordens_geral,
        }

        return Response(data)