/* eslint-disable no-param-reassign, no-console  */

import onChange from 'on-change';

export default (state, elements, i18n) => {
  const renderForm = (form, { input, feedback }) => {
    if (form.valid) {
      input.classList.remove('is-invalid');
    } else {
      input.classList.add('is-invalid');
      feedback.classList.add('text-danger');
      feedback.textContent = i18n.t([`errors.${form.error}`, 'errors.unknown']);
    }
  };

  const renderLoadingProcess = (loadingProcess, { input, submit, feedback }) => {
    switch (loadingProcess.status) {
      case 'failed':
        submit.disabled = false;
        input.removeAttribute('readonly');
        feedback.classList.add('text-danger');
        feedback.textContent = i18n.t([`errors.${loadingProcess.error}`, 'errors.unknown']);
        break;
      case 'idle':
        submit.disabled = false;
        input.removeAttribute('readonly');
        input.value = '';
        feedback.classList.add('text-success');
        feedback.textContent = i18n.t('loading.success');
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
    h2.textContent = i18n.t('ui.feeds');

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

  const renderPosts = (posts, seenPosts, postsBox) => {
    const container = document.createDocumentFragment();

    const h2 = document.createElement('h2');
    h2.textContent = i18n.t('ui.posts');

    const ul = document.createElement('ul');
    ul.classList.add('list-group');
    const items = posts.map((post) => {
      const li = document.createElement('li');
      li.classList.add('list-group-item', 'd-flex', 'justify-content-between', 'align-items-start');
      const a = document.createElement('a');
      a.setAttribute('href', post.link);
      const fontWeight = seenPosts.has(post.id) ? 'font-weight-normal' : 'font-weight-bold';
      a.classList.add(fontWeight);
      a.dataset.id = post.id;
      a.textContent = post.title;
      a.setAttribute('target', '_blank');
      a.setAttribute('rel', 'noopener noreferrer');
      const button = document.createElement('button');
      button.setAttribute('type', 'button');
      button.classList.add('btn', 'btn-primary', 'btn-sm');
      button.dataset.id = post.id;
      button.dataset.toggle = 'modal';
      button.dataset.target = '#modal';
      button.textContent = i18n.t('ui.preview');
      li.append(a, button);
      return li;
    });
    ul.append(...items);

    container.append(h2, ul);

    postsBox.innerHTML = '';
    postsBox.append(container);
  };

  const renderModal = (posts, postId, modal) => {
    const post = posts.find(({ id }) => id === postId);
    const title = modal.querySelector('.modal-title');
    const body = modal.querySelector('.modal-body');
    const link = modal.querySelector('.full-article');

    title.textContent = post.title;
    body.textContent = post.description;
    link.href = post.link;
  };

  const mapping = {
    form: () => renderForm(state.form, elements),
    loadingProcess: () => renderLoadingProcess(state.loadingProcess, elements),
    feeds: () => renderFeeds(state.feeds, elements.feedsBox),
    posts: () => renderPosts(state.posts, state.ui.seenPosts, elements.postsBox),
    'modal.postId': () => renderModal(state.posts, state.modal.postId, elements.modal),
  };

  const watchedState = onChange(state, (path) => {
    if (mapping[path]) {
      mapping[path]();
    }
  });

  return watchedState;
};
