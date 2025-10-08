# api/views.py
from django.contrib.auth.models import User
from rest_framework import generics, viewsets
from .serializers import UserSerializer,ClienteSerializer, ServicoSerializer, OrdemDeServicoSerializer, MaterialSerializer, MaterialUtilizadoSerializer, PagamentoSerializer, RegisterSerializer
from rest_framework.permissions import AllowAny, IsAuthenticated
from .models import Cliente, Servico, OrdemDeServico, Material, MaterialUtilizado, Pagamento

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

    def perform_create(self, serializer):
        pagamento = serializer.save()
        ordem_de_servico = pagamento.ordem_de_servico
        total_pago = sum(p.valor_pago for p in ordem_de_servico.pagamentos.all())
        if total_pago >= ordem_de_servico.valor_total:
            ordem_de_servico.status = 'PG' 
            ordem_de_servico.save()
            
class RegisterView(generics.CreateAPIView):
    queryset = User.objects.all()
    permission_classes = (AllowAny,)
    serializer_class = RegisterSerializer