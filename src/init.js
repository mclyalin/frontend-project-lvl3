import 'bootstrap/js/dist/modal';

import i18next from 'i18next';
import resources from './locales';
import initView from './view.js';
import app from './app.js';

const defaultLanguage = 'ru';

export default () => {
  const i18n = i18next.createInstance();
  return i18n.init({
    lng: defaultLanguage,
    debug: true,
    resources,
  }).then(() => {
    const state = {
      feeds: [],
      posts: [],
      loadingProcess: {
        status: 'idle',
        error: null,
      },
      form: {
        error: null,
        valid: true,
      },
      modal: {
        postId: null,
      },
      ui: {
        seenPosts: new Set(),
      },
    };

    const elements = {
      form: document.querySelector('.rss-form'),
      input: document.querySelector('.rss-form input'),
      submit: document.querySelector('.rss-form button[type="submit"]'),
      feedback: document.querySelector('.feedback'),
      feedsBox: document.querySelector('.feeds'),
      postsBox: document.querySelector('.posts'),
      modal: document.querySelector('#modal'),
    };

    const watchedState = initView(state, elements, i18n);

    app(watchedState, elements);
  });
};
