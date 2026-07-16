"""Tests de API: auth, transacciones, presupuestos, recurrentes, ahorros y metas."""

from datetime import date
from decimal import Decimal

from django.contrib.auth import get_user_model
from rest_framework import status
from rest_framework.test import APITestCase
from rest_framework_simplejwt.tokens import RefreshToken

from .models import Category, PerfilUsuario, Presupuesto, Transaction

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
            {"tema": "oscuro", "vista_compacta": True},
            format="json",
        )
        self.assertEqual(patch_resp.status_code, status.HTTP_200_OK)
        self.assertEqual(patch_resp.data["tema"], "oscuro")
        self.assertTrue(patch_resp.data["vista_compacta"])


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

