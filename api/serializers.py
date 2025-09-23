# api/serializers.py
from django.contrib.auth.models import User
from .models import Cliente, Servico, OrdemDeServico
from rest_framework import serializers


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ["id", "username", "password"]
    def create(self, validated_data):
        user = User.objects.create_user(**validated_data)
        return user
class ClienteSerializer(serializers.ModelSerializer):
    class Meta:
        model = Cliente
        fields = ['id', 'nome', 'email', 'telefone', 'endereco', 'data_criacao']
class ServicoSerializer(serializers.ModelSerializer):
    class Meta:
        model = Servico
        fields = ['id', 'nome', 'descricao', 'preco']
class OrdemDeServicoSerializer(serializers.ModelSerializer):
    class Meta:
        model = OrdemDeServico
        fields = [
            'id', 
            'cliente', 
            'servicos', 
            'status', 
            'data_abertura', 
            'data_finalizacao', 
            'valor_total'
        ]