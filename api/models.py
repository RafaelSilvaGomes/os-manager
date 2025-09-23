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
class OrdemDeServico(models.Model):
    STATUS_CHOICES = [
        ('AB', 'Aberta'),
        ('EA', 'Em Andamento'),
        ('FN', 'Finalizada'),
        ('CA', 'Cancelada'),
    ]
    profissional = models.ForeignKey(User, on_delete=models.CASCADE, related_name='ordens_de_servico')
    cliente = models.ForeignKey(Cliente, on_delete=models.PROTECT, related_name='ordens_de_servico')
    servicos = models.ManyToManyField(Servico)

    status = models.CharField(max_length=2, choices=STATUS_CHOICES, default='AB')
    data_abertura = models.DateTimeField(auto_now_add=True)
    data_finalizacao = models.DateTimeField(null=True, blank=True)
    valor_total = models.DecimalField(max_digits=10, decimal_places=2, help_text="Soma dos preços dos serviços")

    def __str__(self):
        return f"Os #{self.id} - {self.cliente.nome} - {self.get_status_display()}"