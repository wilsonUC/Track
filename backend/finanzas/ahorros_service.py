"""Cálculos del pool de ahorros del usuario.

Modelo:
- Los ahorros se acumulan como transacciones tipo `saving` (sin meta).
- Cada `AsignacionMeta` reparte parte de ese total hacia una meta.
- Solo las metas con `es_asignacion_libre=False` consumen el fondo de Ahorros.
- Libre = total ahorrado - total asignado formal.
- Al apartar ahorro nuevo el tope es el saldo disponible histórico:
  (todos los ingresos - todos los gastos - todo lo ya ahorrado).
"""

from __future__ import annotations

from decimal import Decimal

from django.db.models import Sum

from .models import AsignacionMeta, Transaction


def _dec(value) -> Decimal:
    return value if isinstance(value, Decimal) else Decimal(str(value or 0))


def total_ahorrado(user) -> Decimal:
    total = (
        Transaction.objects.filter(usuario=user, tipo=Transaction.Tipo.AHORRO)
        .aggregate(total=Sum("monto"))["total"]
    )
    return _dec(total)


def total_asignado(user) -> Decimal:
    total = (
        AsignacionMeta.objects.filter(usuario=user, meta__es_asignacion_libre=False)
        .aggregate(total=Sum("monto"))["total"]
    )
    return _dec(total)


def ahorro_libre(user) -> Decimal:
    libre = total_ahorrado(user) - total_asignado(user)
    return libre if libre > 0 else Decimal("0")


def saldo_disponible_total(user) -> Decimal:
    """Ingresos históricos - gastos históricos - ahorros ya apartados.

    Es el tope para apartar nuevos ahorros (balance total aún no guardado).
    """
    qs = Transaction.objects.filter(usuario=user)
    ingresos = _dec(qs.filter(tipo=Transaction.Tipo.INGRESO).aggregate(t=Sum("monto"))["t"])
    gastos = _dec(qs.filter(tipo=Transaction.Tipo.GASTO).aggregate(t=Sum("monto"))["t"])
    ahorros = _dec(qs.filter(tipo=Transaction.Tipo.AHORRO).aggregate(t=Sum("monto"))["t"])
    disponible = ingresos - gastos - ahorros
    return disponible if disponible > 0 else Decimal("0")


# Alias de compatibilidad: el tope ya no es solo del mes.
def saldo_disponible_mes(user, reference=None) -> Decimal:  # noqa: ARG001
    return saldo_disponible_total(user)


def sincronizar_ahorros_metas(user):
    """Garantiza que el fondo de ahorros cubra las metas formales asignadas si hay saldo disponible."""
    from datetime import date
    total_formal = total_asignado(user)
    total_ahorros = total_ahorrado(user)
    deficit = total_formal - total_ahorros
    if deficit > Decimal("0"):
        disponible = saldo_disponible_total(user)
        monto_a_crear = min(deficit, disponible)
        if monto_a_crear > Decimal("0"):
            Transaction.objects.create(
                usuario=user,
                tipo=Transaction.Tipo.AHORRO,
                monto=monto_a_crear,
                fecha=date.today(),
                descripcion="Ahorro formalizado para metas",
            )


def resumen_ahorros(user) -> dict:
    sincronizar_ahorros_metas(user)
    total = total_ahorrado(user)
    asignado = total_asignado(user)
    disponible = saldo_disponible_total(user)
    libre = total - asignado
    if libre < 0:
        libre = Decimal("0")
    return {
        "total": total,
        "asignado": asignado,
        "libre": libre,
        "disponible": disponible,
        # Compatibilidad con clientes que aún lean disponible_mes
        "disponible_mes": disponible,
    }


def validar_limite_saldo(
    user,
    tipo,
    monto,
    transaccion_id=None,
    meta_liberar_id=None,
    liberar_de_ahorro_libre=False,
):
    """
    Si el usuario tiene activado 'limitar_saldo_negativo', valida que la transacción
    no deje el saldo neto en negativo ni lo empeore si ya era negativo.
    Permite liberar fondos de una meta o del ahorro libre si se especifica.
    """
    from .models import PreferenciasUsuario, Transaction, AsignacionMeta, MetaAhorro
    from django.db.models import Sum
    from rest_framework.exceptions import ValidationError

    preferencias, _ = PreferenciasUsuario.objects.get_or_create(usuario=user)
    if not preferencias.limitar_saldo_negativo:
        return

    # Ingresos siempre están permitidos (mejoran o mantienen el saldo)
    if tipo == Transaction.Tipo.INGRESO:
        return

    # Calcular el saldo neto actual (Ingresos - Gastos - Ahorros)
    qs = Transaction.objects.filter(usuario=user)
    ingresos = _dec(qs.filter(tipo=Transaction.Tipo.INGRESO).aggregate(t=Sum("monto"))["t"])
    gastos = _dec(qs.filter(tipo=Transaction.Tipo.GASTO).aggregate(t=Sum("monto"))["t"])
    ahorros = _dec(qs.filter(tipo=Transaction.Tipo.AHORRO).aggregate(t=Sum("monto"))["t"])
    current_net_balance = ingresos - gastos - ahorros

    # Calcular saldo base excluyendo la transacción a modificar
    net_balance_without_original = current_net_balance
    if transaccion_id:
        try:
            original = Transaction.objects.get(pk=transaccion_id)
            if original.tipo == Transaction.Tipo.INGRESO:
                net_balance_without_original -= original.monto
            elif original.tipo in (Transaction.Tipo.GASTO, Transaction.Tipo.AHORRO):
                net_balance_without_original += original.monto
        except Transaction.DoesNotExist:
            pass

    # Calcular el saldo neto futuro
    future_balance = net_balance_without_original - _dec(monto)

    # Bloquear si el saldo futuro es negativo Y empeora el saldo actual
    if future_balance < 0 and future_balance < current_net_balance:
        faltante = _dec(monto) - max(Decimal("0"), net_balance_without_original)
        if faltante <= Decimal("0"):
            faltante = _dec(monto)

        # Caso 1: Usuario solicitó liberar de una meta específica
        if meta_liberar_id:
            meta = MetaAhorro.objects.filter(id=meta_liberar_id, usuario=user).first()
            if not meta:
                raise ValidationError({"detalle": "La meta seleccionada no existe."})
            asig = AsignacionMeta.objects.filter(meta=meta).first()
            if not asig or asig.monto < faltante:
                disponible_meta = asig.monto if asig else Decimal("0")
                raise ValidationError({
                    "detalle": f"La meta '{meta.nombre}' solo tiene S/ {disponible_meta:.2f} acumulados, pero se requieren S/ {faltante:.2f}."
                })
            # Desasignar de la meta
            asig.monto -= faltante
            asig.save(update_fields=["monto", "actualizado_en"])
            # Reducir ahorro del pool
            monto_restante = faltante
            for tx in Transaction.objects.filter(usuario=user, tipo=Transaction.Tipo.AHORRO).order_by("-fecha", "-id"):
                if tx.monto <= monto_restante:
                    monto_restante -= tx.monto
                    tx.delete()
                else:
                    tx.monto -= monto_restante
                    tx.save(update_fields=["monto"])
                    monto_restante = Decimal("0")
                if monto_restante <= Decimal("0"):
                    break
            return

        # Caso 2: Usuario solicitó liberar de Ahorro Libre
        if liberar_de_ahorro_libre:
            libre = ahorro_libre(user)
            if libre < faltante:
                raise ValidationError({
                    "detalle": f"Solo tienes S/ {libre:.2f} en Ahorro Libre, pero se requieren S/ {faltante:.2f}."
                })
            # Reducir ahorro del pool
            monto_restante = faltante
            for tx in Transaction.objects.filter(usuario=user, tipo=Transaction.Tipo.AHORRO).order_by("-fecha", "-id"):
                if tx.monto <= monto_restante:
                    monto_restante -= tx.monto
                    tx.delete()
                else:
                    tx.monto -= monto_restante
                    tx.save(update_fields=["monto"])
                    monto_restante = Decimal("0")
                if monto_restante <= Decimal("0"):
                    break
            return

        # Caso 3: No se especificó liberación -> Retornar error estructurado con opciones
        metas_opciones = []
        for asig in AsignacionMeta.objects.filter(
            usuario=user, monto__gt=0, meta__es_asignacion_libre=False
        ).select_related("meta"):
            metas_opciones.append({
                "id": asig.meta.id,
                "nombre": asig.meta.nombre,
                "monto_disponible": float(asig.monto),
            })
        libre_ahorros = float(ahorro_libre(user))
        total_ahorros_disp = float(total_ahorrado(user))

        raise ValidationError({
            "codigo": "saldo_insuficiente_con_ahorros",
            "saldo_actual": float(max(Decimal("0"), current_net_balance)),
            "faltante": float(faltante),
            "monto_gasto": float(monto),
            "libre_ahorros": libre_ahorros,
            "total_ahorros": total_ahorros_disp,
            "metas": metas_opciones,
            "detalle": f"Saldo disponible insuficiente (S/ {max(Decimal('0'), current_net_balance):.2f}). Te faltan S/ {faltante:.2f} para este gasto.",
        })
