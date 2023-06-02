function serializeObject(form, namePrefix) {

  // Setup our serialized data
  let serialized = {};
  let fieldValue;

  // Loop through each field in the form
  for (let i = 0; i < form.elements.length; i++) {

    const field = form.elements[i];

    // Don't serialize fields without a name, submits, buttons, file and reset inputs, and disabled fields
    if (!field.name || field.type === 'reset' || field.type === 'submit' || field.type === 'button') continue;

    const [fieldName, isArray] = stripPrefix(namePrefix, field.name);
    // Ignore internal form fields (e.g. state)
    if (fieldName.substr(0, 2) === '__') {
      continue;
    }

    // If a multi-select, get all selections
    if (field.type === 'select-multiple') {
      fieldValue = field.options
        .filter(option => option.selected)
        .map(option => option.value);
    }

    // Checkbox value is toggled or not
    else if (field.type === 'checkbox') {
      fieldValue = field.checked;
    }

    // Radio value is value of checked field
    else if (field.type === 'radio') {
      if (field.checked) {
        fieldValue = field.value;
      } else if (typeof serialized[fieldName] === 'undefined') {
        fieldValue = null;
      }
    }

    // Just use the value
    else {
      fieldValue = field.value;
    }

    if (!isArray) {
      serialized[fieldName] = fieldValue;
    } else {
      serialized[fieldName] = serialized[fieldName] || [];
      // Filter empty values (falsy) and do not include in the array
      if (fieldValue) {
        serialized[fieldName].push(fieldValue);
      }
    }
  }

  return serialized;
}

function stripPrefix(prefix, name) {
  // Special treatment of file uploads with additional hidden fields to normalize field names
  if (name.indexOf('[originallySubmittedResource][__identity]') !== -1) {
    name = name.substr(0, name.length - '[originallySubmittedResource][__identity]'.length);
  }
  if (name.indexOf('[resource]') !== -1) {
    name = name.substr(0, name.length - '[resource]'.length);
  }

  if (name.indexOf(prefix + '[') === 0) {
    name = name.substr(prefix.length + 1);
    const bracketIndex = name.indexOf(']');
    name = name.substr(0, bracketIndex) + name.substr(bracketIndex + 1);
  }

  // If name contains brackets, it is an array so we strip the brackets and return the name and true
  if (name.indexOf('[') !== -1) {
    name = name.substr(0, name.indexOf('['));
    return [name, true];
  }

  return [name, false];
}

export default serializeObject;