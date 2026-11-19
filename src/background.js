const OLLAMA_URL = 'http://127.0.0.1:11434/api/chat';
const MODEL = 'qwen2.5:7b';

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message?.type !== 'ANALYZE_QUESTION') return;
  analyze(message.question, message.options)
    .then(sendResponse)
    .catch(error => sendResponse({ ok: false, error: error.message || String(error) }));
  return true;
});

async function analyze(question, options) {
  const numbered = options.map((option, index) => `${String.fromCharCode(65 + index)}. ${option}`).join('\n');
  const prompt = `Resuelve esta pregunta tipo test. Elige exclusivamente una de las opciones proporcionadas.\n\nPregunta: ${question}\n\nOpciones:\n${numbered}\n\nDevuelve SOLO un JSON válido con este formato exacto: {"answer":"A","explanation":"Explicación breve en español","confidence":"alta"}. En answer escribe únicamente la letra de la opción elegida. No inventes opciones.`;
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 120000);
  try {
    const response = await fetch(OLLAMA_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ model: MODEL, messages: [{ role: 'user', content: prompt }], stream: false, format: 'json' }),
      signal: controller.signal
    });
    if (!response.ok) throw new Error(`Ollama respondió con error HTTP ${response.status}.`);
    const data = await response.json();
    const raw = data?.message?.content || '';
    let parsed;
    try { parsed = JSON.parse(raw); }
    catch {
      const match = raw.match(/\{[\s\S]*\}/);
      if (!match) throw new Error('Qwen no devolvió una respuesta con formato válido.');
      parsed = JSON.parse(match[0]);
    }
    const letter = String(parsed.answer || '').trim().toUpperCase().match(/[A-Z]/)?.[0];
    const index = letter ? letter.charCodeAt(0) - 65 : -1;
    if (index < 0 || index >= options.length) throw new Error('Qwen ha indicado una opción que no existe.');
    return { ok: true, letter, index, explanation: String(parsed.explanation || 'Sin explicación.'), confidence: String(parsed.confidence || 'no indicada') };
  } catch (error) {
    if (error.name === 'AbortError') throw new Error('La consulta ha tardado demasiado. Comprueba que Ollama sigue activo.');
    throw error;
  } finally { clearTimeout(timeout); }
}
