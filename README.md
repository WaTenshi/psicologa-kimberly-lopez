# Psicóloga Kimberly López

Landing pública, sistema de reservas y CRM administrativo para la consulta psicológica de Kimberly López.

## Desarrollo local

1. Instala dependencias con `npm ci`.
2. Copia `.env.example` como `.env.local`.
3. Completa las variables de Firebase y EmailJS.
4. Ejecuta `npm run dev`.

## Validación

```bash
npm run lint
npm run build
```

## GitHub Pages

El workflow `.github/workflows/deploy-pages.yml` compila y publica automáticamente la rama `main`.

En GitHub debes:

1. Ir a `Settings > Secrets and variables > Actions`.
2. Crear cada secreto listado en `.env.example`.
3. Ir a `Settings > Pages`.
4. Seleccionar `GitHub Actions` como fuente.

La URL esperada es:

`https://watenshi.github.io/ps.kimberly/`

## Firebase

Las reglas propuestas están en `firestore.rules`. Se despliegan por separado con Firebase CLI:

```bash
firebase deploy --only firestore:rules
```

La disponibilidad pública vive en `availability_blocks`; las citas con datos personales permanecen en `appointments` y solo pueden ser leídas por la cuenta administradora definida en las reglas.

Antes de activar estas reglas, sincroniza las citas antiguas creando un documento en `availability_blocks` por cada horario ocupado. El identificador debe usar el formato `AAAA-MM-DD_HHMM`.

## Seguridad

- `.env.local`, credenciales de servicio, builds y dependencias están ignorados por Git.
- No se guardan contraseñas administrativas en el repositorio.
- Las variables `VITE_*` no son secretos en tiempo de ejecución: una aplicación web debe enviarlas al navegador. GitHub Secrets evita que queden escritas en el código fuente, pero Firebase debe protegerse mediante reglas, dominios autorizados, cuotas y App Check.
- Cambia inmediatamente cualquier contraseña administrativa que haya sido compartida o almacenada en texto plano.
- Autoriza `watenshi.github.io` en Firebase Authentication y restringe la API key de Firebase a los dominios usados por el proyecto desde Google Cloud Console.
- Configura restricciones de origen/dominio en EmailJS.

Consulta también [SECURITY.md](SECURITY.md).

## Licencia

Código propietario. Consulta [LICENSE](LICENSE). La publicación del repositorio no concede derechos de copia, modificación, distribución o reventa.
