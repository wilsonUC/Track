from __future__ import annotations

import logging
from django.conf import settings
from django.core.files.storage import Storage
from django.utils.deconstruct import deconstructible
import cloudinary
import cloudinary.uploader
import cloudinary.utils

logger = logging.getLogger(__name__)


@deconstructible
class CloudinaryMediaStorage(Storage):
    """Almacenamiento en la nube usando Cloudinary para Django.
    
    Guarda las imágenes procesadas en Cloudinary organizadas por entorno
    (dev/ vs prod/) y por usuario, devolviendo URLs seguras (HTTPS) directas
    servidas desde la red CDN global de Cloudinary.
    """

    def __init__(self, **settings_dict):
        cloud_name = getattr(settings, "CLOUDINARY_CLOUD_NAME", None)
        api_key = getattr(settings, "CLOUDINARY_API_KEY", None)
        api_secret = getattr(settings, "CLOUDINARY_API_SECRET", None)

        if cloud_name and api_key and api_secret:
            cloudinary.config(
                cloud_name=cloud_name,
                api_key=api_key,
                api_secret=api_secret,
                secure=True,
            )

        prefix = getattr(settings, "CLOUDINARY_ENV_PREFIX", "dev" if settings.DEBUG else "prod")
        self.prefix = str(prefix).strip("/") if prefix else ""

    def _clean_name(self, name: str) -> str:
        return str(name).replace("\\", "/").lstrip("/")

    def _get_public_id(self, name: str) -> str:
        clean = self._clean_name(name)
        if "." in clean:
            clean = clean.rsplit(".", 1)[0]
        # Incorporar prefijo de entorno si no está presente
        if self.prefix and not clean.startswith(f"{self.prefix}/"):
            return f"{self.prefix}/{clean}"
        return clean

    def _save(self, name: str, content) -> str:
        name = self._clean_name(name)
        
        # Extraer carpeta y nombre base (ej. "perfiles/user_6/avatar_abc.webp")
        parts = name.rsplit("/", 1)
        if len(parts) == 2:
            folder = parts[0]
            filename = parts[1]
        else:
            folder = "perfiles"
            filename = name

        simple_id = filename.rsplit(".", 1)[0]

        # Añadir prefijo de entorno al folder de Cloudinary (ej. "dev/perfiles/user_6")
        full_folder = f"{self.prefix}/{folder}" if self.prefix and not folder.startswith(f"{self.prefix}/") else folder

        if hasattr(content, "seek"):
            content.seek(0)

        try:
            cloudinary.uploader.upload(
                content,
                public_id=simple_id,
                folder=full_folder,
                asset_folder=full_folder,
                overwrite=True,
                resource_type="image",
                format="webp",
            )
        except Exception as exc:
            logger.error("Error al subir archivo %s a Cloudinary (carpeta %s): %s", simple_id, full_folder, exc)
            raise

        return name

    def url(self, name: str) -> str:
        if not name:
            return ""
        if name.startswith("http://") or name.startswith("https://"):
            return name

        public_id = self._get_public_id(name)
        url, _ = cloudinary.utils.cloudinary_url(public_id, format="webp", secure=True)
        return url

    def delete(self, name: str) -> None:
        if not name:
            return
        clean = self._clean_name(name)
        public_id = self._get_public_id(clean)
        try:
            cloudinary.uploader.destroy(public_id, invalidate=True)
        except Exception as exc:
            logger.warning("Error eliminando imagen %s de Cloudinary: %s", public_id, exc)

    def exists(self, name: str) -> bool:
        return False

    def size(self, name: str) -> int:
        return 0
