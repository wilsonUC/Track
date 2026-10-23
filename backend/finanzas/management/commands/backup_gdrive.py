from django.core.management.base import BaseCommand, CommandError
from finanzas.backup_service import ejecutar_backup_a_gdrive, generar_volcado_db


class Command(BaseCommand):
    help = "Genera un volcado de la base de datos y lo sube automáticamente a Google Drive."

    def add_arguments(self, parser):
        parser.add_argument(
            "--folder-id",
            type=str,
            default=None,
            help="ID de la carpeta de Google Drive donde guardar el backup (opcional, usa settings por defecto)",
        )
        parser.add_argument(
            "--keep-days",
            type=int,
            default=30,
            help="Días de retención para backups antiguos en Google Drive (default: 30)",
        )
        parser.add_argument(
            "--local-only",
            action="store_true",
            help="Solo genera el archivo de backup en local sin subirlo a Google Drive (útil para pruebas)",
        )

    def handle(self, *args, **options):
        self.stdout.write(self.style.NOTICE("==> Iniciando proceso de backup de la base de datos..."))

        if options["local_only"]:
            try:
                filepath = generar_volcado_db()
                self.stdout.write(
                    self.style.SUCCESS(f"==> Volcado local generado con éxito: {filepath}")
                )
                return
            except Exception as e:
                raise CommandError(f"Error al generar el volcado local: {e}")

        try:
            resultado = ejecutar_backup_a_gdrive(
                folder_id=options["folder_id"],
                dias_retencion=options["keep_days"],
            )

            tamano_mb = resultado["size_bytes"] / (1024 * 1024)
            self.stdout.write(
                self.style.SUCCESS(
                    f"\n[OK] Backup subido exitosamente a Google Drive!\n"
                    f" - Archivo: {resultado['file_name']}\n"
                    f" - ID en Drive: {resultado['file_id']}\n"
                    f" - Tamaño: {tamano_mb:.2f} MB ({resultado['size_bytes']} bytes)\n"
                    f" - Enlace: {resultado.get('drive_link', 'N/A')}\n"
                    f" - Backups antiguos rotados: {resultado['backups_rotados']}"
                )
            )
        except Exception as e:
            raise CommandError(f"Error al realizar el backup a Google Drive: {e}")
