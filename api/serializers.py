
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
from django.db.models import Sum, Q
from decimal import Decimal
from django.db import transaction
from datetime import timedelta
from django.utils import timezone

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        
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
        fields = ["id", "nome", "descricao", "preco_unidade", "unidade_medida", "loja"]
        extra_kwargs = {
            'descricao': {'required': False, 'allow_blank': True},
            'unidade_medida': {'required': False, 'allow_blank': True},
            'loja': {'required': False, 'allow_blank': True},
        }


class MaterialUtilizadoSerializer(serializers.ModelSerializer):
    material = MaterialSerializer(read_only=True)
    material_id = serializers.PrimaryKeyRelatedField(
        queryset=Material.objects.all(), write_only=True, source='material'
    )

    ordem_de_servico = serializers.PrimaryKeyRelatedField(
        queryset=OrdemDeServico.objects.all()
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
    forma_pagamento_display = serializers.CharField(source='get_forma_pagamento_display', read_only=True)
    class Meta:
        model = Pagamento
        fields = [
            "id",
            "ordem_de_servico",
            "valor_pago",
            "forma_pagamento",
            "forma_pagamento_display",
            "data_pagamento",
        ]
        read_only_fields = ["data_pagamento"]

class MaterialParaAdicionarSerializer(serializers.Serializer):
    material_id = serializers.IntegerField(write_only=True)
    quantidade = serializers.IntegerField(min_value=1, write_only=True)
    
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
        write_only=True, label="Serviços (IDs)"
    )

    materiais_para_adicionar = MaterialParaAdicionarSerializer(
        many=True,
        write_only=True,
        required=False
    )

    status = serializers.SerializerMethodField()
    valor_servicos = serializers.SerializerMethodField()
    valor_materiais = serializers.SerializerMethodField()
    valor_total = serializers.SerializerMethodField()
    valor_pago = serializers.SerializerMethodField()
    valor_pendente = serializers.SerializerMethodField()

    class Meta:
        model = OrdemDeServico
        fields = [
            "id", "cliente", "cliente_id", "servicos", "servicos_ids",
            "materiais_utilizados",
            "pagamentos", "status", "data_abertura", "data_agendamento", "duracao_estimada_horas",
            "data_finalizacao", "endereco_servico", "valor_servicos",
            "valor_materiais", "valor_total", "valor_pago", "valor_pendente",
            "materiais_para_adicionar"
        ]
        read_only_fields = [
            "data_abertura", "data_finalizacao", "valor_servicos",
            "valor_materiais", "valor_total", "valor_pago", "valor_pendente",
            "cliente", "pagamentos", "materiais_utilizados"
        ]

    def get_valor_servicos(self, obj):
        total = obj.servicos.aggregate(total=Sum('preco'))['total'] or Decimal('0.00')
        return total.quantize(Decimal('0.01'))

    def get_valor_materiais(self, obj):
        total = Decimal('0.00')
        for mu in obj.materiais_utilizados.all().select_related('material'):
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

    def create(self, validated_data):
        with transaction.atomic():
            servicos_data = validated_data.pop('servicos_ids', [])
            materiais_para_adicionar_data = validated_data.pop('materiais_para_adicionar', [])

            if 'request' in self.context:
                validated_data['profissional'] = self.context['request'].user
            else:
                 raise serializers.ValidationError("Contexto da requisição não encontrado.")

            ordem_de_servico = OrdemDeServico.objects.create(**validated_data)

            if servicos_data:
                ordem_de_servico.servicos.set(servicos_data)

            materiais_utilizados_criados = []
            for material_item in materiais_para_adicionar_data:
                try:
                    mu = MaterialUtilizado.objects.create(
                        ordem_de_servico=ordem_de_servico,
                        material_id=material_item['material_id'], 
                        quantidade=material_item['quantidade']
                    )
                    materiais_utilizados_criados.append(mu)
                except Exception as e:
                    print(f"Erro ao criar MaterialUtilizado: {e}")

            ordem_de_servico.calcular_e_salvar_total() 

            return ordem_de_servico
        
    def update(self, instance, validated_data):
        with transaction.atomic():
            
            servicos_data = validated_data.pop('servicos', None)
            if servicos_data is not None:
                instance.servicos.set(servicos_data)

            materiais_data = validated_data.pop('materiais_utilizados', None)
            if materiais_data is not None:
                instance.materiais_utilizados.all().delete() 
                for material_item_data in materiais_data:
                    MaterialUtilizado.objects.create(ordem_de_servico=instance, **material_item_data)

            for attr, value in validated_data.items():
                setattr(instance, attr, value)
            instance.save()
            instance.calcular_e_salvar_total()

            return instance
    
    def get_status(self, obj):

        status_real = obj.status

        if (status_real == 'AB' and 
            obj.data_agendamento and 
            timezone.now() >= obj.data_agendamento):
            
            return 'EA'

        return status_real
    
    def validate(self, attrs):
        profissional = self.context['request'].user
        instance = self.instance 


        new_start = attrs.get('data_agendamento')
        if new_start is None and instance:
            new_start = instance.data_agendamento
        duracao_horas = attrs.get('duracao_estimada_horas')

        if duracao_horas is None and instance:
            duracao_horas = instance.duracao_estimada_horas

        instance_pk = instance.pk if instance else None 

        new_end = None
        if new_start and duracao_horas:
            try:
                duracao_td = timedelta(hours=float(duracao_horas))
                if duracao_td <= timedelta(0):
                        new_start = None 
                else:
                        new_end = new_start + duracao_td
            except (ValueError, TypeError):
                new_start = None 

        if not new_start or not new_end:
            return attrs 

        conflict_query = OrdemDeServico.objects.filter(
            profissional=profissional,
            data_agendamento__isnull=False,
            duracao_estimada_horas__isnull=False 
        ).exclude(
            status__in=['CA', 'FN', 'PG']
        )

        if instance_pk:
            conflict_query = conflict_query.exclude(pk=instance_pk)

        potential_conflicts = conflict_query.filter(
            Q(data_agendamento__lt=new_end) 
        ).select_related('cliente')

        found_conflict = None
        for existing_os in potential_conflicts:
            existing_start = existing_os.data_agendamento
            existing_end = None
            try:
                existing_duracao_td = timedelta(hours=float(existing_os.duracao_estimada_horas))
                if existing_duracao_td > timedelta(0):
                    existing_end = existing_start + existing_duracao_td
            except (ValueError, TypeError):
                continue 

            if not existing_end:
                continue 

            if existing_start < new_end and new_start < existing_end:
                found_conflict = existing_os
                break

        if found_conflict:
            local_start_time = timezone.localtime(found_conflict.data_agendamento)
            raise serializers.ValidationError(
                f"Conflito de agendamento: Horário sobreposto com a OS #{found_conflict.id} "
                f"({found_conflict.cliente.nome if found_conflict.cliente else 'Cliente desconhecido'}) "
                f"agendada para {local_start_time.strftime('%d/%m/%Y %H:%M')}."
            )

        return attrs
    
class AgendaOrdemSerializer(serializers.ModelSerializer):
    title = serializers.SerializerMethodField()
    start = serializers.DateTimeField(source='data_agendamento', read_only=True)
    url = serializers.SerializerMethodField()
    color = serializers.SerializerMethodField()
    end = serializers.SerializerMethodField()
    status = serializers.SerializerMethodField()

    class Meta:
        model = OrdemDeServico
        fields = [
            'id',
            'title',
            'start',
            'end',
            'url',
            'color',
            'status'
        ]

    def get_status(self, obj):
        status_real = obj.status
        if (status_real == 'AB' and 
            obj.data_agendamento and 
            timezone.now() >= obj.data_agendamento):
            return 'EA'
        return status_real
    
    def get_title(self, obj):
        if obj.cliente:
            return f"OS #{obj.id} - {obj.cliente.nome}"
        return f"OS #{obj.id}"
    
    def get_end(self, obj):

        if obj.data_agendamento and obj.duracao_estimada_horas:
            try:
                duracao = timedelta(hours=float(obj.duracao_estimada_horas))
                return obj.data_agendamento + duracao
            except Exception:
                return None
        return None

    def get_url(self, obj):
        return f"/ordens/{obj.id}"
    
    def get_color(self, obj):
        status_calculado = self.get_status(obj)
        
        if status_calculado == 'AB':
            return '#0288d1'
        elif status_calculado == 'EA':
            return '#ed6c02'
        elif status_calculado == 'FN':
            return '#ed6c02' 
        elif status_calculado == 'PG':
            return '#2e7d32'
        elif status_calculado == 'CA':
            return '#d32f2f' 
        return '#9e9e9e'


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
