# Seguridad

## Datos clínicos

Este sistema trata datos personales y potencialmente sensibles. No uses GitHub Pages como sustituto del control de acceso: Pages solo aloja el frontend. La protección real depende de Firebase Authentication, Firestore Rules, App Check y una administración correcta de usuarios.

## Recomendaciones obligatorias

- Mantener una sola cuenta administradora o usar custom claims para roles.
- Activar MFA para la cuenta de Google/Firebase que administra el proyecto.
- Restringir dominios autorizados de Firebase Authentication.
- Activar Firebase App Check para reducir abuso automatizado.
- Activar reCAPTCHA y la allowlist de origen en EmailJS para impedir que otros sitios disparen las plantillas.
- Revisar cuotas y alertas de facturación.
- No almacenar informes clínicos ni comprobantes como URLs públicas.
- Usar Firebase Storage con reglas privadas antes de habilitar documentos adjuntos.
- Cambiar inmediatamente cualquier contraseña que haya aparecido en archivos locales o mensajes.

## API keys en frontend

Las configuraciones web de Firebase y las public keys de EmailJS son visibles en el JavaScript compilado por diseño. No deben conceder acceso por sí mismas. La autorización debe implementarse en las reglas del servicio y mediante restricciones de dominio.

Nunca incluyas claves privadas de OpenAI, service accounts de Firebase, tokens de WhatsApp o secretos de proveedores en variables `VITE_*`.

## Historial del repositorio

Los identificadores públicos actuales de Firebase y EmailJS estuvieron presentes en commits anteriores. Aunque no autorizan por sí solos el acceso a los datos, deben rotarse si se desea invalidar los artefactos históricos. Una limpieza completa exige reescribir el historial y forzar la actualización de las ramas; coordina esa operación antes de ejecutarla.
