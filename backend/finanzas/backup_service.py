import base64
import gzip
import json
import logging
import os
import shutil
import subprocess
import tempfile
from datetime import datetime, timedelta, timezone
from pathlib import Path

from django.conf import settings
from django.core.management import call_command
from django.db import connection
from google.oauth2 import service_account
from googleapiclient.discovery import build
from googleapiclient.http import MediaFileUpload

logger = logging.getLogger(__name__)

GDRIVE_SCOPES = [
    "https://www.googleapis.com/auth/drive.file",
    "https://www.googleapis.com/auth/drive",
]


def obtener_credenciales_gdrive():
    """
    Obtiene las credenciales para Google Drive.
    Busca en:
    1. OAuth 2.0 con Refresh Token (cuenta personal del usuario, 15GB cuota).
    2. settings.GDRIVE_SERVICE_ACCOUNT_JSON (string JSON o base64).
    3. settings.GDRIVE_SERVICE_ACCOUNT_FILE (ruta a archivo).
    4. Archivos comunes en el directorio base (credentials.json, gdrive_key.json, etc.).
    """
    # 1. Prioridad: OAuth 2.0 Refresh Token (sin límite de cuota 0 de Service Account)
    oauth_refresh_token = getattr(settings, "GDRIVE_OAUTH_REFRESH_TOKEN", "").strip()
    if oauth_refresh_token:
        oauth_client_id = getattr(settings, "GDRIVE_OAUTH_CLIENT_ID", "").strip()
        oauth_client_secret = getattr(settings, "GDRIVE_OAUTH_CLIENT_SECRET", "").strip()
        from google.oauth2.credentials import Credentials

        logger.info("Usando autenticación OAuth 2.0 de usuario para Google Drive.")
        return Credentials(
            token=None,
            refresh_token=oauth_refresh_token,
            token_uri="https://oauth2.googleapis.com/token",
            client_id=oauth_client_id,
            client_secret=oauth_client_secret,
            scopes=GDRIVE_SCOPES,
        )

    json_env = getattr(settings, "GDRIVE_SERVICE_ACCOUNT_JSON", "").strip()
    if json_env:
        try:
            # Si viene en base64
            if not json_env.startswith("{"):
                decoded = base64.b64decode(json_env).decode("utf-8")
                info = json.loads(decoded)
            else:
                info = json.loads(json_env)
            return service_account.Credentials.from_service_account_info(
                info, scopes=GDRIVE_SCOPES
            )
        except Exception as e:
            raise ValueError(f"Error al procesar GDRIVE_SERVICE_ACCOUNT_JSON: {e}")

    file_env = getattr(settings, "GDRIVE_SERVICE_ACCOUNT_FILE", "").strip()
    candidates = []
    if file_env:
        candidates.append(Path(file_env))

    base_dir = Path(settings.BASE_DIR)
    candidates.extend(
        [
            base_dir / "credentials.json",
            base_dir / "gdrive_key.json",
            base_dir / "service_account.json",
            base_dir.parent / "credentials.json",
        ]
    )

    for candidate in candidates:
        if candidate.is_file():
            logger.info("Usando credenciales de Google Drive desde: %s", candidate)
            return service_account.Credentials.from_service_account_file(
                str(candidate), scopes=GDRIVE_SCOPES
            )

    raise FileNotFoundError(
        "No se encontraron credenciales de Google Drive. "
        "Define GDRIVE_SERVICE_ACCOUNT_JSON en tu entorno o coloca el archivo 'credentials.json' en la raíz del backend."
    )


def encontrar_pg_dump():
    """
    Busca la herramienta pg_dump en el sistema:
    1. PATH del sistema (Linux, contenedores Docker, etc.).
    2. Rutas conocidas en Windows (pgAdmin 4, PostgreSQL, etc.).
    """
    directo = shutil.which("pg_dump")
    if directo:
        return directo

    local_app_data = os.environ.get("LOCALAPPDATA", "")
    program_files = os.environ.get("ProgramFiles", "C:\\Program Files")

    candidatos = [
        Path(local_app_data) / "Programs" / "pgAdmin 4" / "runtime" / "pg_dump.exe",
        Path("C:/Program Files/Odoo 19.0.20260723/PostgreSQL/bin/pg_dump.exe"),
        Path(program_files) / "PostgreSQL" / "16" / "bin" / "pg_dump.exe",
        Path(program_files) / "PostgreSQL" / "15" / "bin" / "pg_dump.exe",
        Path(program_files) / "PostgreSQL" / "17" / "bin" / "pg_dump.exe",
    ]

    for c in candidatos:
        if c.is_file():
            return str(c)

    return None


def generar_volcado_db(output_dir=None):
    """
    Genera un archivo comprimido (.gz) con el volcado de la base de datos.
    - Si PostgreSQL y pg_dump están disponibles, genera .sql.gz completo.
    - Si no (o en desarrollo/pruebas), genera un dumpdata de Django en .json.gz.
    Retorna la ruta absoluta del archivo generado.
    """
    output_dir = Path(output_dir or tempfile.gettempdir())
    output_dir.mkdir(parents=True, exist_ok=True)

    timestamp = datetime.now().strftime("%Y-%m-%d_%H-%M-%S")
    db_config = settings.DATABASES["default"]
    engine = db_config.get("ENGINE", "")

    pg_dump_path = encontrar_pg_dump()
    es_postgres = "postgresql" in engine or "postgis" in engine

    if es_postgres and pg_dump_path:
        filename = f"Track-{timestamp}.sql.gz"
        filepath = output_dir / filename

        db_name = db_config.get("NAME")
        db_user = db_config.get("USER")
        db_password = db_config.get("PASSWORD")
        db_host = db_config.get("HOST", "localhost")
        db_port = str(db_config.get("PORT", "5432"))

        env = os.environ.copy()
        if db_password:
            env["PGPASSWORD"] = str(db_password)

        cmd = [
            pg_dump_path,
            "-h",
            db_host,
            "-p",
            db_port,
            "-U",
            db_user,
            "-d",
            db_name,
            "--clean",
            "--if-exists",
            "--no-owner",
            "--no-acl",
        ]

        logger.info("Ejecutando pg_dump para %s...", db_name)
        with gzip.open(filepath, "wb") as gz_out:
            proc = subprocess.Popen(
                cmd,
                stdout=subprocess.PIPE,
                stderr=subprocess.PIPE,
                env=env,
            )
            stdout, stderr = proc.communicate()
            if proc.returncode != 0:
                err_msg = stderr.decode("utf-8", errors="replace")
                raise RuntimeError(f"Error al ejecutar pg_dump: {err_msg}")
            gz_out.write(stdout)

        return str(filepath)

    # Fallback: dumpdata nativo de Django
    filename = f"Track-{timestamp}.json.gz"
    filepath = output_dir / filename

    logger.info("Generando volcado mediante dumpdata de Django...")
    temp_json = tempfile.NamedTemporaryFile(
        delete=False, suffix=".json", mode="w", encoding="utf-8"
    )
    temp_json_path = temp_json.name
    temp_json.close()

    try:
        with open(temp_json_path, "w", encoding="utf-8") as f_dump:
            call_command(
                "dumpdata",
                "--natural-foreign",
                "--natural-primary",
                "--indent=2",
                stdout=f_dump,
            )
        with open(temp_json_path, "rb") as f_in, gzip.open(filepath, "wb") as gz_out:
            shutil.copyfileobj(f_in, gz_out)
    finally:
        if os.path.exists(temp_json_path):
            try:
                os.remove(temp_json_path)
            except Exception:
                pass

    return str(filepath)


def rotar_backups_antiguos(service, folder_id, dias_retencion=30):
    """
    Elimina archivos de backup antiguos en la carpeta de Google Drive si superan los días de retención.
    """
    if dias_retencion <= 0:
        return 0

    limite = datetime.now(timezone.utc) - timedelta(days=dias_retencion)
    query = (
        f"'{folder_id}' in parents and "
        f"(name contains 'Track-' or name contains 'backup_track_') and "
        f"trashed = false"
    )

    eliminados = 0
    try:
        results = (
            service.files()
            .list(
                q=query,
                spaces="drive",
                fields="files(id, name, createdTime)",
                pageSize=100,
            )
            .execute()
        )
        archivos = results.get("files", [])
        for archivo in archivos:
            creado_str = archivo.get("createdTime")
            if creado_str:
                # Formato ISO: 2026-10-21T15:00:00.000Z
                try:
                    creado_dt = datetime.fromisoformat(
                        creado_str.replace("Z", "+00:00")
                    )
                    if creado_dt < limite:
                        service.files().delete(fileId=archivo["id"]).execute()
                        logger.info("Backup antiguo eliminado de Drive: %s", archivo["name"])
                        eliminados += 1
                except Exception as parse_err:
                    logger.warning(
                        "No se pudo parsear fecha de %s: %s", archivo.get("name"), parse_err
                    )
    except Exception as e:
        logger.warning("Error durante la rotación de backups en Drive: %s", e)

    return eliminados


def ejecutar_backup_a_gdrive(folder_id=None, dias_retencion=30):
    """
    Ejecuta el ciclo completo:
    1. Genera el dump de la DB comprimido (.gz).
    2. Lo sube a la carpeta de Google Drive indicada.
    3. Elimina backups que excedan dias_retencion en Drive.
    4. Elimina el archivo temporal del disco local.
    """
    folder_id = folder_id or getattr(
        settings, "GDRIVE_BACKUP_FOLDER_ID", "1g1J-O3OQ9y6_Iif_H73ZAYZpJSLd3JKa"
    )
    if not folder_id:
        raise ValueError("No se proporcionó el ID de la carpeta de Google Drive.")

    credentials = obtener_credenciales_gdrive()
    service = build("drive", "v3", credentials=credentials, cache_discovery=False)

    local_file = generar_volcado_db()
    file_name = os.path.basename(local_file)
    size_bytes = os.path.getsize(local_file)

    try:
        file_metadata = {
            "name": file_name,
            "parents": [folder_id],
        }
        media = MediaFileUpload(
            local_file,
            mimetype="application/gzip",
            resumable=True,
        )

        logger.info("Subiendo %s (%d bytes) a Google Drive...", file_name, size_bytes)
        uploaded = (
            service.files()
            .create(
                body=file_metadata,
                media_body=media,
                fields="id, name, webViewLink, size",
            )
            .execute()
        )

        eliminados = rotar_backups_antiguos(service, folder_id, dias_retencion)

        return {
            "status": "success",
            "file_id": uploaded.get("id"),
            "file_name": uploaded.get("name"),
            "drive_link": uploaded.get("webViewLink"),
            "size_bytes": size_bytes,
            "backups_rotados": eliminados,
        }
    finally:
        if os.path.exists(local_file):
            try:
                os.remove(local_file)
            except Exception:
                pass
