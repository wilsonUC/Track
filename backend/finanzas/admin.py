from django.contrib import admin

from .models import Category, PerfilUsuario, Transaction


@admin.register(Category)
class CategoryAdmin(admin.ModelAdmin):
    list_display = ('nombre', 'tipo')
    list_filter = ('tipo',)
    search_fields = ('nombre',)


@admin.register(Transaction)
class TransactionAdmin(admin.ModelAdmin):
    list_display = ('usuario', 'tipo', 'monto', 'fecha', 'categoria')
    list_filter = ('tipo', 'fecha')
    search_fields = ('usuario__username', 'descripcion')


@admin.register(PerfilUsuario)
class PerfilUsuarioAdmin(admin.ModelAdmin):
    list_display = ('usuario', 'telefono', 'estado_cuenta')
    list_filter = ('estado_cuenta',)
    search_fields = ('usuario__username', 'usuario__email', 'telefono')
