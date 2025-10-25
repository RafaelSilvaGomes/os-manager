# api/serializers.py
from django.contrib.auth.models import User
from .models import (
    Cliente,
    Servico,
    OrdemDeServico,
    Material,
    MaterialUtilizado,
    Pagamento,
)
from rest_framework import serializers, validators
from django.db.models import Sum # Importe Sum e Decimal
from decimal import Decimal


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        # Adicionamos os novos campos aqui
        fields = ["id", "username", "password", "email", "first_name", "last_name"]
        extra_kwargs = {"password": {"write_only": True}}

    def create(self, validated_data):
        user = User.objects.create_user(**validated_data)
        return user

class ClienteSerializer(serializers.ModelSerializer):
    class Meta:
        model = Cliente
        fields = ["id", "nome", "email", "telefone", "endereco", "ponto_referencia", "observacoes", "data_criacao"]
        extra_kwargs = {
            'email': {'required': False, 'allow_blank': True},
            'telefone': {'required': False, 'allow_blank': True},
            'endereco': {'required': False, 'allow_blank': True},
            'ponto_referencia': {'required': False, 'allow_blank': True},
            'observacoes': {'required': False, 'allow_blank': True},
        }

class ServicoSerializer(serializers.ModelSerializer):
    class Meta:
        model = Servico
        fields = ["id", "nome", "descricao", "preco"]


class MaterialSerializer(serializers.ModelSerializer):
    class Meta:
        model = Material
        fields = ["id", "nome", "descricao", "preco_unidade", "unidade_medida"] 
        extra_kwargs = {
            'descricao': {'required': False, 'allow_blank': True},
            'unidade_medida': {'required': False, 'allow_blank': True},
        }


class MaterialUtilizadoSerializer(serializers.ModelSerializer):
    material = MaterialSerializer(read_only=True)
    material_id = serializers.PrimaryKeyRelatedField(
        queryset=Material.objects.all(), write_only=True, source='material'
    )

    class Meta:
        model = MaterialUtilizado
        fields = [
            "id",
            "ordem_de_servico",
            "material",
            "material_id",
            "quantidade",
        ]

class MaterialUtilizadoWriteSerializer(serializers.Serializer):
    material_id = serializers.IntegerField()
    quantidade = serializers.IntegerField()
    
class PagamentoSerializer(serializers.ModelSerializer):
    class Meta:
        model = Pagamento
        fields = [
            "id",
            "ordem_de_servico",
            "valor_pago",
            "forma_pagamento",
            "data_pagamento",
        ]
        read_only_fields = ["data_pagamento"]


class OrdemDeServicoSerializer(serializers.ModelSerializer):
    cliente = ClienteSerializer(read_only=True)
    servicos = ServicoSerializer(many=True, read_only=True)
    materiais_utilizados = MaterialUtilizadoSerializer(many=True, read_only=True)
    pagamentos = PagamentoSerializer(many=True, read_only=True)


    cliente_id = serializers.PrimaryKeyRelatedField(
        queryset=Cliente.objects.all(), write_only=True, source='cliente', label="Cliente"
    )
    servicos_ids = serializers.ListField(
        child=serializers.PrimaryKeyRelatedField(queryset=Servico.objects.all()),
        write_only=True, source='servicos', label="Serviços (IDs)"
    )


    valor_servicos = serializers.SerializerMethodField()
    valor_materiais = serializers.SerializerMethodField()
    valor_total = serializers.SerializerMethodField()
    valor_pago = serializers.SerializerMethodField()
    valor_pendente = serializers.SerializerMethodField()

    class Meta:
        model = OrdemDeServico
        fields = [
            "id",
            "cliente", 
            "cliente_id", 
            "servicos", 
            "servicos_ids", 
            "materiais_utilizados", 
            "pagamentos", 
            "status",
            "data_abertura",
            "data_agendamento",
            "data_finalizacao",
            "endereco_servico",


            "valor_servicos",
            "valor_materiais",
            "valor_total",
            "valor_pago",
            "valor_pendente",
        ]

        read_only_fields = [
            "data_abertura",
            "data_finalizacao",
            "valor_servicos",
            "valor_materiais",
            "valor_total",
            "valor_pago",
            "valor_pendente",
            "cliente",
            "servicos",
            "materiais_utilizados",
            "pagamentos",
        ]


    def get_valor_servicos(self, obj):
  
        total = obj.servicos.aggregate(total=Sum('preco'))['total'] or Decimal('0.00')
        return total.quantize(Decimal('0.01'))

    def get_valor_materiais(self, obj):

        total = Decimal('0.00')

        for mu in obj.materiais_utilizados.all():
            if mu.material: 
               total += mu.quantidade * mu.material.preco_unidade
        return total.quantize(Decimal('0.01'))

    def get_valor_total(self, obj):
  
        valor_servicos = self.get_valor_servicos(obj)
        valor_materiais = self.get_valor_materiais(obj)
        return (valor_servicos + valor_materiais).quantize(Decimal('0.01'))

    def get_valor_pago(self, obj):

        total = obj.pagamentos.aggregate(total=Sum('valor_pago'))['total'] or Decimal('0.00')
        return total.quantize(Decimal('0.01'))

    def get_valor_pendente(self, obj):
  
        valor_total = self.get_valor_total(obj)
        valor_pago = self.get_valor_pago(obj)
        return (valor_total - valor_pago).quantize(Decimal('0.01'))

class RegisterSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ("username", "password", "email", "first_name", "last_name")

        extra_kwargs = {
            "password": {"write_only": True},
            "email": {
                "required": True,
                "allow_blank": False,
                "validators": [
                    validators.UniqueValidator(
                        User.objects.all(), "Este e-mail já existe."
                    )
                ],
            },
        }

    def create(self, validated_data):
        username = validated_data.get("username")
        password = validated_data.get("password")
        email = validated_data.get("email")
        first_name = validated_data.get("first_name")
        last_name = validated_data.get("last_name")

        user = User.objects.create(
            username=username, email=email, first_name=first_name, last_name=last_name
        )

        user.set_password(password)
        user.save()
        return user
