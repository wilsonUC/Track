from rest_framework_simplejwt.authentication import JWTAuthentication
from rest_framework_simplejwt.exceptions import AuthenticationFailed
from .models import PerfilUsuario


class FinanzasJWTAuthentication(JWTAuthentication):
    """Autenticación JWT que valida estado activo y vigencia en cada solicitud."""

    def get_user(self, validated_token):
        user = super().get_user(validated_token)
        if not user or not user.is_active:
            raise AuthenticationFailed("Usuario inactivo o no encontrado.")

        # Superusuarios y staff tienen acceso continuo
        if user.is_staff or user.is_superuser:
            return user

        try:
            perfil = user.perfil
            if perfil.estado_cuenta == PerfilUsuario.EstadoCuenta.PENDIENTE:
                raise AuthenticationFailed("Tu cuenta está pendiente de aprobación.")
            if perfil.estado_cuenta == PerfilUsuario.EstadoCuenta.BLOQUEADA:
                raise AuthenticationFailed("Tu cuenta está bloqueada. Contacta al administrador.")
            if perfil.is_expired:
                raise AuthenticationFailed(
                    "Tu periodo de acceso ha expirado. Contacta al administrador para renovar tu suscripción."
                )
        except PerfilUsuario.DoesNotExist:
            raise AuthenticationFailed("Perfil de usuario no encontrado.")

        return user
