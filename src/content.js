let busy = false;

function cleanText(text) {
  return String(text || '')
    .replace(/\s+/g, ' ')
    .trim();
}

// Detectar el bloque de la pregunta
function getQuestionRoot(target) {
  return target.closest('[role="listitem"]')
    || target.closest('.Qr7Oae')
    || target.closest('[data-params]');
}

// Obtener el enunciado
function extractQuestion(root) {
  const titleNode =
    root.querySelector('.M7eMe')
    || root.querySelector('.HoXoMd')
    || root.querySelector('[role="heading"]');

  return cleanText(titleNode?.innerText);
}

// Obtener texto de las opciones
function getOptionText(control) {
  return cleanText(
    control.getAttribute('aria-label')
    || control.querySelector('.aDTYNe')?.innerText
    || control.innerText
    || control.getAttribute('data-value')
    || ''
  );
}

// Obtener campos de respuesta escrita
function getTextField(root) {
  const fields = [
    ...root.querySelectorAll(
      'input[type="text"], textarea, [contenteditable="true"]'
    )
  ];

  return fields.find(field => {
    const style = window.getComputedStyle(field);

    return !field.disabled
      && !field.readOnly
      && style.display !== 'none'
      && style.visibility !== 'hidden'
      && field.getAttribute('aria-hidden') !== 'true';
  });
}

// Introducir texto en Google Forms
function writeText(field, text) {
  if (field.isContentEditable) {
    field.focus();
    field.textContent = text;
    field.dispatchEvent(new InputEvent('input', {
      bubbles: true,
      inputType: 'insertText',
      data: text
    }));
    field.dispatchEvent(new Event('change', {
      bubbles: true
    }));
    return;
  }

  const prototype = field instanceof HTMLTextAreaElement
    ? HTMLTextAreaElement.prototype
    : HTMLInputElement.prototype;

  const setter = Object.getOwnPropertyDescriptor(
    prototype,
    'value'
  )?.set;

  field.focus();

  if (setter) {
    setter.call(field, text);
  } else {
    field.value = text;
  }

  field.dispatchEvent(new Event('input', {
    bubbles: true
  }));

  field.dispatchEvent(new Event('change', {
    bubbles: true
  }));
}

// Ejecutar análisis al hacer doble clic
document.addEventListener('dblclick', async event => {
  if (busy) return;

  const root = getQuestionRoot(event.target);

  if (!root) return;

  const question = extractQuestion(root);

  if (!question) {
    console.warn('[ChuxAI] No se pudo leer el enunciado.');
    return;
  }

  const radios = [
    ...root.querySelectorAll('[role="radio"]')
  ];

  const checkboxes = [
    ...root.querySelectorAll('[role="checkbox"]')
  ];

  const textField = getTextField(root);

  let mode = null;
  let controls = [];
  let options = [];

  if (radios.length >= 2) {
    mode = 'SINGLE';
    controls = radios;
  } else if (checkboxes.length >= 2) {
    mode = 'MULTIPLE';
    controls = checkboxes;
  } else if (textField) {
    mode = 'TEXT';
  } else {
    console.warn(
      '[ChuxAI] No se reconoce el tipo de pregunta.',
      { question, radios: radios.length, checkboxes: checkboxes.length }
    );
    return;
  }

  if (mode !== 'TEXT') {
    options = controls.map(getOptionText);

    if (options.some(option => !option)) {
      console.warn('[ChuxAI] No se han podido leer todas las opciones.');
      return;
    }
  }

  busy = true;

  console.log('[ChuxAI] Tipo:', mode);
  console.log('[ChuxAI] Pregunta:', question);

  if (options.length) {
    console.log('[ChuxAI] Opciones:', options);
  }

  try {
    let result;

    if (mode === 'SINGLE') {
      result = await chrome.runtime.sendMessage({
        type: 'ANALYZE_SINGLE',
        question,
        options
      });

    } else if (mode === 'MULTIPLE') {
      result = await chrome.runtime.sendMessage({
        type: 'ANALYZE_MULTIPLE',
        question,
        options
      });

    } else {
      result = await chrome.runtime.sendMessage({
        type: 'GENERATE_TEXT',
        question
      });
    }

    if (!result || !result.ok) {
      throw new Error(result?.error || 'Respuesta no válida.');
    }

    if (mode === 'SINGLE') {
      const selected = controls[result.index];

      if (!selected) {
        throw new Error('No se encontró la opción seleccionada.');
      }

      selected.click();

      console.log('[ChuxAI] Respuesta:', result.letter);
      console.log('[ChuxAI] Test completado.');

    } else if (mode === 'MULTIPLE') {
      if (!Array.isArray(result.indexes) || !result.indexes.length) {
        throw new Error('Qwen no ha devuelto opciones válidas.');
      }

      result.indexes.forEach(index => {
        if (controls[index] &&
            controls[index].getAttribute('aria-checked') !== 'true') {
          controls[index].click();
        }
      });

      console.log('[ChuxAI] Opciones seleccionadas:', result.letters);
      console.log('[ChuxAI] Selección múltiple completada.');

    } else {
      if (!result.text) {
        throw new Error('Qwen no ha generado ningún texto.');
      }

      writeText(textField, result.text);

      console.log('[ChuxAI] Texto generado:', result.text);
      console.log('[ChuxAI] Respuesta escrita correctamente.');
    }

  } catch (error) {
    console.error('[ChuxAI] Error:', error);

  } finally {
    busy = false;
  }
}, true);

console.log('[ChuxAI V2] Sistema de tres tipos de pregunta cargado.');
