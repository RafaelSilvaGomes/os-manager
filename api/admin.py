# api/admin.py
from django.contrib import admin
from .models import Cliente, Servico, Material, OrdemDeServico, Pagamento, MaterialUtilizado

class ClienteAdmin(admin.ModelAdmin):
    list_display = ('nome', 'telefone', 'endereco', 'profissional')
    search_fields = ('nome', 'telefone', 'endereco')

admin.site.unregister(Cliente) if admin.site.is_registered(Cliente) else None
admin.site.register(Cliente, ClienteAdmin)
admin.site.register(Servico)
admin.site.register(Material)
admin.site.register(OrdemDeServico)
admin.site.register(Pagamento)
admin.site.register(MaterialUtilizado)