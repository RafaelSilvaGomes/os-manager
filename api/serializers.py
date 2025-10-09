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
        fields = ["id", "nome", "email", "telefone", "endereco", "data_criacao"]


class ServicoSerializer(serializers.ModelSerializer):
    class Meta:
        model = Servico
        fields = ["id", "nome", "descricao", "preco"]


class MaterialSerializer(serializers.ModelSerializer):
    class Meta:
        model = Material
        fields = ["id", "nome", "descricao", "preco_unidade"]


class MaterialUtilizadoSerializer(serializers.ModelSerializer):
    material = MaterialSerializer(read_only=True)
    material_id = serializers.IntegerField(write_only=True)

    class Meta:
        model = MaterialUtilizado
        fields = ["id", "ordem_de_servico", "material", "material_id", "quantidade"]


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
    materiais_utilizados = MaterialUtilizadoSerializer(many=True, read_only=True)
    servicos_details = ServicoSerializer(source="servicos", many=True, read_only=True)
    pagamentos = PagamentoSerializer(many=True, read_only=True)

    class Meta:
        model = OrdemDeServico
        fields = [
            "id",
            "cliente",
            "servicos",
            "servicos_details",
            "materiais_utilizados",
            "pagamentos",
            "status",
            "data_abertura",
            "data_finalizacao",
            "valor_total",
        ]


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
