# Smart Test AI 3.2.2

Extensión de Chrome para analizar preguntas de Google Forms mediante inteligencia artificial local con **Ollama** y el modelo **qwen2.5:7b**.

La extensión se activa haciendo doble clic sobre el enunciado de una pregunta. Envía el enunciado y las opciones detectadas al modelo local y, si recibe una respuesta válida, intenta marcar la opción correspondiente.

> **Importante:** la IA puede equivocarse. Revisa siempre la opción marcada. La extensión no pulsa el botón de enviar ni entrega el formulario.

## Índice

1. Requisitos
2. Instalar Ollama
3. Descargar el modelo
4. Instalar la extensión en Chrome
5. Configurar Ollama para Chrome
6. Utilizar Smart Test AI
7. Comandos útiles
8. Solución de problemas
9. Privacidad y funcionamiento
10. Archivos del proyecto

## 1. Requisitos

- Windows 10 u 11.
- Google Chrome actualizado.
- Conexión a Internet para descargar Ollama y el modelo la primera vez.
- Varios GB de espacio libre para el modelo.
- Hardware suficiente para ejecutar un modelo local de 7B parámetros.

No necesitas una API de pago. Una vez descargado el modelo, el análisis se realiza localmente en tu equipo.

## 2. Instalar Ollama

Ollama es el programa que ejecuta la inteligencia artificial en tu ordenador.

### Método recomendado: instalador oficial

1. Entra en https://ollama.com/download/windows
2. Descarga el instalador de Windows.
3. Ejecuta el archivo y sigue los pasos.
4. Abre PowerShell desde el menú Inicio.

Comprueba la instalación:

```powershell
ollama --version
```

Si aparece un número de versión, está instalado.

### Alternativa: WinGet

Si tienes WinGet disponible, abre PowerShell y ejecuta:

```powershell
winget install --id Ollama.Ollama -e
```

Cuando termine, cierra y vuelve a abrir PowerShell. Comprueba:

```powershell
ollama --version
```

Si WinGet no está disponible o no encuentra el paquete, utiliza el instalador oficial.

## 3. Descargar el modelo

Smart Test AI 3.2.2 utiliza el modelo `qwen2.5:7b`.

En PowerShell ejecuta:

```powershell
ollama pull qwen2.5:7b
```

Espera a que finalice la descarga. Puede tardar dependiendo de tu conexión.

Comprueba que aparece instalado:

```powershell
ollama list
```

Debe aparecer `qwen2.5:7b`.

Haz una prueba manual:

```powershell
ollama run qwen2.5:7b
```

Escribe una pregunta para comprobar que responde. Para salir, escribe:

```text
/bye
```

No necesitas volver a descargar el modelo cada vez: queda guardado en el ordenador.

## 4. Instalar la extensión en Chrome

1. Descarga `smart-test-ai-3.2.2.zip` desde este repositorio.
2. Abre la carpeta de descargas.
3. Haz clic derecho en el ZIP y selecciona **Extraer todo**.
4. Abre la carpeta extraída `smart-test-ai-3.2.2`.
5. Comprueba que dentro está `manifest.json` junto con los demás archivos.
6. Abre Google Chrome y escribe:

```text
chrome://extensions
```

7. Activa **Modo de desarrollador**.
8. Pulsa **Cargar descomprimida**.
9. Selecciona la carpeta que contiene directamente `manifest.json`. No selecciones el ZIP ni una carpeta superior.
10. Comprueba que Smart Test AI aparece en la lista y que no muestra errores.

La extensión queda instalada como extensión local en modo desarrollador. Si modificas sus archivos, vuelve a `chrome://extensions` y pulsa el botón de recarga de la extensión.

## 5. Configurar Ollama para Chrome

Ollama debe permitir las solicitudes procedentes del identificador de la extensión. Esta configuración está relacionada con CORS, la protección que controla qué páginas pueden comunicarse con el servidor local.

### Paso 1. Copiar el ID de Chrome

1. Abre `chrome://extensions`.
2. Busca Smart Test AI.
3. Copia el campo **ID** que aparece debajo del nombre.

Cada extensión puede tener un identificador diferente.

### Paso 2. Cerrar Ollama si ya está abierto

Si Ollama está funcionando en segundo plano, ciérralo desde su icono de la bandeja del sistema, junto al reloj de Windows.

Después abre una nueva ventana de PowerShell.

### Paso 3. Permitir el origen de la extensión

Copia este comando y sustituye `ID_DE_TU_EXTENSION` por el identificador real:

```powershell
$env:OLLAMA_ORIGINS = "chrome-extension://ID_DE_TU_EXTENSION"
```

Ejemplo ficticio:

```powershell
$env:OLLAMA_ORIGINS = "chrome-extension://abcdefghijklmnopabcdefghijklmnop"
```

No copies el ejemplo ficticio: utiliza el ID que aparece en tu Chrome.

### Paso 4. Iniciar el servidor

En esa misma ventana de PowerShell ejecuta:

```powershell
ollama serve
```

Deja la ventana abierta mientras utilizas la extensión. Si cierras esa ventana, el servidor iniciado desde ella se detendrá.

**Importante:** la variable `$env:OLLAMA_ORIGINS` se aplica a esa sesión de PowerShell. Si reinicias Windows o cierras la ventana, tendrás que volver a establecerla y arrancar Ollama. Si cambia el ID de la extensión, actualiza el origen.

### Paso 5. Comprobar que Ollama responde

Abre otra ventana de PowerShell, sin cerrar la que ejecuta `ollama serve`, y ejecuta:

```powershell
Invoke-RestMethod -Uri "http://127.0.0.1:11434/api/tags" -Method Get
```

Si devuelve información de los modelos, el servidor está respondiendo.

## 6. Utilizar Smart Test AI

1. Comprueba que Ollama está funcionando.
2. Comprueba que `qwen2.5:7b` está instalado.
3. Abre un formulario de Google Forms compatible.
4. Haz **doble clic sobre el enunciado de la pregunta**.
5. Espera a que el modelo analice la pregunta y las opciones.
6. Comprueba qué opción se ha marcado y verifica la respuesta.

El tiempo de respuesta depende del equipo y de si el modelo ya está cargado en memoria.

**Limitaciones:**

- Está diseñada para páginas de Google Forms en `https://docs.google.com/forms/`.
- La activación se realiza mediante doble clic sobre la pregunta.
- La extensión intenta marcar la opción indicada por el modelo.
- No envía ni entrega el formulario.
- No se garantiza la compatibilidad con todos los tipos de pregunta o diseños de Google Forms.
- La respuesta de la IA no garantiza que la opción sea correcta.

## 7. Comandos útiles

Ejecuta estos comandos en PowerShell:

| Comando | Función |
|---|---|
| `ollama --version` | Muestra la versión de Ollama. |
| `ollama list` | Lista los modelos descargados. |
| `ollama pull qwen2.5:7b` | Descarga el modelo. |
| `ollama run qwen2.5:7b` | Prueba el modelo en la terminal. |
| `ollama ps` | Muestra los modelos que se están ejecutando. |
| `ollama stop qwen2.5:7b` | Detiene el modelo en ejecución. |
| `ollama serve` | Inicia el servidor local. |

Comprobar los modelos y el servidor:

```powershell
Invoke-RestMethod -Uri "http://127.0.0.1:11434/api/tags" -Method Get
```

Comprobar si el puerto 11434 está escuchando:

```powershell
Test-NetConnection 127.0.0.1 -Port 11434
```

Si `TcpTestSucceeded` aparece como `True`, hay un servicio escuchando en ese puerto.

## 8. Solución de problemas

### A. PowerShell dice que 'ollama' no se reconoce

**Causa posible:** Ollama no está instalado o PowerShell no ha actualizado la variable PATH.

**Solución:**

1. Instala Ollama desde https://ollama.com/download/windows.
2. Cierra PowerShell y abre una ventana nueva.
3. Ejecuta:

```powershell
ollama --version
```

Si sigue sin reconocer el comando, reinicia Windows y vuelve a probar.

### B. No se puede conectar con Ollama

**Síntoma:** la extensión no recibe respuesta o aparece un error de conexión.

**Solución:**

1. Comprueba que Ollama está abierto.
2. Ejecuta:

```powershell
Test-NetConnection 127.0.0.1 -Port 11434
```

3. Si no responde, inicia el servidor:

```powershell
ollama serve
```

4. Deja la ventana abierta y vuelve a probar.

### C. Error CORS o acceso bloqueado desde Chrome

**Causa posible:** Ollama no tiene permitido el origen de la extensión.

**Solución:**

1. Copia el ID actual desde `chrome://extensions`.
2. Cierra Ollama desde la bandeja del sistema.
3. En PowerShell ejecuta, sustituyendo el ID:

```powershell
$env:OLLAMA_ORIGINS = "chrome-extension://ID_DE_TU_EXTENSION"
ollama serve
```

4. Deja esa ventana abierta.
5. Comprueba que has escrito el ID correcto, sin espacios adicionales.

### D. El modelo no aparece en la lista

Ejecuta:

```powershell
ollama pull qwen2.5:7b
ollama list
```

Espera a que termine la descarga antes de utilizar la extensión.

### E. Chrome indica que la extensión no es válida

**Causa posible:** has seleccionado una carpeta incorrecta o el ZIP no se ha extraído correctamente.

**Solución:**

1. Extrae de nuevo el ZIP.
2. Busca la carpeta que contiene directamente `manifest.json`.
3. Abre `chrome://extensions`.
4. Pulsa **Cargar descomprimida** y selecciona esa carpeta.

No selecciones el archivo ZIP.

### F. No ocurre nada al hacer doble clic

Comprueba lo siguiente:

- Estás en una página de Google Forms compatible.
- Has hecho doble clic sobre el enunciado de la pregunta.
- La extensión está habilitada en `chrome://extensions`.
- Ollama está funcionando.
- El modelo aparece en `ollama list`.
- El origen configurado en Ollama coincide con el ID actual de la extensión.

Prueba el modelo directamente:

```powershell
ollama run qwen2.5:7b
```

Si tampoco responde desde PowerShell, el problema puede estar en Ollama o en el modelo y no en la extensión.

### G. La IA responde, pero no se marca ninguna opción

Puede ocurrir si Google Forms cambia su estructura, si la pregunta no es compatible o si la respuesta del modelo no coincide con las opciones detectadas.

Prueba con una pregunta sencilla de opción múltiple y comprueba que todas sus opciones se muestran correctamente. No se garantiza la compatibilidad con todos los formularios.

### H. El análisis tarda demasiado

La velocidad depende del procesador, la memoria RAM y los recursos disponibles. Cierra aplicaciones que consuman muchos recursos y comprueba el estado del modelo:

```powershell
ollama ps
```

La primera respuesta puede tardar más porque el modelo puede necesitar cargarse en memoria.

### I. El puerto 11434 ya está en uso

**Síntoma:** `ollama serve` indica que la dirección o el puerto ya está ocupado.

**Causa posible:** Ollama ya se está ejecutando en segundo plano.

Comprueba si responde:

```powershell
Test-NetConnection 127.0.0.1 -Port 11434
```

Si funciona, no necesitas iniciar otro servidor. Si necesitas cambiar `OLLAMA_ORIGINS`, cierra primero Ollama desde la bandeja del sistema y vuelve a iniciarlo con la variable configurada.

## 9. Privacidad y funcionamiento

- El modelo se ejecuta localmente mediante Ollama.
- La extensión se comunica con el servidor local de Ollama en `127.0.0.1`.
- No necesita una clave API ni una suscripción de IA de pago.
- La descarga inicial de Ollama y del modelo requiere Internet.
- La IA puede generar respuestas incorrectas; comprueba siempre el resultado.
- No introduzcas contraseñas, datos personales ni información confidencial en formularios o herramientas que no sean de confianza.

## 10. Archivos del proyecto

El ZIP incluye esta estructura:

```text
smart-test-ai-3.2.2/
├── manifest.json
├── background.js
├── content.js
├── style.css
└── LEEME.txt
```

- **manifest.json:** configuración y permisos de la extensión.
- **background.js:** comunicación con Ollama y procesamiento de la respuesta.
- **content.js:** detección de la interacción en Google Forms e intento de marcado de la opción.
- **style.css:** hoja de estilos.
- **LEEME.txt:** información incluida con la extensión.

## Descarga

[Descargar Smart Test AI 3.2.2](./ChuxAI%20GoogleForms/smart-test-ai-3.2.2.zip)

## Aviso

Smart Test AI es un proyecto de asistencia basado en inteligencia artificial. Se proporciona tal cual, sin garantía de que las respuestas sean correctas o de que funcione con todos los formularios. Utilízalo de forma responsable y respeta las normas de la plataforma y del centro educativo.
