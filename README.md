# Simulador de Préstamos — modo local

Esta versión se abre directamente con doble clic en `index.html`. No necesita iniciar un servidor, instalar Python ni utilizar SQLite.

## Uso
1. Descomprime todos los archivos en una carpeta.
2. Abre `index.html` con Chrome o Edge.
3. Registra un cliente y selecciónalo para crear préstamos.
4. Los clientes, préstamos, cuotas, pagos y abonos se guardan en el almacenamiento local del navegador.
5. Usa **Exportar todos los datos** para descargar un respaldo JSON completo. Para restaurarlo, usa **Importar base local**.

## Importante sobre los datos
- Los datos se guardan en el navegador y perfil de usuario que abras. No se sincronizan entre equipos ni entre navegadores.
- Mantén todos los archivos del proyecto juntos en la misma carpeta.
- Al abrir como `file://`, el comportamiento del almacenamiento local puede variar entre navegadores. Si tu navegador bloquea el almacenamiento para archivos locales, abre el proyecto en Chrome/Edge y verifica el indicador de guardado; exporta respaldos regularmente.
- El archivo JSON de respaldo contiene datos de clientes y préstamos. Guárdalo de forma segura.
- Esta versión ya no usa SQLite, `server.py`, `requirements.txt` ni `iniciar_simulador.bat`.


## Acceso de administrador

- Abre `index.html` directamente, sin iniciador ni servidor.
- En el primer inicio crea el perfil administrador, el nombre de usuario y una contraseña de al menos 10 caracteres con letras y números.
- En los siguientes accesos escribe las credenciales para abrir el simulador.
- En el encabezado, pulsa el perfil para editar nombre/usuario o cambiar la contraseña. Usa **Cerrar sesión** para bloquear la interfaz.
- La contraseña se deriva con PBKDF2-SHA-256 y una sal aleatoria; no se guarda en texto plano. La sesión se conserva en la pestaña actual.

**Límite importante de la versión local:** esta protección es una barrera de acceso de cliente, no seguridad de servidor. Los datos de clientes y préstamos siguen en `localStorage` y una persona con acceso técnico al equipo/navegador puede inspeccionar o modificar esos datos, borrar la credencial local o alterar el código. Para proteger datos financieros frente a otros usuarios del equipo se necesita un backend autenticado y almacenamiento cifrado/controlado por el servidor. Conserva respaldos JSON fuera de la carpeta del proyecto.
