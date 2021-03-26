/* eslint-disable no-param-reassign, no-console  */

import onChange from 'on-change';

const renderForm = (form, elements) => {
  const { input, feedback } = elements;

  if (form.valid) {
    input.classList.remove('is-invalid');
  } else {
    input.classList.add('is-invalid');
    feedback.classList.add('text-danger');
    feedback.textContent = form.error;
  }
};

const renderLoadingProcess = (loadingProcess, elements) => {
  const { input, submit, feedback } = elements;

  switch (loadingProcess.status) {
    case 'failed':
      submit.disabled = false;
      input.removeAttribute('readonly');
      feedback.classList.add('text-danger');
      feedback.textContent = loadingProcess.error;
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
      throw Error(`Unknown loadingProcess status: ${loadingProcess.status}`);
  }
};

const renderFeeds = (feeds, feedsBox) => {
  const container = document.createDocumentFragment();

  const h2 = document.createElement('h2');
  h2.textContent = 'feeds';

  const ul = document.createElement('ul');
  ul.classList.add('list-group', 'mb-5');
  const items = feeds.map((feed) => {
    const li = document.createElement('li');
    li.classList.add('list-group-item');
    const h3 = document.createElement('h3');
    h3.textContent = feed.title;
    const p = document.createElement('p');
    p.textContent = feed.description;
    li.append(h3, p);
    return li;
  });
  ul.append(...items);

  container.append(h2, ul);

  feedsBox.innerHTML = '';
  feedsBox.append(container);
};

export default (state, elements) => {
  const mapping = {
    form: () => renderForm(state.form, elements),
    loadingProcess: () => renderLoadingProcess(state.loadingProcess, elements),
    feeds: () => renderFeeds(state.feeds, elements.feedsBox),
    posts: () => {},
  };

  const watchedState = onChange(state, (path) => {
    if (mapping[path]) {
      mapping[path]();
    }
  });

  return watchedState;
};
