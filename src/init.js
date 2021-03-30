import i18n from 'i18next';
import resources from './locales';
import initView from './view.js';
import app from './app.js';

const defaultLanguage = 'en';

export default () => {
  i18n.init({
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
    };

    const watchedState = initView(state, elements, i18n);

    app(watchedState, elements);
  });
};
