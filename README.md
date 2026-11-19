# ChuxAI V2 — 4.0.0

Extensión de Chrome que conecta Google Forms con un modelo local de Ollama (\`qwen2.5:7b\`).

## Funciones

Al hacer doble clic sobre el enunciado, ChuxAI detecta el tipo de pregunta y realiza la acción correspondiente:

1. **Respuesta única:** analiza las opciones y marca una.
2. **Selección múltiple:** analiza las opciones y marca una o varias.
3. **Respuesta escrita:** genera una respuesta breve y la introduce en el campo.

La extensión no pulsa el botón Enviar ni entrega el formulario. La IA puede equivocarse; revisa siempre el resultado y utiliza la herramienta respetando las normas aplicables.

## Requisitos

- Windows 10/11.
- Google Chrome.
- [Ollama para Windows](https://ollama.com/download/windows).
- Modelo \`qwen2.5:7b\`.

Descarga el modelo desde PowerShell:

\`\`\`powershell
ollama pull qwen2.5:7b
\`\`\`

Comprueba que aparece:

\`\`\`powershell
ollama list
\`\`\`

## Instalar la extensión

1. Descarga o clona este repositorio.
2. Abre \`chrome://extensions\` en Chrome.
3. Activa **Modo de desarrollador**.
4. Pulsa **Cargar descomprimida**.
5. Selecciona la carpeta \`src\`, donde está \`manifest.json\`.
6. Copia el ID que Chrome asigna a la extensión.

## Iniciar Ollama

Ollama debe permitir el origen de la extensión. Cierra el servidor si ya estaba ejecutándose y, en PowerShell, ejecuta el siguiente comando sustituyendo el ID:

\`\`\`powershell
$env:OLLAMA_ORIGINS = "chrome-extension://ID_DE_TU_EXTENSION"
ollama serve
\`\`\`

Deja esa ventana abierta mientras utilizas la extensión. En otra ventana puedes comprobar el servidor:

\`\`\`powershell
Invoke-RestMethod "http://127.0.0.1:11434/api/tags"
\`\`\`

## Uso

1. Comprueba que Ollama está activo y que \`qwen2.5:7b\` está instalado.
2. Abre un Google Form compatible.
3. Haz doble clic sobre el enunciado de la pregunta.
4. Comprueba la opción marcada o el texto generado.

## Estructura

\`\`\`text
ChuxAI-Forms/
├── src/
│   ├── manifest.json
│   ├── content.js
│   ├── background.js
│   ├── style.css
│   └── LEEME.txt
└── README.md
\`\`\`

## Versión 4.0.0

- Añadido soporte para preguntas de respuesta única.
- Añadido soporte para selección múltiple.
- Añadida generación e inserción de respuestas escritas.
- Comunicación con Ollama mediante API local.
- Validación de opciones y respuestas devueltas por Qwen.

## Privacidad

Las preguntas se envían al servidor local de Ollama en \`127.0.0.1\`. El modelo se ejecuta en el propio equipo. No se requiere una API de IA externa. La descarga inicial de Ollama y del modelo sí necesita conexión a Internet.

**No se incluyen en este repositorio público** los binarios de Ollama, los pesos de Qwen, los perfiles de Chrome ni sesiones/cookies. Son archivos grandes o contienen datos privados. El repositorio contiene el código fuente de la extensión y su documentación.

## Aviso

Proyecto de asistencia basado en IA, proporcionado tal cual. No garantiza respuestas correctas ni compatibilidad con todos los formularios. Comprueba las respuestas y respeta las normas del centro educativo y de Google Forms.
