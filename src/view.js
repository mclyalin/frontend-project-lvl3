/* eslint-disable no-param-reassign, no-console  */

import onChange from 'on-change';

const renderForm = () => {};

const renderFormError = (form, elements) => {
  elements.feedback.innerHTML = '';

  const field = form.fields.input;

  if (field.valid) {
    elements.input.classList.remove('is-invalid');
  } else {
    elements.input.classList.add('is-invalid');
    elements.feedback.classList.add('text-danger');
    elements.feedback.textContent = form.fields.input.error;
  }
};

const renderAppError = () => {};

export default (state, elements) => {
  elements.input.focus();

  const mapping = {
    'form.status': () => renderForm(state.form, elements),
    'form.fields.input': () => renderFormError(state.form, elements),
    error: () => renderAppError(state.error, elements),
  };

  const watchedState = onChange(state, (path) => {
    if (mapping[path]) {
      mapping[path]();
    }
  });

  return watchedState;
};
