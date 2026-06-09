# =============================================================================
# URLs de la app "finanzas": enlazan direcciones (paths) con las vistas (ViewSets).
# El router crea automáticamente rutas para listar, crear, ver una, editar, borrar.
# =============================================================================

from django.urls import include, path
from rest_framework.routers import DefaultRouter

from .views import CategoryViewSet, PerfilView, RegistroView, TransactionViewSet

# Router: registra cada ViewSet bajo un prefijo.
router = DefaultRouter()
router.register(r"categorias", CategoryViewSet, basename="categoria")
router.register(r"transacciones", TransactionViewSet, basename="transaccion")

urlpatterns = [
    # Todas las rutas del router van debajo de lo que pongas en config/urls (p. ej. "api/")
    path("perfil/", PerfilView.as_view(), name="perfil"),
    path("registro/", RegistroView.as_view(), name="registro"),
    path("", include(router.urls)),
]
