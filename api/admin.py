# api/admin.py
from django.contrib import admin
from .models import Cliente, Servico, Material, OrdemDeServico, Pagamento, MaterialUtilizado

admin.site.register(Cliente)
admin.site.register(Servico)
admin.site.register(Material)
admin.site.register(OrdemDeServico)
admin.site.register(Pagamento)
admin.site.register(MaterialUtilizado)

# Register your models here.
