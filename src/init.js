import axios from 'axios';
import * as yup from 'yup';
import _ from 'lodash';
import initView from './view.js';

const parse = (str) => {
  const doc = (new DOMParser()).parseFromString(str, 'text/xml');
  if (doc.querySelector('parsererror')) {
    return null;
  }

  const title = doc.querySelector('title').textContent;
  const description = doc.querySelector('description').textContent;
  const link = doc.querySelector('link').textContent;
  const elements = doc.querySelectorAll('item');
  const items = Array.from(elements).map((element) => ({
    title: element.querySelector('title').textContent,
    description: element.querySelector('description').textContent,
    link: element.querySelector('link').textContent,
  }));
  return {
    title,
    description,
    link,
    items,
  };
};

const validate = (value, links = []) => {
  const schema = yup
    .string()
    .required()
    .url()
    .notOneOf(links);

  try {
    schema.validateSync(value);
    return null;
  } catch (err) {
    return err.type;
  }
};

export default () => {
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
  };

  const elements = {
    form: document.querySelector('.rss-form'),
    input: document.querySelector('.rss-form input'),
    submit: document.querySelector('.rss-form button[type="submit"]'),
    feedback: document.querySelector('.feedback'),
    feedsBox: document.querySelector('.feeds'),
    postsBox: document.querySelector('.posts'),
  };

  const watchedState = initView(state, elements);

  elements.form.addEventListener('submit', (e) => {
    e.preventDefault();

    const formData = new FormData(e.target);
    const value = formData.get('url').trim();

    const validationError = validate(value);
    if (validationError) {
      watchedState.form = {
        error: validationError,
        valid: false,
      };
      return;
    }

    watchedState.form = {
      error: null,
      valid: true,
    };

    const url = new URL('/get', 'https://hexlet-allorigins.herokuapp.com');
    url.searchParams.set('url', value);
    const promise = axios.get(url.toString());

    watchedState.loadingProcess = {
      status: 'loading',
      error: null,
    };

    promise
      .then((response) => {
        const data = parse(response.data.contents);
        if (!data) {
          watchedState.loadingProcess = {
            status: 'failed',
            error: 'noRss',
          };
        }
        const feed = {
          id: _.uniqueId(),
          url: data.link,
          title: data.title,
          description: data.description,
        };

        const posts = data.items.map((item) => ({
          id: _.uniqueId(),
          channelId: feed.id,
          url: item.link,
          title: item.title,
          description: item.description,
        }));

        watchedState.feeds = [
          feed,
          ...watchedState.feeds,
        ];

        watchedState.posts = [
          ...posts,
          ...watchedState.posts,
        ];

        watchedState.loadingProcess = {
          error: null,
          state: 'idle',
        };
      })
      .catch((err) => {
        watchedState.loadingProcess = {
          status: 'failed',
          error: 'network',
        };
        throw err;
      });
  });
};
