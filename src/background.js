const OLLAMA_URL = 'http://127.0.0.1:11434/api/chat';
const MODEL = 'qwen2.5:7b';
const TIMEOUT_MS = 120000;

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  let task;

  if (message?.type === 'ANALYZE_SINGLE') {
    task = analyzeSingle(message.question, message.options);

  } else if (message?.type === 'ANALYZE_MULTIPLE') {
    task = analyzeMultiple(message.question, message.options);

  } else if (message?.type === 'GENERATE_TEXT') {
    task = generateText(message.question);

  } else {
    return;
  }

  task
    .then(sendResponse)
    .catch(error => {
      sendResponse({
        ok: false,
        error: error.message || String(error)
      });
    });

  return true;
});

// Consulta común a Ollama
async function askQwen(prompt) {
  const controller = new AbortController();

  const timeout = setTimeout(
    () => controller.abort(),
    TIMEOUT_MS
  );

  try {
    const response = await fetch(OLLAMA_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: MODEL,
        messages: [
          {
            role: 'user',
            content: prompt
          }
        ],
        stream: false,
        format: 'json',
        options: {
          temperature: 0.2
        }
      }),
      signal: controller.signal
    });

    if (!response.ok) {
      throw new Error(
        `Ollama respondió con error HTTP ${response.status}.`
      );
    }

    const data = await response.json();

    if (data.error) {
      throw new Error(data.error);
    }

    const raw = data?.message?.content;

    if (typeof raw !== 'string' || !raw.trim()) {
      throw new Error('Qwen no ha devuelto ninguna respuesta.');
    }

    try {
      return JSON.parse(raw);
    } catch {
      throw new Error('Qwen no ha devuelto un JSON válido.');
    }

  } catch (error) {
    if (error.name === 'AbortError') {
      throw new Error('La consulta a Qwen ha superado el tiempo límite.');
    }

    throw error;

  } finally {
    clearTimeout(timeout);
  }
}

// Validar preguntas y opciones
function validateQuestion(question, options) {
  if (typeof question !== 'string' || !question.trim()) {
    throw new Error('La pregunta está vacía.');
  }

  if (!Array.isArray(options) ||
      options.length < 2 ||
      options.length > 26) {
    throw new Error('El número de opciones no es válido.');
  }

  const cleanOptions = options.map(option =>
    String(option || '').trim()
  );

  if (cleanOptions.some(option => !option)) {
    throw new Error('Hay opciones vacías.');
  }

  return cleanOptions;
}

// TEST: una respuesta
async function analyzeSingle(question, options) {
  const cleanOptions = validateQuestion(question, options);

  const numbered = cleanOptions
    .map((option, index) =>
      `${String.fromCharCode(65 + index)}. ${option}`
    )
    .join('\n');

  const prompt = `
Resuelve la siguiente pregunta tipo test.

Elige exclusivamente una opción.
No inventes respuestas.

Pregunta:
${question}

Opciones:
${numbered}

Devuelve únicamente JSON:
{"answer":"A","explanation":"Explicación breve"}

En answer escribe solamente la letra elegida.
`;

  const result = await askQwen(prompt);

  const letter = String(result.answer || '')
    .trim()
    .toUpperCase();

  if (!/^[A-Z]$/.test(letter)) {
    throw new Error('Qwen no ha devuelto una letra válida.');
  }

  const index = letter.charCodeAt(0) - 65;

  if (index < 0 || index >= cleanOptions.length) {
    throw new Error('Qwen ha elegido una opción inexistente.');
  }

  return {
    ok: true,
    letter,
    index,
    explanation: String(result.explanation || '')
  };
}

// SELECCIÓN MÚLTIPLE: varias respuestas
async function analyzeMultiple(question, options) {
  const cleanOptions = validateQuestion(question, options);

  const numbered = cleanOptions
    .map((option, index) =>
      `${String.fromCharCode(65 + index)}. ${option}`
    )
    .join('\n');

  const prompt = `
Resuelve la siguiente pregunta de selección múltiple.

Puede haber una o varias respuestas correctas.
Selecciona todas las opciones correctas, pero no selecciones opciones incorrectas.
No inventes respuestas.

Pregunta:
${question}

Opciones:
${numbered}

Devuelve únicamente JSON:
{"answers":["A","C"],"explanation":"Explicación breve"}

En answers incluye las letras de todas las opciones correctas.
`;

  const result = await askQwen(prompt);

  if (!Array.isArray(result.answers) || !result.answers.length) {
    throw new Error('Qwen no ha devuelto una lista de respuestas.');
  }

  const indexes = [
    ...new Set(
      result.answers.map(answer => {
        const letter = String(answer).trim().toUpperCase();

        if (!/^[A-Z]$/.test(letter)) {
          throw new Error('Qwen ha devuelto una letra inválida.');
        }

        const index = letter.charCodeAt(0) - 65;

        if (index < 0 || index >= cleanOptions.length) {
          throw new Error('Qwen ha seleccionado una opción inexistente.');
        }

        return index;
      })
    )
  ];

  return {
    ok: true,
    indexes,
    letters: indexes.map(index =>
      String.fromCharCode(65 + index)
    ),
    explanation: String(result.explanation || '')
  };
}

// RESPUESTA ESCRITA
async function generateText(question) {
  if (typeof question !== 'string' || !question.trim()) {
    throw new Error('La pregunta está vacía.');
  }

  const prompt = `
Responde a esta pregunta de informática.

Pregunta:
${question}

Instrucciones:
- Utiliza español.
- Nivel de estudiante de Grado Medio SMR.
- Responde de forma sencilla, natural y directa.
- Incluye los conceptos importantes necesarios.
- Sé breve, normalmente entre una y tres frases.
- No añadas introducciones ni conclusiones innecesarias.
- No inventes datos.

Devuelve únicamente JSON:
{"text":"Respuesta completa y breve"}
`;

  const result = await askQwen(prompt);

  const text = String(result.text || '').trim();

  if (!text) {
    throw new Error('Qwen no ha generado texto.');
  }

  return {
    ok: true,
    text
  };
}

console.log('[ChuxAI V2] Background preparado.');
