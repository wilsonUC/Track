"""Tests de API: auth, transacciones, presupuestos, recurrentes, ahorros y metas."""

from datetime import date, timedelta
from decimal import Decimal

from django.contrib.auth import get_user_model
from rest_framework import status
from rest_framework.test import APITestCase
from rest_framework_simplejwt.tokens import RefreshToken

from .models import Category, PerfilUsuario, Presupuesto, Transaction, PreferenciasUsuario, Recurrente

User = get_user_model()


class FinanzasAPITestCase(APITestCase):
    """Helpers compartidos para crear usuarios autenticados y categorías."""

    def crear_usuario(
        self,
        *,
        username="usuario",
        password="clavesegura1",
        telefono="999111000",
        estado=PerfilUsuario.EstadoCuenta.ACTIVA,
        tipo_cuenta=PerfilUsuario.TipoCuenta.AVANZADO,
        is_staff=False,
    ):
        user = User.objects.create_user(
            username=username,
            email=f"{username}@test.com",
            password=password,
            first_name="Test",
            last_name="User",
            is_staff=is_staff,
        )
        PerfilUsuario.objects.create(
            usuario=user,
            telefono=telefono,
            estado_cuenta=estado,
            tipo_cuenta=tipo_cuenta,
        )
        return user

    def autenticar(self, user):
        token = RefreshToken.for_user(user).access_token
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {token}")

    def crear_categorias(self):
        self.cat_ingreso = Category.objects.create(nombre="Sueldo", tipo=Category.Tipo.INGRESO)
        self.cat_gasto = Category.objects.create(nombre="Comida", tipo=Category.Tipo.GASTO)


class AuthYRegistroTests(FinanzasAPITestCase):
    def test_registro_crea_cuenta_pendiente(self):
        response = self.client.post(
            "/api/registro/",
            {
                "username": "nuevo",
                "first_name": "Ana",
                "last_name": "Pérez",
                "email": "ana@test.com",
                "telefono": "987654321",
                "password": "clavesegura1",
            },
            format="json",
        )
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        user = User.objects.get(username="nuevo")
        self.assertEqual(user.perfil.estado_cuenta, PerfilUsuario.EstadoCuenta.PENDIENTE)

    def test_login_rechaza_cuenta_pendiente(self):
        self.crear_usuario(
            username="pendiente",
            telefono="900000001",
            estado=PerfilUsuario.EstadoCuenta.PENDIENTE,
        )
        response = self.client.post(
            "/api/token/",
            {"username": "pendiente", "password": "clavesegura1"},
            format="json",
        )
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_login_acepta_cuenta_activa(self):
        self.crear_usuario(username="activo", telefono="900000002")
        response = self.client.post(
            "/api/token/",
            {"username": "activo", "password": "clavesegura1"},
            format="json",
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn("access", response.data)
        self.assertIn("refresh", response.data)

    def test_endpoint_protegido_sin_token(self):
        response = self.client.get("/api/transacciones/")
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)


class TransaccionesTests(FinanzasAPITestCase):
    def setUp(self):
        self.user = self.crear_usuario(username="finuser", telefono="900000010")
        self.crear_categorias()
        self.autenticar(self.user)

    def test_crear_ingreso_y_gasto(self):
        ingreso = self.client.post(
            "/api/transacciones/",
            {
                "categoria": self.cat_ingreso.id,
                "tipo": "income",
                "monto": "1500.00",
                "fecha": str(date.today()),
                "descripcion": "Sueldo",
            },
            format="json",
        )
        self.assertEqual(ingreso.status_code, status.HTTP_201_CREATED)

        gasto = self.client.post(
            "/api/transacciones/",
            {
                "categoria": self.cat_gasto.id,
                "tipo": "expense",
                "monto": "50.00",
                "fecha": str(date.today()),
                "descripcion": "Almuerzo",
            },
            format="json",
        )
        self.assertEqual(gasto.status_code, status.HTTP_201_CREATED)

        lista = self.client.get("/api/transacciones/")
        self.assertEqual(lista.status_code, status.HTTP_200_OK)
        self.assertEqual(len(lista.data), 2)

    def test_no_ve_transacciones_de_otro_usuario(self):
        otro = self.crear_usuario(username="otro", telefono="900000011")
        Transaction.objects.create(
            usuario=otro,
            categoria=self.cat_ingreso,
            tipo=Transaction.Tipo.INGRESO,
            monto=Decimal("100.00"),
            fecha=date.today(),
        )
        lista = self.client.get("/api/transacciones/")
        self.assertEqual(lista.status_code, status.HTTP_200_OK)
        self.assertEqual(len(lista.data), 0)


class PresupuestoTests(FinanzasAPITestCase):
    def setUp(self):
        self.user = self.crear_usuario(username="presu", telefono="900000020")
        self.crear_categorias()
        self.autenticar(self.user)

    def test_crear_presupuesto_y_gasto_rapido(self):
        crear = self.client.post(
            "/api/presupuestos/",
            {
                "nombre": "Pasajes",
                "limite": "200.00",
                "monto_rapido": "10.00",
                "categoria_referencia": self.cat_gasto.id,
            },
            format="json",
        )
        self.assertEqual(crear.status_code, status.HTTP_201_CREATED)
        presupuesto_id = crear.data["id"]

        rapido = self.client.post(f"/api/presupuestos/{presupuesto_id}/gasto-rapido/")
        self.assertEqual(rapido.status_code, status.HTTP_200_OK)
        self.assertEqual(Decimal(str(rapido.data["gastado"])), Decimal("10.00"))

        txs = Transaction.objects.filter(usuario=self.user, tipo=Transaction.Tipo.GASTO)
        self.assertEqual(txs.count(), 1)
        self.assertEqual(txs.first().presupuesto_id, presupuesto_id)

    def test_desactivar_reactivar_y_eliminar_presupuesto(self):
        presupuesto = Presupuesto.objects.create(
            usuario=self.user,
            nombre="Comida",
            limite=Decimal("300.00"),
            monto_rapido=Decimal("20.00"),
        )
        # 1. Desactivar presupuesto via PATCH
        resp_patch = self.client.patch(f"/api/presupuestos/{presupuesto.id}/", {"activo": False}, format="json")
        self.assertEqual(resp_patch.status_code, status.HTTP_200_OK)
        presupuesto.refresh_from_db()
        self.assertFalse(presupuesto.activo)

        # 2. No aparece en lista por defecto
        lista = self.client.get("/api/presupuestos/")
        self.assertEqual(len(lista.data), 0)

        # 3. Aparece si se solicita incluir_inactivos
        lista_inactivos = self.client.get("/api/presupuestos/?incluir_inactivos=true")
        self.assertEqual(len(lista_inactivos.data), 1)

        # 4. Info eliminacion
        resp_info = self.client.get(f"/api/presupuestos/{presupuesto.id}/info-eliminacion/")
        self.assertEqual(resp_info.status_code, status.HTTP_200_OK)
        self.assertEqual(resp_info.data["num_transacciones"], 0)

        # 5. Eliminacion permanente
        response = self.client.delete(f"/api/presupuestos/{presupuesto.id}/")
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
        self.assertFalse(Presupuesto.objects.filter(id=presupuesto.id).exists())


class RecurrenteTests(FinanzasAPITestCase):
    def setUp(self):
        self.user = self.crear_usuario(username="recur", telefono="900000030")
        self.crear_categorias()
        self.autenticar(self.user)

    def test_registrar_pago_recurrente(self):
        crear = self.client.post(
            "/api/recurrentes/",
            {
                "nombre": "Netflix",
                "monto": "40.00",
                "tipo": "expense",
                "dia_pago": 15,
                "categoria": self.cat_gasto.id,
            },
            format="json",
        )
        self.assertEqual(crear.status_code, status.HTTP_201_CREATED)
        recurrente_id = crear.data["id"]

        pago = self.client.post(
            f"/api/recurrentes/{recurrente_id}/registrar-pago/",
            {},
            format="json",
        )
        self.assertEqual(pago.status_code, status.HTTP_200_OK)
        self.assertTrue(pago.data["registrado_mes"])

        duplicado = self.client.post(
            f"/api/recurrentes/{recurrente_id}/registrar-pago/",
            {},
            format="json",
        )
        self.assertEqual(duplicado.status_code, status.HTTP_400_BAD_REQUEST)

    def test_recurrente_periodo_activo_e_inactivo(self):
        # Recurrente que ya terminó el mes pasado
        mes_pasado = date.today().replace(day=1) - timedelta(days=1)
        crear_finalizado = self.client.post(
            "/api/recurrentes/",
            {
                "nombre": "Prestamo Expirado",
                "monto": "100.00",
                "tipo": "expense",
                "dia_pago": 5,
                "categoria": self.cat_gasto.id,
                "fecha_inicio": "2020-01-01",
                "fecha_fin": mes_pasado.strftime("%Y-%m-%d"),
            },
            format="json",
        )
        self.assertEqual(crear_finalizado.status_code, status.HTTP_201_CREATED)
        self.assertFalse(crear_finalizado.data["activo_en_mes"])
        self.assertEqual(crear_finalizado.data["estado_periodo"], "finalizado")
        self.assertFalse(crear_finalizado.data["vencido"])

        # Recurrente que empieza el mes que viene
        mes_siguiente = (date.today().replace(day=28) + timedelta(days=10)).replace(day=1)
        crear_futuro = self.client.post(
            "/api/recurrentes/",
            {
                "nombre": "Gym Futuro",
                "monto": "80.00",
                "tipo": "expense",
                "dia_pago": 10,
                "categoria": self.cat_gasto.id,
                "fecha_inicio": mes_siguiente.strftime("%Y-%m-%d"),
            },
            format="json",
        )
        self.assertEqual(crear_futuro.status_code, status.HTTP_201_CREATED)
        self.assertFalse(crear_futuro.data["activo_en_mes"])
        self.assertEqual(crear_futuro.data["estado_periodo"], "no_iniciado")
        self.assertFalse(crear_futuro.data["vencido"])

        # Validación: inicio no puede ser posterior a fin
        crear_invalido = self.client.post(
            "/api/recurrentes/",
            {
                "nombre": "Invalido",
                "monto": "50.00",
                "tipo": "expense",
                "dia_pago": 10,
                "categoria": self.cat_gasto.id,
                "fecha_inicio": "2026-12-31",
                "fecha_fin": "2026-01-01",
            },
            format="json",
        )
        self.assertEqual(crear_invalido.status_code, status.HTTP_400_BAD_REQUEST)

    def test_cuentas_atrasadas_y_pago_mes_especifico(self):
        # Recurrente con fecha_inicio en el mes pasado
        primer_dia_este_mes = date.today().replace(day=1)
        fecha_hace_un_mes = (primer_dia_este_mes - timedelta(days=1)).replace(day=1)
        crear = self.client.post(
            "/api/recurrentes/",
            {
                "nombre": "Servicio Luz",
                "monto": "150.00",
                "tipo": "expense",
                "dia_pago": 10,
                "categoria": self.cat_gasto.id,
                "fecha_inicio": fecha_hace_un_mes.strftime("%Y-%m-%d"),
            },
            format="json",
        )
        self.assertEqual(crear.status_code, status.HTTP_201_CREATED)
        recurrente_id = crear.data["id"]

        # 1. Consultar deudas atrasadas. Debe haber al menos 1 deuda correspondiente al mes pasado
        res = self.client.get("/api/recurrentes/cuentas-atrasadas/")
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        self.assertGreater(len(res.data["deudas"]), 0)
        deuda_item = res.data["deudas"][0]
        self.assertEqual(deuda_item["id_recurrente"], recurrente_id)
        
        # 2. Registrar pago para la fecha de esa deuda
        pago_fecha = deuda_item["fecha_pago"]
        registrar = self.client.post(
            f"/api/recurrentes/{recurrente_id}/registrar-pago/",
            {"fecha": pago_fecha},
            format="json",
        )
        self.assertEqual(registrar.status_code, status.HTTP_200_OK)
        
        # 3. Consultar deudas de nuevo. Esa deuda ya no debe existir
        res_nuevo = self.client.get("/api/recurrentes/cuentas-atrasadas/")
        deudas_restantes = [d for d in res_nuevo.data["deudas"] if d["id_recurrente"] == recurrente_id]
        self.assertEqual(len(deudas_restantes), 0)

    def test_cuentas_atrasadas_con_abonos_parciales(self):
        # Recurrente que permite parciales iniciado el mes pasado
        primer_dia_este_mes = date.today().replace(day=1)
        fecha_hace_un_mes = (primer_dia_este_mes - timedelta(days=1)).replace(day=1)
        crear = self.client.post(
            "/api/recurrentes/",
            {
                "nombre": "Internet Parcial",
                "monto": "100.00",
                "tipo": "expense",
                "dia_pago": 15,
                "categoria": self.cat_gasto.id,
                "permite_parciales": True,
                "fecha_inicio": fecha_hace_un_mes.strftime("%Y-%m-%d"),
            },
            format="json",
        )
        self.assertEqual(crear.status_code, status.HTTP_201_CREATED)
        recurrente_id = crear.data["id"]

        # Abono parcial de 40.00 en el mes pasado
        pago_parcial = self.client.post(
            f"/api/recurrentes/{recurrente_id}/registrar-pago/",
            {"monto": "40.00", "fecha": fecha_hace_un_mes.strftime("%Y-%m-%d")},
            format="json",
        )
        self.assertEqual(pago_parcial.status_code, status.HTTP_200_OK)

        # Deudas atrasadas debe mostrar el saldo restante de 60.00
        res = self.client.get("/api/recurrentes/cuentas-atrasadas/")
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        deudas = [d for d in res.data["deudas"] if d["id_recurrente"] == recurrente_id]
        self.assertEqual(len(deudas), 1)
        self.assertEqual(deudas[0]["acumulado"], 60.00)


class AhorrosYMetasTests(FinanzasAPITestCase):
    def setUp(self):
        self.user = self.crear_usuario(username="ahorro", telefono="900000040")
        self.crear_categorias()
        self.autenticar(self.user)

        # Balance total disponible: ingreso 1000 - gastos 0
        Transaction.objects.create(
            usuario=self.user,
            categoria=self.cat_ingreso,
            tipo=Transaction.Tipo.INGRESO,
            monto=Decimal("1000.00"),
            fecha=date.today(),
        )

    def test_apartar_ahorro_asignar_a_meta_y_resumen(self):
        ahorro = self.client.post(
            "/api/ahorros/",
            {
                "monto": "300.00",
                "fecha": str(date.today()),
                "descripcion": "Ahorro mensual",
            },
            format="json",
        )
        self.assertEqual(ahorro.status_code, status.HTTP_201_CREATED)

        meta = self.client.post(
            "/api/metas/",
            {
                "nombre": "Emergencia",
                "monto_objetivo": "1000.00",
            },
            format="json",
        )
        self.assertEqual(meta.status_code, status.HTTP_201_CREATED)
        meta_id = meta.data["id"]

        asignar = self.client.post(
            f"/api/metas/{meta_id}/asignar/",
            {"monto": "200.00"},
            format="json",
        )
        self.assertEqual(asignar.status_code, status.HTTP_200_OK)
        self.assertEqual(Decimal(str(asignar.data["acumulado"])), Decimal("200.00"))

        resumen = self.client.get("/api/ahorros/resumen/")
        self.assertEqual(resumen.status_code, status.HTTP_200_OK)
        self.assertEqual(Decimal(str(resumen.data["total"])), Decimal("300.00"))
        self.assertEqual(Decimal(str(resumen.data["asignado"])), Decimal("200.00"))
        self.assertEqual(Decimal(str(resumen.data["libre"])), Decimal("100.00"))
        self.assertEqual(Decimal(str(resumen.data["disponible"])), Decimal("700.00"))
        self.assertEqual(Decimal(str(resumen.data["disponible_mes"])), Decimal("700.00"))

    def test_puede_apartar_usando_sobrante_de_meses_anteriores(self):
        """El tope es el balance total, no solo el del mes actual."""
        Transaction.objects.filter(usuario=self.user).delete()

        mes_pasado = date.today().replace(day=1)
        if mes_pasado.month == 1:
            mes_pasado = mes_pasado.replace(year=mes_pasado.year - 1, month=12)
        else:
            mes_pasado = mes_pasado.replace(month=mes_pasado.month - 1)

        Transaction.objects.create(
            usuario=self.user,
            categoria=self.cat_ingreso,
            tipo=Transaction.Tipo.INGRESO,
            monto=Decimal("800.00"),
            fecha=mes_pasado,
        )
        # Mes actual sin movimientos → con tope mensual no podría apartar;
        # con balance total sí puede usar el sobrante histórico.
        ahorro = self.client.post(
            "/api/ahorros/",
            {"monto": "500.00", "fecha": str(date.today())},
            format="json",
        )
        self.assertEqual(ahorro.status_code, status.HTTP_201_CREATED)

        resumen = self.client.get("/api/ahorros/resumen/")
        self.assertEqual(Decimal(str(resumen.data["disponible"])), Decimal("300.00"))

    def test_no_asigna_mas_que_ahorro_libre(self):
        self.client.post(
            "/api/ahorros/",
            {"monto": "100.00", "fecha": str(date.today())},
            format="json",
        )
        meta = self.client.post(
            "/api/metas/",
            {"nombre": "Viaje", "monto_objetivo": "500.00"},
            format="json",
        )
        response = self.client.post(
            f"/api/metas/{meta.data['id']}/asignar/",
            {"monto": "150.00"},
            format="json",
        )
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_meta_periodo_y_ahorro_sugerido(self):
        # Crear meta con fecha_inicio y fecha_limite
        inicio = date.today().strftime("%Y-%m-%d")
        # Fecha límite dentro de 3 meses
        limite = (date.today().replace(day=28) + timedelta(days=90)).strftime("%Y-%m-%d")

        meta = self.client.post(
            "/api/metas/",
            {
                "nombre": "Computadora",
                "monto_objetivo": "1000.00",
                "fecha_inicio": inicio,
                "fecha_limite": limite,
            },
            format="json",
        )
        self.assertEqual(meta.status_code, status.HTTP_201_CREATED)
        self.assertIsNotNone(meta.data["monto_sugerido_mensual"])
        # Debe calcular el monto sugerido mensual: 1000 / meses_restantes
        sugerido = Decimal(str(meta.data["monto_sugerido_mensual"]))
        self.assertGreater(sugerido, Decimal("0"))

        # Validar que fecha_inicio <= fecha_limite
        meta_invalid = self.client.post(
            "/api/metas/",
            {
                "nombre": "Invalida",
                "monto_objetivo": "500.00",
                "fecha_inicio": "2026-12-31",
                "fecha_limite": "2026-01-01",
            },
            format="json",
        )
        self.assertEqual(meta_invalid.status_code, status.HTTP_400_BAD_REQUEST)


class PreferenciasTests(FinanzasAPITestCase):
    def setUp(self):
        self.user = self.crear_usuario(username="prefs", telefono="900000050")
        self.autenticar(self.user)

    def test_obtener_y_actualizar_preferencias(self):
        get_resp = self.client.get("/api/preferencias/")
        self.assertEqual(get_resp.status_code, status.HTTP_200_OK)
        self.assertEqual(get_resp.data["moneda"], "PEN")

        patch_resp = self.client.patch(
            "/api/preferencias/",
            {"tema": "oscuro", "vista_compacta": True, "permitir_asignacion_directa_metas": True},
            format="json",
        )
        self.assertEqual(patch_resp.status_code, status.HTTP_200_OK)
        self.assertEqual(patch_resp.data["tema"], "oscuro")
        self.assertTrue(patch_resp.data["vista_compacta"])
        self.assertTrue(patch_resp.data["permitir_asignacion_directa_metas"])

    def test_asignar_meta_modo_directo(self):
        meta_resp = self.client.post(
            "/api/metas/",
            {"nombre": "Viaje Directo", "monto_objetivo": "1000.00", "es_asignacion_libre": False},
            format="json",
        )
        meta_id = meta_resp.data["id"]

        # En modo formal y sin ahorro libre, falla
        fail_resp = self.client.post(f"/api/metas/{meta_id}/asignar/", {"monto": "200.00"}, format="json")
        self.assertEqual(fail_resp.status_code, status.HTTP_400_BAD_REQUEST)

        # Cambiar a asignación libre
        cambio_resp = self.client.post(f"/api/metas/{meta_id}/cambiar-modo/", {"es_asignacion_libre": True}, format="json")
        self.assertEqual(cambio_resp.status_code, status.HTTP_200_OK)
        self.assertTrue(cambio_resp.data["es_asignacion_libre"])

        # Ahora asignar debe ser exitoso incluso sin ahorro libre
        ok_resp = self.client.post(f"/api/metas/{meta_id}/asignar/", {"monto": "200.00"}, format="json")
        self.assertEqual(ok_resp.status_code, status.HTTP_200_OK)
        self.assertEqual(Decimal(str(ok_resp.data["acumulado"])), Decimal("200.00"))


from unittest.mock import patch

class IAConResilienciaTests(FinanzasAPITestCase):
    def setUp(self):
        self.user = self.crear_usuario(username="ia_res", telefono="900000060")
        self.crear_categorias()
        self.autenticar(self.user)

    @patch("finanzas.consejos_service.request_groq_completion")
    def test_consejos_ia_fallback_local(self, mock_groq):
        mock_groq.side_effect = RuntimeError("Error en Groq")

        response = self.client.get("/api/consejos/")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertTrue(response.data["fallback"])
        self.assertIn("resumen", response.data)
        self.assertGreaterEqual(len(response.data["consejos"]), 4)

    @patch("finanzas.ia_service.request_groq_completion")
    def test_chat_ia_fallback_offline(self, mock_groq):
        mock_groq.side_effect = RuntimeError("Error en Groq")

        response = self.client.post(
            "/api/ia/chat/",
            {"mensaje": "Hola IA"},
            format="json",
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn("asistente avanzado de IA no se encuentra disponible", response.data["respuesta"])


class AdminUsuariosTests(FinanzasAPITestCase):
    def setUp(self):
        self.admin = self.crear_usuario(username="admin_user", telefono="900000080", is_staff=True)
        self.regular = self.crear_usuario(username="regular_user", telefono="900000081", is_staff=False)

    def test_admin_can_list_users(self):
        self.autenticar(self.admin)
        response = self.client.get("/api/admin/usuarios/")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertGreaterEqual(len(response.data), 2)

    def test_regular_user_cannot_list_users(self):
        self.autenticar(self.regular)
        response = self.client.get("/api/admin/usuarios/")
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_admin_can_delete_regular_user(self):
        self.autenticar(self.admin)
        response = self.client.delete(f"/api/admin/usuarios/{self.regular.id}/")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertFalse(User.objects.filter(id=self.regular.id).exists())

    def test_admin_cannot_delete_self(self):
        self.autenticar(self.admin)
        response = self.client.delete(f"/api/admin/usuarios/{self.admin.id}/")
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertTrue(User.objects.filter(id=self.admin.id).exists())

    def test_regular_user_cannot_delete_users(self):
        self.autenticar(self.regular)
        response = self.client.delete(f"/api/admin/usuarios/{self.admin.id}/")
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)


class ControlSaldoEstrictoTests(FinanzasAPITestCase):
    def setUp(self):
        self.user = self.crear_usuario(username="saldo_user", telefono="900000090")
        self.autenticar(self.user)
        self.crear_categorias()
        self.prefs, _ = PreferenciasUsuario.objects.get_or_create(usuario=self.user)

    def test_gasto_libre_si_desactivado(self):
        # Por defecto limitar_saldo_negativo es False. Gasto debe crearse.
        response = self.client.post(
            "/api/transacciones/",
            {
                "categoria": self.cat_gasto.id,
                "tipo": Transaction.Tipo.GASTO,
                "monto": "100.00",
                "fecha": str(date.today()),
                "descripcion": "Gasto sin saldo",
            },
            format="json",
        )
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)

    def test_gasto_bloqueado_si_activado_y_sin_saldo(self):
        self.prefs.limitar_saldo_negativo = True
        self.prefs.save()

        response = self.client.post(
            "/api/transacciones/",
            {
                "categoria": self.cat_gasto.id,
                "tipo": Transaction.Tipo.GASTO,
                "monto": "100.00",
                "fecha": str(date.today()),
                "descripcion": "Gasto bloqueado",
            },
            format="json",
        )
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_gasto_permitido_si_activado_y_con_saldo(self):
        self.prefs.limitar_saldo_negativo = True
        self.prefs.save()

        # Primero ingreso de 200
        self.client.post(
            "/api/transacciones/",
            {
                "categoria": self.cat_ingreso.id,
                "tipo": Transaction.Tipo.INGRESO,
                "monto": "200.00",
                "fecha": str(date.today()),
            },
            format="json",
        )

        # Gasto de 150 -> Debe permitirse
        res1 = self.client.post(
            "/api/transacciones/",
            {
                "categoria": self.cat_gasto.id,
                "tipo": Transaction.Tipo.GASTO,
                "monto": "150.00",
                "fecha": str(date.today()),
            },
            format="json",
        )
        self.assertEqual(res1.status_code, status.HTTP_201_CREATED)

        # Gasto de 60 -> Debe bloquearse (sobran 50)
        res2 = self.client.post(
            "/api/transacciones/",
            {
                "categoria": self.cat_gasto.id,
                "tipo": Transaction.Tipo.GASTO,
                "monto": "60.00",
                "fecha": str(date.today()),
            },
            format="json",
        )
        self.assertEqual(res2.status_code, status.HTTP_400_BAD_REQUEST)

    def test_editar_gasto_permitido_si_mejora_saldo(self):
        # Crear gasto de 100 libremente
        gasto = Transaction.objects.create(
            usuario=self.user,
            categoria=self.cat_gasto,
            tipo=Transaction.Tipo.GASTO,
            monto=Decimal("100.00"),
            fecha=date.today(),
        )

        self.prefs.limitar_saldo_negativo = True
        self.prefs.save()
        # Saldo actual = -100

        # Editar para gastar menos (70) -> mejora balance a -70. Debe permitirse.
        response = self.client.patch(
            f"/api/transacciones/{gasto.id}/",
            {"monto": "70.00"},
            format="json",
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        gasto.refresh_from_db()
        self.assertEqual(gasto.monto, Decimal("70.00"))

    def test_editar_gasto_bloqueado_si_empeora_saldo(self):
        # Crear gasto de 100 libremente
        gasto = Transaction.objects.create(
            usuario=self.user,
            categoria=self.cat_gasto,
            tipo=Transaction.Tipo.GASTO,
            monto=Decimal("100.00"),
            fecha=date.today(),
        )

        self.prefs.limitar_saldo_negativo = True
        self.prefs.save()
        # Saldo actual = -100

        # Editar para gastar más (120) -> empeora balance a -120. Debe bloquearse.
        response = self.client.patch(
            f"/api/transacciones/{gasto.id}/",
            {"monto": "120.00"},
            format="json",
        )
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_pago_recurrente_bloqueado_si_sin_saldo(self):
        recurrente = Recurrente.objects.create(
            usuario=self.user,
            nombre="Netflix",
            monto=Decimal("50.00"),
            tipo=Category.Tipo.GASTO,
            dia_pago=5,
            categoria=self.cat_gasto,
        )

        self.prefs.limitar_saldo_negativo = True
        self.prefs.save()

        # Registrar pago de recurrente de gasto -> debe bloquearse por no tener saldo.
        response = self.client.post(
            f"/api/recurrentes/{recurrente.id}/registrar-pago/",
            format="json",
        )
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_pago_recurrente_con_liberacion_de_meta(self):
        self.prefs.limitar_saldo_negativo = True
        self.prefs.save()

        # Ingreso de 1000 y ahorro de 800 asignado a una meta
        self.client.post(
            "/api/transacciones/",
            {"categoria": self.cat_ingreso.id, "tipo": Transaction.Tipo.INGRESO, "monto": "1000.00", "fecha": str(date.today())},
            format="json",
        )
        self.client.post(
            "/api/ahorros/",
            {"monto": "800.00", "fecha": str(date.today())},
            format="json",
        )
        meta = self.client.post(
            "/api/metas/",
            {"nombre": "Ahorro Fondo", "monto_objetivo": "1000.00", "es_asignacion_libre": False},
            format="json",
        )
        meta_id = meta.data["id"]
        self.client.post(f"/api/metas/{meta_id}/asignar/", {"monto": "800.00"}, format="json")

        # Saldo líquido actual: 1000 - 800 = 200
        # Recurrente de 300 con abonos parciales
        recurrente = Recurrente.objects.create(
            usuario=self.user,
            nombre="Servicio Alquiler",
            monto=Decimal("300.00"),
            tipo=Category.Tipo.GASTO,
            dia_pago=5,
            categoria=self.cat_gasto,
            permite_parciales=True,
        )

        # Intentar pagar 300 sin liberar fondos -> Bloqueado con saldo_insuficiente_con_ahorros
        res_bloqueo = self.client.post(
            f"/api/recurrentes/{recurrente.id}/registrar-pago/",
            {"monto": "300.00"},
            format="json",
        )
        self.assertEqual(res_bloqueo.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("saldo_insuficiente_con_ahorros", str(res_bloqueo.data.get("codigo", "")))

        # Pagar 300 liberando los 100 faltantes de la meta
        res_ok = self.client.post(
            f"/api/recurrentes/{recurrente.id}/registrar-pago/",
            {"monto": "300.00", "meta_liberar_id": meta_id},
            format="json",
        )
        self.assertEqual(res_ok.status_code, status.HTTP_200_OK)
        self.assertTrue(res_ok.data["registrado_mes"])

        # Verificar que la meta ahora tiene 700 acumulados
        meta_get = self.client.get(f"/api/metas/{meta_id}/")
        self.assertEqual(Decimal(str(meta_get.data["acumulado"])), Decimal("700.00"))

    def test_gasto_con_liberacion_interactiva_de_meta(self):
        self.prefs.limitar_saldo_negativo = True
        self.prefs.save()

        # Ingreso de 1000
        self.client.post(
            "/api/transacciones/",
            {"categoria": self.cat_ingreso.id, "tipo": Transaction.Tipo.INGRESO, "monto": "1000.00", "fecha": str(date.today())},
            format="json",
        )
        # Apartar 500 en ahorro
        self.client.post(
            "/api/ahorros/",
            {"monto": "500.00", "fecha": str(date.today())},
            format="json",
        )
        # Crear meta formal y asignar los 500
        meta = self.client.post(
            "/api/metas/",
            {"nombre": "Laptop", "monto_objetivo": "1000.00", "es_asignacion_libre": False},
            format="json",
        )
        meta_id = meta.data["id"]
        self.client.post(f"/api/metas/{meta_id}/asignar/", {"monto": "500.00"}, format="json")

        # Balance líquido actual = 1000 - 500 = 500
        # Intentar gastar 700 -> Faltan 200 -> Debe retornar error con codigo saldo_insuficiente_con_ahorros
        res_fallo = self.client.post(
            "/api/transacciones/",
            {"categoria": self.cat_gasto.id, "tipo": Transaction.Tipo.GASTO, "monto": "700.00", "fecha": str(date.today())},
            format="json",
        )
        self.assertEqual(res_fallo.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("saldo_insuficiente_con_ahorros", str(res_fallo.data.get("codigo", "")))

        # Registrar el gasto de 700 liberando 200 de la meta Laptop
        res_exito = self.client.post(
            "/api/transacciones/",
            {
                "categoria": self.cat_gasto.id,
                "tipo": Transaction.Tipo.GASTO,
                "monto": "700.00",
                "fecha": str(date.today()),
                "meta_liberar_id": meta_id,
            },
            format="json",
        )
        self.assertEqual(res_exito.status_code, status.HTTP_201_CREATED)

        # Verificar que la meta ahora tiene 300 acumulados
        meta_get = self.client.get(f"/api/metas/{meta_id}/")
        self.assertEqual(Decimal(str(meta_get.data["acumulado"])), Decimal("300.00"))

        # Verificar que el ahorro total se redujo a 300
        resumen = self.client.get("/api/ahorros/resumen/")
        self.assertEqual(Decimal(str(resumen.data["total"])), Decimal("300.00"))

    def test_cambio_modo_libre_a_formal_valida_saldo_disponible(self):
        # Crear meta libre y asignarle 300 directamente sin fondos en ahorros
        meta = self.client.post(
            "/api/metas/",
            {"nombre": "Viaje Libre", "monto_objetivo": "500.00", "es_asignacion_libre": True},
            format="json",
        )
        meta_id = meta.data["id"]
        self.client.post(f"/api/metas/{meta_id}/asignar/", {"monto": "300.00"}, format="json")

        # Sin ingresos, intentar cambiar a formal -> debe fallar por saldo insuficiente
        res_bloqueo = self.client.patch(
            f"/api/metas/{meta_id}/",
            {"es_asignacion_libre": False},
            format="json",
        )
        self.assertEqual(res_bloqueo.status_code, status.HTTP_400_BAD_REQUEST)

        # Registrar ingreso suficiente de 500
        self.client.post(
            "/api/transacciones/",
            {"categoria": self.cat_ingreso.id, "tipo": Transaction.Tipo.INGRESO, "monto": "500.00", "fecha": str(date.today())},
            format="json",
        )

        # Ahora el cambio a formal debe ser exitoso y auto-apartar los 300 en ahorros
        res_ok = self.client.patch(
            f"/api/metas/{meta_id}/",
            {"es_asignacion_libre": False},
            format="json",
        )
        self.assertEqual(res_ok.status_code, status.HTTP_200_OK)
        self.assertFalse(res_ok.data["es_asignacion_libre"])

        # Verificar que en ahorros se formalizó el ahorro de 300
        resumen = self.client.get("/api/ahorros/resumen/")
        self.assertEqual(Decimal(str(resumen.data["total"])), Decimal("300.00"))
        self.assertEqual(Decimal(str(resumen.data["asignado"])), Decimal("300.00"))


class RecurrentesValidacionFechasTests(FinanzasAPITestCase):
    def setUp(self):
        self.user = self.crear_usuario(username="rec_user")
        self.autenticar(self.user)
        self.crear_categorias()

    def test_bloquea_mover_fecha_inicio_si_hay_pagos_anteriores(self):
        # 1. Crear recurrente de Agosto 2026 a Diciembre 2026
        res = self.client.post(
            "/api/recurrentes/",
            {
                "nombre": "Servicio Internet",
                "monto": "100.00",
                "tipo": "expense",
                "dia_pago": 5,
                "categoria": self.cat_gasto.id,
                "fecha_inicio": "2026-08-01",
                "fecha_fin": "2026-12-31",
            },
            format="json",
        )
        self.assertEqual(res.status_code, status.HTTP_201_CREATED)
        rec_id = res.data["id"]

        # 2. Registrar un pago en Agosto (2026-08-05)
        res_pago = self.client.post(
            f"/api/recurrentes/{rec_id}/registrar-pago/",
            {"fecha": "2026-08-05"},
            format="json",
        )
        self.assertEqual(res_pago.status_code, status.HTTP_200_OK)

        # 3. Intentar mover la fecha de inicio a Septiembre 2026 -> Debe fallar con 400 y mensaje explicativo
        res_edit = self.client.patch(
            f"/api/recurrentes/{rec_id}/",
            {"fecha_inicio": "2026-09-01"},
            format="json",
        )
        self.assertEqual(res_edit.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("fecha_inicio", res_edit.data)
        self.assertIn("existen pagos/abonos registrados", str(res_edit.data["fecha_inicio"]))

        # 4. Desmarcar/eliminar el pago de Agosto
        res_desmarcar = self.client.post(
            f"/api/recurrentes/{rec_id}/desmarcar-pago/",
            {"fecha": "2026-08-05"},
            format="json",
        )
        self.assertEqual(res_desmarcar.status_code, status.HTTP_200_OK)

        # 5. Ahora sí debe permitir mover la fecha de inicio a Septiembre 2026
        res_edit_ok = self.client.patch(
            f"/api/recurrentes/{rec_id}/",
            {"fecha_inicio": "2026-09-01"},
            format="json",
        )
        self.assertEqual(res_edit_ok.status_code, status.HTTP_200_OK)
        self.assertEqual(res_edit_ok.data["fecha_inicio"], "2026-09-01")

    def test_meses_futuros_reflejan_monto_y_activo_en_mes(self):
        # Crear recurrente válido de Agosto a Diciembre
        res = self.client.post(
            "/api/recurrentes/",
            {
                "nombre": "Plan Celular",
                "monto": "60.00",
                "tipo": "expense",
                "dia_pago": 15,
                "categoria": self.cat_gasto.id,
                "fecha_inicio": "2026-08-01",
                "fecha_fin": "2026-12-31",
            },
            format="json",
        )
        rec_id = res.data["id"]

        # Consultar un mes del futuro relativo a hoy (ej. Noviembre 2026)
        mes_futuro = (date.today().replace(day=28) + timedelta(days=60)).replace(day=1)
        res_futuro = self.client.get(f"/api/recurrentes/?mes={mes_futuro.strftime('%Y-%m-%d')}")
        self.assertEqual(res_futuro.status_code, status.HTTP_200_OK)

        rec_futuro = next(r for r in res_futuro.data if r["id"] == rec_id)
        self.assertTrue(rec_futuro["activo_en_mes"])
        self.assertEqual(rec_futuro["estado_periodo"], "futuro")
        self.assertEqual(Decimal(str(rec_futuro["monto"])), Decimal("60.00"))
        self.assertFalse(rec_futuro["vencido"])

    def test_permite_parciales_independiente_por_mes(self):
        # 1. Crear recurrente con permite_parciales = False por defecto
        res = self.client.post(
            "/api/recurrentes/",
            {
                "nombre": "Alquiler",
                "monto": "500.00",
                "tipo": "expense",
                "dia_pago": 5,
                "categoria": self.cat_gasto.id,
                "permite_parciales": False,
                "fecha_inicio": "2026-08-01",
                "fecha_fin": "2026-12-31",
            },
            format="json",
        )
        rec_id = res.data["id"]

        # 2. Ajustar Agosto solo para este mes con permite_parciales = True
        res_edit = self.client.patch(
            f"/api/recurrentes/{rec_id}/?mes=2026-08-01",
            {
                "permite_parciales": True,
                "solo_este_mes": True,
            },
            format="json",
        )
        self.assertEqual(res_edit.status_code, status.HTTP_200_OK)

        # 3. En Agosto permite_parciales debe ser True
        res_agosto = self.client.get(f"/api/recurrentes/?mes=2026-08-01")
        rec_agosto = next(r for r in res_agosto.data if r["id"] == rec_id)
        self.assertTrue(rec_agosto["permite_parciales"])

        # 4. En Septiembre permite_parciales debe seguir siendo False
        res_sept = self.client.get(f"/api/recurrentes/?mes=2026-09-01")
        rec_sept = next(r for r in res_sept.data if r["id"] == rec_id)
        self.assertFalse(rec_sept["permite_parciales"])

        # 5. En Agosto registrar un abono parcial de 200 debe funcionar
        res_abono = self.client.post(
            f"/api/recurrentes/{rec_id}/registrar-pago/?mes=2026-08-01",
            {"monto": "200.00", "fecha": "2026-08-05"},
            format="json",
        )
        self.assertEqual(res_abono.status_code, status.HTTP_200_OK)
        self.assertEqual(res_abono.data["monto_pagado"], 200.0)
        self.assertFalse(res_abono.data["registrado_mes"])

    def test_eliminar_recurrente_sin_transacciones(self):
        res = self.client.post(
            "/api/recurrentes/",
            {
                "nombre": "Temporal",
                "monto": "50.00",
                "tipo": "expense",
                "dia_pago": 1,
                "categoria": self.cat_gasto.id,
            },
            format="json",
        )
        rec_id = res.data["id"]
        res_del = self.client.delete(f"/api/recurrentes/{rec_id}/")
        self.assertEqual(res_del.status_code, status.HTTP_204_NO_CONTENT)
        self.assertFalse(Recurrente.objects.filter(id=rec_id).exists())

    def test_eliminar_recurrente_con_transacciones_opciones(self):
        # 1. Crear recurrente y registrar 2 pagos
        res = self.client.post(
            "/api/recurrentes/",
            {
                "nombre": "Gimnasio",
                "monto": "100.00",
                "tipo": "expense",
                "dia_pago": 10,
                "categoria": self.cat_gasto.id,
                "fecha_inicio": "2026-07-01",
            },
            format="json",
        )
        rec_id = res.data["id"]

        self.client.post(f"/api/recurrentes/{rec_id}/registrar-pago/?mes=2026-07-01", {"fecha": "2026-07-10"}, format="json")
        self.client.post(f"/api/recurrentes/{rec_id}/registrar-pago/?mes=2026-08-01", {"fecha": "2026-08-10"}, format="json")

        # 2. info-eliminacion debe devolver 2 transacciones y 200 de total
        res_info = self.client.get(f"/api/recurrentes/{rec_id}/info-eliminacion/")
        self.assertEqual(res_info.status_code, status.HTTP_200_OK)
        self.assertEqual(res_info.data["num_transacciones"], 2)
        self.assertEqual(Decimal(str(res_info.data["total_monto"])), Decimal("200.00"))

        # 3. Intentar delete sin modo -> debe requerir decisión
        res_del_fail = self.client.delete(f"/api/recurrentes/{rec_id}/")
        self.assertEqual(res_del_fail.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(res_del_fail.data["codigo"], "requiere_decision_transacciones")

        # 4. Probar eliminar con modo 'conservar_transacciones'
        res_del_conservar = self.client.delete(f"/api/recurrentes/{rec_id}/?modo=conservar_transacciones")
        self.assertEqual(res_del_conservar.status_code, status.HTTP_204_NO_CONTENT)
        self.assertFalse(Recurrente.objects.filter(id=rec_id).exists())
        # Las 2 transacciones siguen existiendo como gastos con recurrente=None
        txs = Transaction.objects.filter(categoria=self.cat_gasto, monto=Decimal("100.00"))
        self.assertEqual(txs.count(), 2)
        for t in txs:
            self.assertIsNone(t.recurrente)

        # 5. Probar modo 'eliminar_todo' en otro recurrente
        res2 = self.client.post(
            "/api/recurrentes/",
            {
                "nombre": "Spotify",
                "monto": "20.00",
                "tipo": "expense",
                "dia_pago": 15,
                "categoria": self.cat_gasto.id,
            },
            format="json",
        )
        rec_id2 = res2.data["id"]
        self.client.post(f"/api/recurrentes/{rec_id2}/registrar-pago/?mes=2026-08-01", {"fecha": "2026-08-15"}, format="json")

        res_del_todo = self.client.delete(f"/api/recurrentes/{rec_id2}/?modo=eliminar_todo")
        self.assertEqual(res_del_todo.status_code, status.HTTP_204_NO_CONTENT)
        self.assertFalse(Recurrente.objects.filter(id=rec_id2).exists())
        self.assertFalse(Transaction.objects.filter(monto=Decimal("20.00"), descripcion__icontains="Spotify").exists())


class TiposCuentaTests(FinanzasAPITestCase):
    def setUp(self):
        self.crear_categorias()
        self.user_basico = self.crear_usuario(
            username="basico",
            telefono="999111001",
            tipo_cuenta=PerfilUsuario.TipoCuenta.BASICO,
        )
        self.user_avanzado = self.crear_usuario(
            username="avanzado",
            telefono="999111002",
            tipo_cuenta=PerfilUsuario.TipoCuenta.AVANZADO,
        )
        self.admin_user = self.crear_usuario(
            username="adminuser",
            telefono="999111003",
            is_staff=True,
        )

    def test_usuario_basico_bloqueado_en_rutas_avanzadas(self):
        self.autenticar(self.user_basico)

        # Recurrentes
        res = self.client.get("/api/recurrentes/")
        self.assertEqual(res.status_code, status.HTTP_403_FORBIDDEN)

        # Metas
        res = self.client.get("/api/metas/")
        self.assertEqual(res.status_code, status.HTTP_403_FORBIDDEN)

        # Consejos
        res = self.client.get("/api/consejos/")
        self.assertEqual(res.status_code, status.HTTP_403_FORBIDDEN)

    def test_usuario_basico_puede_acceder_a_modulos_basicos(self):
        self.autenticar(self.user_basico)

        # Transacciones (Ingresos / Gastos)
        res = self.client.get("/api/transacciones/")
        self.assertEqual(res.status_code, status.HTTP_200_OK)

        # Categorías
        res = self.client.get("/api/categorias/")
        self.assertEqual(res.status_code, status.HTTP_200_OK)

        # Presupuestos (ahora disponible en básico)
        res = self.client.get("/api/presupuestos/")
        self.assertEqual(res.status_code, status.HTTP_200_OK)

        # Ahorros (ahora disponible en básico)
        res = self.client.get("/api/ahorros/")
        self.assertEqual(res.status_code, status.HTTP_200_OK)

        # Perfil
        res = self.client.get("/api/perfil/")
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        self.assertEqual(res.data["tipo_cuenta"], "basico")

    def test_usuario_avanzado_tiene_acceso_a_rutas_avanzadas(self):
        self.autenticar(self.user_avanzado)

        res = self.client.get("/api/presupuestos/")
        self.assertEqual(res.status_code, status.HTTP_200_OK)

        res = self.client.get("/api/recurrentes/")
        self.assertEqual(res.status_code, status.HTTP_200_OK)

        res = self.client.get("/api/metas/")
        self.assertEqual(res.status_code, status.HTTP_200_OK)

        res = self.client.get("/api/ahorros/")
        self.assertEqual(res.status_code, status.HTTP_200_OK)

    def test_admin_puede_cambiar_tipo_cuenta_de_usuario(self):
        self.autenticar(self.admin_user)

        res = self.client.patch(
            f"/api/admin/usuarios/{self.user_basico.id}/",
            {"tipo_cuenta": "avanzado"},
            format="json",
        )
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        self.assertEqual(res.data["tipo_cuenta"], "avanzado")

        self.user_basico.perfil.refresh_from_db()
        self.assertEqual(self.user_basico.perfil.tipo_cuenta, PerfilUsuario.TipoCuenta.AVANZADO)









