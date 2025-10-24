# api/views.py
from django.contrib.auth.models import User
from rest_framework import generics, viewsets,status, serializers
from .serializers import UserSerializer,ClienteSerializer, ServicoSerializer, OrdemDeServicoSerializer, MaterialSerializer, MaterialUtilizadoSerializer, PagamentoSerializer, RegisterSerializer
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from .models import Cliente, Servico, OrdemDeServico, Material, MaterialUtilizado, Pagamento
from rest_framework.views import APIView
from django.utils import timezone
from django.db.models import Sum, Value, F
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
        # Garante que o usuário só veja pagamentos das suas OS
        return Pagamento.objects.filter(ordem_de_servico__profissional=self.request.user)

    # O método 'create' agora faz a validação e chama o perform_create
    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        ordem_de_servico_obj = serializer.validated_data.get('ordem_de_servico')

        # Verifica se a OS pertence ao usuário logado (Segurança extra)
        if ordem_de_servico_obj.profissional != request.user:
             raise serializers.ValidationError("Você não tem permissão para registrar pagamento para esta OS.")

        # --- LÓGICA DE VALIDAÇÃO ---
        # Calculamos o valor pendente ANTES de tentar criar o pagamento
        total_pago_anterior = ordem_de_servico_obj.pagamentos.aggregate(
            total=Coalesce(Sum('valor_pago'), Value(Decimal('0.00')))
        )['total']
        valor_pendente = ordem_de_servico_obj.valor_total - total_pago_anterior
        valor_pendente = valor_pendente.quantize(Decimal('0.01'), rounding='ROUND_HALF_UP')

        # Se já estiver paga (valor pendente <= 0) OU Cancelada, rejeita
        if valor_pendente <= 0 or ordem_de_servico_obj.status == 'CA':
            raise serializers.ValidationError(
                "Esta Ordem de Serviço já está Paga ou Cancelada e não aceita novos pagamentos."
            )
        
        # --- FIM DA VALIDAÇÃO ---

        # Se passou, continua com a criação, passando o valor a pagar
        # Usamos **kwargs para passar o valor calculado para o perform_create
        self.perform_create(serializer, valor_a_pagar=valor_pendente)
        headers = self.get_success_headers(serializer.data)
        # Retornamos os dados do pagamento criado (incluindo o valor calculado)
        return Response(serializer.data, status=status.HTTP_201_CREATED, headers=headers)

    # O método 'perform_create' agora recebe o valor a pagar
    def perform_create(self, serializer, valor_a_pagar):
        # Salva o pagamento, mas sobrescreve o valor_pago com o calculado
        pagamento = serializer.save(valor_pago=valor_a_pagar)

        # Atualiza a OS para refletir a quitação
        ordem_de_servico = pagamento.ordem_de_servico
        ordem_de_servico.status = 'PG'
        ordem_de_servico.data_finalizacao = timezone.now()
        # Opcional: Atualizar campos de valor_pago/pendente na OS se eles existirem como campos
        # Se forem @property, não precisa salvar aqui, o serializer buscará o valor atualizado
        # Vamos assumir que são @property por enquanto
        ordem_de_servico.save(update_fields=['status', 'data_finalizacao']) # Salva apenas status e data
            
class RegisterView(generics.CreateAPIView):
    queryset = User.objects.all()
    permission_classes = (AllowAny,)
    serializer_class = RegisterSerializer

class DashboardStatsView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, *args, **kwargs):
        # Pega o usuário que está fazendo a requisição
        profissional = request.user

        # Calcula o número de OS com status 'Aberta'
        ordens_abertas = OrdemDeServico.objects.filter(profissional=profissional, status='AB').count()
        
        # Calcula o número total de clientes do profissional
        total_clientes = Cliente.objects.filter(profissional=profissional).count()

        # Calcula o faturamento do mês atual
        hoje = timezone.now()
        faturamento_mes = OrdemDeServico.objects.filter(
            profissional=profissional,
            status='PG', # Apenas OS com status 'Paga'
            data_finalizacao__year=hoje.year,
            data_finalizacao__month=hoje.month
        ).aggregate(
            # Coalesce(Sum(...), Value(0)) garante que, se não houver faturamento, ele retorne 0 em vez de None
            total=Coalesce(Sum('valor_total'), Value(Decimal('0.00')))
        )['total']

        # Monta o dicionário de dados para a resposta
        data = {
            'ordens_abertas': ordens_abertas,
            'total_clientes': total_clientes,
            'faturamento_mes': faturamento_mes
        }
        
        return Response(data)