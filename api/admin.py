# api/admin.py
from django.contrib import admin
from .models import Cliente, Servico, Material, OrdemDeServico, Pagamento, MaterialUtilizado

class ClienteAdmin(admin.ModelAdmin):
    list_display = ('nome', 'telefone', 'endereco', 'profissional')
    search_fields = ('nome', 'telefone', 'endereco')
    
class MaterialAdmin(admin.ModelAdmin):
    list_display = ('nome', 'unidade_medida', 'preco_unidade', 'profissional')
    search_fields = ('nome', 'descricao')
    list_filter = ('unidade_medida',)

admin.site.unregister(Cliente) if admin.site.is_registered(Cliente) else None
admin.site.register(Cliente, ClienteAdmin)
admin.site.register(Servico)
admin.site.register(Material, MaterialAdmin)
admin.site.register(OrdemDeServico)
admin.site.register(Pagamento)
admin.site.register(MaterialUtilizado)