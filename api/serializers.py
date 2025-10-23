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
    
class AddServicoSerializer(serializers.Serializer):
    servico_id = serializers.IntegerField()

    def validate_servico_id(self, value):
        if not Servico.objects.filter(pk=value).exists():
            raise serializers.ValidationError("Serviço com este ID não existe.")
        return value
    
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
        # O campo 'data_pagamento' será preenchido automaticamente, então é apenas leitura
        read_only_fields = ["data_pagamento"]


class OrdemDeServicoSerializer(serializers.ModelSerializer):
    servicos = ServicoSerializer(many=True, read_only=True)
    materiais_utilizados = MaterialUtilizadoSerializer(many=True, read_only=True)
    pagamentos = PagamentoSerializer(many=True, read_only=True)
    cliente = ClienteSerializer(read_only=True) 

    cliente_id = serializers.IntegerField(write_only=True)
    servicos_ids = serializers.ListField(
        child=serializers.IntegerField(), write_only=True
    )
    materiais_para_adicionar = MaterialUtilizadoWriteSerializer(many=True, write_only=True)

    class Meta:
        model = OrdemDeServico
        fields = [
            "id",
            "cliente",
            "cliente_id", 
            "servicos",
            "servicos_ids", 
            "materiais_utilizados",
            "materiais_para_adicionar",
            "pagamentos",
            "status",
            "data_abertura",
            "data_finalizacao",
            "valor_total",
            "endereco_servico",
            "data_agendamento", 
        ]

        read_only_fields = ["valor_total", "data_abertura"]

    def create(self, validated_data):
        servicos_data = validated_data.pop('servicos_ids')
        materiais_data = validated_data.pop('materiais_para_adicionar')

        validated_data['cliente_id'] = validated_data.pop('cliente_id')

        ordem_de_servico = OrdemDeServico.objects.create(**validated_data)

        ordem_de_servico.servicos.set(servicos_data)
        
        for item in materiais_data:
            MaterialUtilizado.objects.create(
                ordem_de_servico=ordem_de_servico,
                material_id=item['material_id'],
                quantidade=item['quantidade']
            )

        ordem_de_servico.calcular_e_salvar_total()

        return ordem_de_servico


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
