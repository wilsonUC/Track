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

    def test_eliminar_presupuesto_es_soft_delete(self):
        presupuesto = Presupuesto.objects.create(
            usuario=self.user,
            nombre="Comida",
            limite=Decimal("300.00"),
            monto_rapido=Decimal("20.00"),
        )
        response = self.client.delete(f"/api/presupuestos/{presupuesto.id}/")
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)

        presupuesto.refresh_from_db()
        self.assertFalse(presupuesto.activo)

        lista = self.client.get("/api/presupuestos/")
        self.assertEqual(len(lista.data), 0)


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
        # Recurrente creado el mes pasado (ej: hace 30 días)
        fecha_hace_un_mes = date.today() - timedelta(days=30)
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
            {"nombre": "Viaje Directo", "monto_objetivo": "1000.00"},
            format="json",
        )
        meta_id = meta_resp.data["id"]

        # Sin la preferencia activada y sin ahorro libre, falla
        fail_resp = self.client.post(f"/api/metas/{meta_id}/asignar/", {"monto": "200.00"}, format="json")
        self.assertEqual(fail_resp.status_code, status.HTTP_400_BAD_REQUEST)

        # Activar asignación directa a metas
        self.client.patch("/api/preferencias/", {"permitir_asignacion_directa_metas": True}, format="json")

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



