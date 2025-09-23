# api/views.py
from django.contrib.auth.models import User
from rest_framework import generics, viewsets
from .serializers import UserSerializer,ClienteSerializer, ServicoSerializer, OrdemDeServicoSerializer
from rest_framework.permissions import AllowAny, IsAuthenticated
from .models import Cliente, Servico, OrdemDeServico

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
        serializer.save(profissional=self.request.user)