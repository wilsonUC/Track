import json
import urllib.parse
import webbrowser
from http.server import BaseHTTPRequestHandler, HTTPServer
from threading import Thread

import requests
from django.conf import settings
from django.core.management.base import BaseCommand, CommandError


class Command(BaseCommand):
    help = "Genera el REFRESH_TOKEN de Google Drive para permitir backups automáticos sin límite de cuota."

    def add_arguments(self, parser):
        parser.add_argument(
            "--client-id",
            type=str,
            default=getattr(settings, "GDRIVE_OAUTH_CLIENT_ID", "") or os.environ.get("GDRIVE_OAUTH_CLIENT_ID", ""),
            help="ID de cliente de OAuth",
        )
        parser.add_argument(
            "--client-secret",
            type=str,
            default=getattr(settings, "GDRIVE_OAUTH_CLIENT_SECRET", "") or os.environ.get("GDRIVE_OAUTH_CLIENT_SECRET", ""),
            help="Secreto de cliente de OAuth",
        )
        parser.add_argument(
            "--port",
            type=int,
            default=8085,
            help="Puerto local para recibir la redirección de Google (default: 8085)",
        )

    def handle(self, *args, **options):
        client_id = options["client_id"]
        client_secret = options["client_secret"]
        port = options["port"]
        redirect_uri = f"http://localhost:{port}/"

        if not client_id or not client_secret:
            raise CommandError("Debes especificar client_id y client_secret.")

        scope = "https://www.googleapis.com/auth/drive.file https://www.googleapis.com/auth/drive"
        params = {
            "client_id": client_id,
            "redirect_uri": redirect_uri,
            "response_type": "code",
            "scope": scope,
            "access_type": "offline",
            "prompt": "consent",
        }
        auth_url = f"https://accounts.google.com/o/oauth2/v2/auth?{urllib.parse.urlencode(params)}"

        auth_code_container = {}

        class OAuthCallbackHandler(BaseHTTPRequestHandler):
            def do_GET(self):
                parsed = urllib.parse.urlparse(self.path)
                query = urllib.parse.parse_qs(parsed.query)

                if "code" in query:
                    auth_code_container["code"] = query["code"][0]
                    self.send_response(200)
                    self.send_header("Content-Type", "text/html; charset=utf-8")
                    self.end_headers()
                    html = """
                    <html>
                    <body style="font-family: Arial, sans-serif; text-align: center; padding: 50px;">
                        <h1 style="color: #10b981;">&#10004; &iexcl;Autorizaci&oacute;n exitosa!</h1>
                        <p>Track ya tiene permiso para subir copias de seguridad a tu Google Drive.</p>
                        <p>Puedes cerrar esta pesta&ntilde;a y volver a tu terminal.</p>
                    </body>
                    </html>
                    """
                    self.wfile.write(html.encode("utf-8"))
                else:
                    error_msg = query.get("error", ["desconocido"])[0]
                    self.send_response(400)
                    self.send_header("Content-Type", "text/html; charset=utf-8")
                    self.end_headers()
                    self.wfile.write(f"Error de autorizacion: {error_msg}".encode("utf-8"))

            def log_message(self, format, *args):
                # Silenciar logs del servidor HTTP
                pass

        server = HTTPServer(("localhost", port), OAuthCallbackHandler)

        self.stdout.write(self.style.NOTICE("\n==> Abriendo navegador para autorizar Google Drive..."))
        self.stdout.write(f"Si no se abre automáticamente, copia este enlace en tu navegador:\n{auth_url}\n")

        try:
            webbrowser.open(auth_url)
        except Exception:
            pass

        self.stdout.write("Esperando confirmación en el navegador...")
        # Manejar una sola petición
        server.handle_request()
        server.server_close()

        auth_code = auth_code_container.get("code")
        if not auth_code:
            raise CommandError("No se recibió el código de autorización de Google.")

        self.stdout.write("==> Canjeando código por tokens permanentes...")
        token_res = requests.post(
            "https://oauth2.googleapis.com/token",
            data={
                "code": auth_code,
                "client_id": client_id,
                "client_secret": client_secret,
                "redirect_uri": redirect_uri,
                "grant_type": "authorization_code",
            },
            timeout=15,
        )

        if token_res.status_code != 200:
            raise CommandError(f"Error al obtener token de Google: {token_res.text}")

        token_data = token_res.json()
        refresh_token = token_data.get("refresh_token")

        if not refresh_token:
            self.stdout.write(
                self.style.WARNING(
                    "Google no devolvió un refresh_token nuevo (probablemente ya habías autorizado antes). "
                    "Acceso con access_token temporal otorgado."
                )
            )
            return

        self.stdout.write(self.style.SUCCESS("\n[OK] Autenticación completada con éxito!\n"))
        self.stdout.write(
            "Copia estas variables en tu archivo .env local y en Dokploy (Variables de entorno):\n"
        )
        self.stdout.write("-" * 70)
        self.stdout.write(f"GDRIVE_OAUTH_CLIENT_ID={client_id}")
        self.stdout.write(f"GDRIVE_OAUTH_CLIENT_SECRET={client_secret}")
        self.stdout.write(f"GDRIVE_OAUTH_REFRESH_TOKEN={refresh_token}")
        self.stdout.write("-" * 70)

        # Intentar guardarlo automáticamente en .env si existe
        env_path = settings.BASE_DIR / ".env"
        if env_path.exists():
            try:
                content = env_path.read_text(encoding="utf-8")
                updates = [
                    f"GDRIVE_OAUTH_CLIENT_ID={client_id}",
                    f"GDRIVE_OAUTH_CLIENT_SECRET={client_secret}",
                    f"GDRIVE_OAUTH_REFRESH_TOKEN={refresh_token}",
                ]
                new_lines = []
                for line in content.splitlines():
                    if not any(line.startswith(u.split("=")[0]) for u in updates):
                        new_lines.append(line)
                new_lines.extend(updates)
                env_path.write_text("\n".join(new_lines) + "\n", encoding="utf-8")
                self.stdout.write(self.style.SUCCESS("==> Se actualizó automáticamente tu archivo .env local."))
            except Exception as e:
                self.stdout.write(self.style.WARNING(f"No se pudo escribir en .env: {e}"))
