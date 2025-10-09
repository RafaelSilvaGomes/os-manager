# api/views.py
from django.contrib.auth.models import User
from rest_framework import generics, viewsets,status, serializers
from .serializers import UserSerializer,ClienteSerializer, ServicoSerializer, OrdemDeServicoSerializer, MaterialSerializer, MaterialUtilizadoSerializer, PagamentoSerializer, RegisterSerializer
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from .models import Cliente, Servico, OrdemDeServico, Material, MaterialUtilizado, Pagamento
from rest_framework.views import APIView
from django.utils import timezone
from django.db.models import Sum, Value
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

        # --- NOSSA NOVA LÓGICA DE VALIDAÇÃO ---
        ordem_de_servico_obj = serializer.validated_data.get('ordem_de_servico')
        
        # Verifica o status da OS antes de prosseguir
        if ordem_de_servico_obj.status in ['PG', 'CA']: # Se estiver Paga ou Cancelada
            # Lança um erro de validação, que o DRF transforma em um erro 400 (Bad Request)
            raise serializers.ValidationError(
                "Esta Ordem de Serviço já está Paga ou Cancelada e não aceita novos pagamentos."
            )
        
        # --- FIM DA NOVA LÓGICA ---

        # Se passou na validação, continua com a criação normal
        self.perform_create(serializer)
        headers = self.get_success_headers(serializer.data)
        return Response(serializer.data, status=status.HTTP_201_CREATED, headers=headers)
    
    # 3. O método perform_create continua aqui, com a lógica de atualizar o status
    def perform_create(self, serializer):
        pagamento = serializer.save()
        ordem_de_servico = pagamento.ordem_de_servico
        
        total_pago = sum(p.valor_pago for p in ordem_de_servico.pagamentos.all())
        
        if total_pago >= ordem_de_servico.valor_total:
          ordem_de_servico.status = 'PG'
    # Adicione esta linha para registrar a data e hora atuais
          ordem_de_servico.data_finalizacao = timezone.now() 
          ordem_de_servico.save()
            
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