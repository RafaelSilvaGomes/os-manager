# api/serializers.py
from django.contrib.auth.models import User
from .models import Cliente, Servico, OrdemDeServico, Material, MaterialUtilizado, Pagamento
from rest_framework import serializers, validators


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

class MaterialSerializer(serializers.ModelSerializer):
    class Meta:
        model = Material
        fields = ['id', 'nome', 'descricao', 'preco_unidade']

class MaterialUtilizadoSerializer(serializers.ModelSerializer):
    material = MaterialSerializer(read_only=True) 
    material_id = serializers.IntegerField(write_only=True)
    class Meta:
        model = MaterialUtilizado
        fields = ['id','ordem_de_servico', 'material', 'material_id', 'quantidade']
class PagamentoSerializer(serializers.ModelSerializer):
    class Meta:
        model = Pagamento
        fields = ['id', 'ordem_de_servico', 'valor_pago', 'forma_pagamento', 'data_pagamento']
        # O campo 'data_pagamento' será preenchido automaticamente, então é apenas leitura
        read_only_fields = ['data_pagamento']

class OrdemDeServicoSerializer(serializers.ModelSerializer):
    materiais_utilizados = MaterialUtilizadoSerializer(many=True, read_only=True)
    servicos_details = ServicoSerializer(source='servicos', many=True, read_only=True)
    class Meta:
        model = OrdemDeServico
        fields = [
            'id', 
            'cliente', 
            'servicos',
            'servicos_details', 
            'materiais_utilizados',
            'status', 
            'data_abertura', 
            'data_finalizacao', 
            'valor_total'
        ]