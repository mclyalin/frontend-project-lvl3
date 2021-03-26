/* eslint-disable no-param-reassign, no-console  */

import onChange from 'on-change';

const renderForm = (state, elements) => {
  const { valid: formIsValid, error: errorMessage } = state.form;
  const { input, feedback } = elements;

  if (formIsValid) {
    input.classList.remove('is-invalid');
  } else {
    input.classList.add('is-invalid');
    feedback.classList.add('text-danger');
    feedback.textContent = errorMessage;
  }
};

const renderLoadingProcess = (state, elements) => {
  const { status: loadingStatus, error: errorMessage } = state.loadingProcess;
  const { input, submit, feedback } = elements;

  switch (loadingStatus) {
    case 'failed':
      submit.disabled = false;
      input.removeAttribute('readonly');
      feedback.classList.add('text-danger');
      feedback.textContent = errorMessage;
      break;
    case 'idle':
      submit.disabled = false;
      input.removeAttribute('readonly');
      input.value = '';
      feedback.classList.add('text-success');
      feedback.textContent = 'loading.success';
      input.focus();
      break;
    case 'loading':
      submit.disabled = true;
      input.setAttribute('readonly', true);
      feedback.classList.remove('text-success');
      feedback.classList.remove('text-danger');
      feedback.innerHTML = '';
      break;
    default:
      throw Error(`Unknown loadingStatus: ${loadingStatus}`);
  }
};

export default (state, elements) => onChange(state, (path) => {
  switch (path) {
    case 'form':
      renderForm(state, elements);
      break;
    case 'loadingProcess':
      renderLoadingProcess(state, elements);
      break;
    case 'feeds':
      break;
    case 'posts':
      break;
    default:
      throw Error(`Unknown state: ${path}`);
  }
});
