# api/views.py
from django.contrib.auth.models import User
from rest_framework import generics, viewsets,status, serializers
from .serializers import UserSerializer,ClienteSerializer, ServicoSerializer, OrdemDeServicoSerializer, MaterialSerializer, MaterialUtilizadoSerializer, PagamentoSerializer, RegisterSerializer
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from .models import Cliente, Servico, OrdemDeServico, Material, MaterialUtilizado, Pagamento
from rest_framework.views import APIView
from django.utils import timezone
from django.db.models import Sum, Value, F, Count
from django.db.models.functions import Coalesce
from decimal import Decimal
from django.utils import timezone

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
class ServicoViewSet(viewsets.ModelViewSet):
    serializer_class = ServicoSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Servico.objects.filter(profissional=self.request.user)

    def perform_create(self, serializer):
        serializer.save(profissional=self.request.user)
        
class OrdemDeServicoViewSet(viewsets.ModelViewSet):

    serializer_class = OrdemDeServicoSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return OrdemDeServico.objects.filter(profissional=self.request.user)

    def perform_create(self, serializer):
        nova_os = serializer.save(profissional=self.request.user)
        nova_os.refresh_from_db()
        nova_os.calcular_e_salvar_total()

class MaterialViewSet(viewsets.ModelViewSet):
    serializer_class = MaterialSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Material.objects.filter(profissional=self.request.user)

    def perform_create(self, serializer):
        serializer.save(profissional=self.request.user)
        

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

        if is_pago_total:
            ordem_de_servico = pagamento.ordem_de_servico
            ordem_de_servico.status = 'PG'
            ordem_de_servico.data_finalizacao = timezone.now()
            ordem_de_servico.save(update_fields=['status', 'data_finalizacao'])
            
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
        contagens_status = qs_ordens.values('status').annotate(count=Count('id'))
        status_map = {item['status']: item['count'] for item in contagens_status}

        ordens_abertas = status_map.get('AB', 0)
        ordens_em_andamento = status_map.get('EA', 0)
        ordens_finalizadas = status_map.get('FN', 0)
        ordens_pagas = status_map.get('PG', 0)
        ordens_canceladas = status_map.get('CA', 0)
        ordens_concluidas = ordens_finalizadas + ordens_pagas

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
            'ordens_abertas': ordens_abertas,
            'ordens_em_andamento': ordens_em_andamento,
            'ordens_concluidas': ordens_concluidas,
            'ordens_pagas': ordens_pagas,
            'ordens_canceladas': ordens_canceladas,
            
            'total_clientes': total_clientes,
            'total_servicos': total_servicos,
            
            'faturamento_mes': faturamento_mes,
            'receita_total': receita_total,
            'ticket_medio': ticket_medio,
        }

        return Response(data)