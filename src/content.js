let busy = false;

function getQuestionRoot(target) {
  return target.closest('[role="listitem"]') || target.closest('.Qr7Oae') || target.closest('[data-params]');
}

function cleanText(node) {
  return (node?.innerText || node?.textContent || '').replace(/\\s+/g, ' ').trim();
}

function extractQuestion(root) {
  const radios = [...root.querySelectorAll('[role="radio"]')];
  const checkboxes = [...root.querySelectorAll('[role="checkbox"]')];
  const controls = radios.length ? radios : checkboxes;
  const options = controls.map(el => {
    const label = el.getAttribute('aria-label') || el.querySelector('[ dir], .aDTYNe, .ulDsOb')?.textContent || el.parentElement?.innerText || el.innerText;
    return (label || '').replace(/\\s+/g, ' ').trim();
  }).filter(Boolean);
  const titleNode = root.querySelector('[role="heading"], .M7eMe, .HoXoMd, .z12, .YEVVod');
  let question = cleanText(titleNode);
  if (!question) {
    question = cleanText(root);
    for (const option of options) question = question.replace(option, ' ');
    question = question.replace(/\\s+/g, ' ').trim();
  }
  return { question, options, controls };
}

// Analiza al hacer doble clic y marca la opción directamente.
// No crea paneles, avisos, textos ni elementos visibles en el formulario.
document.addEventListener('dblclick', async event => {
  const root = getQuestionRoot(event.target);
  if (!root || busy) return;

  const { question, options, controls } = extractQuestion(root);
  if (!question || options.length < 2 || !controls.length) return;

  busy = true;
  try {
    const result = await chrome.runtime.sendMessage({
      type: 'ANALYZE_QUESTION',
      question,
      options
    });
    if (!result?.ok) return;

    const selected = controls[result.index];
    if (selected) selected.click();
  } catch (_) {
    // Funcionamiento silencioso: no insertar mensajes en el formulario.
  } finally {
    busy = false;
  }
}, true);
