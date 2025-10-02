from django.db import models
from django.contrib.auth.models import User

class Servico(models.Model):
    profissional = models.ForeignKey(User, on_delete=models.CASCADE, related_name='servicos')
    nome = models.CharField(max_length=100)
    descricao = models.TextField(blank=True)
    preco = models.DecimalField(max_digits=10, decimal_places=2)

    def __str__(self):
        return self.nome

class Cliente(models.Model):
    profissional = models.ForeignKey(User, on_delete=models.CASCADE, related_name='clientes')
    nome = models.CharField(max_length=100)
    email = models.EmailField(blank=True)
    telefone = models.CharField(max_length=20, blank=True)
    endereco = models.CharField(max_length=255, blank=True)
    data_criacao = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.nome
class Material(models.Model):
    profissional = models.ForeignKey(User, on_delete=models.CASCADE, related_name='materiais')
    nome = models.CharField(max_length=100)
    descricao = models.TextField(blank=True)
    preco_unidade = models.DecimalField(max_digits=10, decimal_places=2)

    def __str__(self):
        return f"{self.nome} (R$ {self.preco_unidade})"


class MaterialUtilizado(models.Model):
    ordem_de_servico = models.ForeignKey('OrdemDeServico', on_delete=models.CASCADE, related_name='materiais_utilizados')
    material = models.ForeignKey(Material, on_delete=models.CASCADE)
    quantidade = models.PositiveIntegerField()

    def __str__(self):
        return f"{self.quantidade}x {self.material.nome} na OS #{self.ordem_de_servico.id}"



class OrdemDeServico(models.Model):
    STATUS_CHOICES = [
        ('AB', 'Aberta'),
        ('EA', 'Em Andamento'),
        ('FN', 'Finalizada'),
        ('PG', 'Paga'), 
        ('CA', 'Cancelada'),
    ]
    profissional = models.ForeignKey(User, on_delete=models.CASCADE, related_name='ordens_de_servico')
    cliente = models.ForeignKey(Cliente, on_delete=models.PROTECT, related_name='ordens_de_servico')
    servicos = models.ManyToManyField(Servico)
    materiais = models.ManyToManyField(Material, through=MaterialUtilizado)

    status = models.CharField(max_length=2, choices=STATUS_CHOICES, default='AB')
    data_abertura = models.DateTimeField(auto_now_add=True)
    data_finalizacao = models.DateTimeField(null=True, blank=True)
    valor_total = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)

    def calcular_e_salvar_total(self):
        total_servicos = sum(servico.preco for servico in self.servicos.all())

        total_materiais = sum(
            item.material.preco_unidade * item.quantidade 
            for item in self.materiais_utilizados.all() 
        )
        self.valor_total = total_servicos + total_materiais
        self.save(update_fields=['valor_total'])

    def __str__(self):
        return f"Os #{self.id} - {self.cliente.nome} - {self.get_status_display()}"
class Pagamento(models.Model):
    FORMAS_PAGAMENTO = [
        ('PIX', 'Pix'),
        ('DIN', 'Dinheiro'),
        ('CC', 'Cartão de Crédito'),
        ('CD', 'Cartão de Débito'),
        ('BOL', 'Boleto'),
    ]

    # Relacionamento: Cada pagamento pertence a uma única OS
    ordem_de_servico = models.ForeignKey(OrdemDeServico, on_delete=models.CASCADE, related_name='pagamentos')
    
    valor_pago = models.DecimalField(max_digits=10, decimal_places=2)
    forma_pagamento = models.CharField(max_length=3, choices=FORMAS_PAGAMENTO)
    data_pagamento = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Pagamento de R$ {self.valor_pago} para a OS #{self.ordem_de_servico.id}"