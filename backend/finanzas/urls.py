# =============================================================================
# URLs de la app "finanzas": enlazan direcciones (paths) con las vistas (ViewSets).
# El router crea automáticamente rutas para listar, crear, ver una, editar, borrar.
# =============================================================================

from django.urls import include, path
from rest_framework.routers import DefaultRouter

from .views import (
    AdminUsuarioDetalleView,
    AdminUsuariosView,
    CategoryViewSet,
    CambioPasswordView,
    IaChatView,
    ConsejosView,
    MetaViewSet,
    PerfilView,
    PresupuestoViewSet,
    RecurrenteViewSet,
    RegistroView,
    ResetDatosView,
    TransactionViewSet,
)

# Router: registra cada ViewSet bajo un prefijo.
router = DefaultRouter()
router.register(r"categorias", CategoryViewSet, basename="categoria")
router.register(r"transacciones", TransactionViewSet, basename="transaccion")
router.register(r"presupuestos", PresupuestoViewSet, basename="presupuesto")
router.register(r"recurrentes", RecurrenteViewSet, basename="recurrente")
router.register(r"metas", MetaViewSet, basename="meta")

urlpatterns = [
    # Todas las rutas del router van debajo de lo que pongas en config/urls (p. ej. "api/")
    path("admin/usuarios/", AdminUsuariosView.as_view(), name="admin-usuarios"),
    path("admin/usuarios/<int:user_id>/", AdminUsuarioDetalleView.as_view(), name="admin-usuario-detalle"),
    path("ia/chat/", IaChatView.as_view(), name="ia-chat"),
    path("consejos/", ConsejosView.as_view(), name="consejos"),
    path("perfil/", PerfilView.as_view(), name="perfil"),
    path("perfil/cambiar-password/", CambioPasswordView.as_view(), name="perfil-cambiar-password"),
    path("perfil/resetear-datos/", ResetDatosView.as_view(), name="perfil-resetear-datos"),
    path("registro/", RegistroView.as_view(), name="registro"),
    path("", include(router.urls)),
]
