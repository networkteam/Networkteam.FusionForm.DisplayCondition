import {compile} from '@networkteam/eel';

import serializeObject from './serializeObject';

const formElementSelector = '[data-display-condition]';
const formElementTypeSelectors = 'input, select, textarea'

/**
 * Evaluate display conditions and watch for changes in the form
 *
 * @param formElement
 * @returns function Cleanup to remove event listeners
 */
function displayConditionEvaluator(formElement) {
  const exprs = compileExpressions(formElement);

  evaluateFormDisplayConditions(formElement, exprs);

  const onChange = function() {
    evaluateFormDisplayConditions(formElement, exprs);
  };

  formElement.addEventListener('change', onChange);

  return function cleanup() {
    formElement.removeEventListener('change', onChange);
  }
}

/**
 * Evaluate display conditions on all form elements
 *
 * @param formElement
 * @param exprs Pre-compiled expressions for display conditions
 */
function evaluateFormDisplayConditions(formElement, exprs) {
  const data = getFormData(formElement);

  formElement.querySelectorAll(formElementSelector).forEach(el => {
    const displayCondition = el.getAttribute('data-display-condition');

    const expr = exprs[displayCondition];
    if (typeof expr === 'undefined') {
      return;
    }

    const evaluatedCondition = expr(data);
    if (evaluatedCondition) {
      showElement(el);
    } else {
      hideElement(el);
    }
  });

  const evt = new CustomEvent('condition-done', {bubbles: true});
  formElement.dispatchEvent(evt);
}

function setFormElementsAccessibility(el, accessible = true) {
  const formElements = el.querySelectorAll(formElementTypeSelectors);

  if (el.matches && el.matches(formElementTypeSelectors)) {
    formElements.push(el);
  }

  // This is a fallback for IE11
  if (el.msMatchesSelector && el.msMatchesSelector(formElementTypeSelectors)) {
    formElements.push(el);
  }

  [...formElements].forEach(formElement => {
    if (accessible) {
      if (formElement.dataset.disabledByDisplayCondition) {
        formElement.removeAttribute('disabled');
        delete formElement.dataset.disabledByDisplayCondition;
      }
    } else {
      if (!formElement.hasAttribute('disabled')) {
        formElement.dataset.disabledByDisplayCondition = true;
        formElement.setAttribute('disabled', '');
      }
    }
  });
}

function showElement(el) {
  el.classList.remove('js-hidden');

  const isVisible = !el.closest('.js-hidden');
  if (isVisible) {
    setFormElementsAccessibility(el, true);

    const evt = new CustomEvent('condition-show', {bubbles: true});
    el.dispatchEvent(evt);
  }
}

function hideElement(el) {
  el.classList.add('js-hidden');

  setFormElementsAccessibility(el, false);

  const evt = new CustomEvent('condition-hide', {bubbles: true});
  el.dispatchEvent(evt);
}

/**
 * Get form data (state from previous steps and current values from form elements)
 *
 * @param formElement
 */
export function getFormData(formElement) {
  let data = {};

  // Set form data from form state, if present
  const formState = formElement.getAttribute('data-form-state');
  if (formState) {
    data = JSON.parse(formState);
  }

  // Form element names will be like "--formId[elementId]", we just want "elementId"
  const currentData = serializeObject(formElement, `${formElement.id}`)

  // Override form data from current values in form
  for (let identifier in currentData) {
    if (currentData.hasOwnProperty(identifier)) {
      data[identifier] = currentData[identifier];
    }
  }

  return data;
}

/**
 * Pre-compile all display conditions of elements in the form
 *
 * @param formElement
 */
function compileExpressions(formElement) {
  const exprs = {};
  formElement.querySelectorAll(formElementSelector).forEach(el => {
    const displayCondition = el.getAttribute('data-display-condition');

    exprs[displayCondition] = compile(displayCondition);
  });

  return exprs;
}

export default displayConditionEvaluator;
