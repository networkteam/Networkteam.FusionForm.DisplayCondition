import displayConditionInitializer from './Form/displayConditionInitializer';

export default function init() {
  // Initialize dynamic form display conditions last (for events in other plugins to be triggered)
  displayConditionInitializer();
}

init();