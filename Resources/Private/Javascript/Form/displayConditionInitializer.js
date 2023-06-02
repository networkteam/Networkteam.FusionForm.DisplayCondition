import displayConditionEvaluator from './displayConditionEvaluator';

/**
 * Initialize display condition evaluation on all forms matching the selector
 *
 * @param selector
 * @returns function Cleanup to de-initialize
 */
function displayConditionInitializer(selector = 'form.dynamic-form') {
  const cleanupFns = [];
  document.querySelectorAll(selector).forEach((el) => {
    const cleanupEvaluator = displayConditionEvaluator(el);
    cleanupFns.push(cleanupEvaluator);
  });

  return function cleanupAll() {
    cleanupFns.forEach(fn => fn());
  }
}

export default displayConditionInitializer;
