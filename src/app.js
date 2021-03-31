/* eslint-disable no-param-reassign, no-console  */

import axios from 'axios';
import * as yup from 'yup';
import { uniqueId, differenceBy } from 'lodash';

const timeout = 5000;

const validate = (value, list = []) => {
  yup.setLocale({
    string: {
      url: 'notUrl',
    },
    mixed: {
      required: 'required',
      notOneOf: 'exists',
    },
  });

  const schema = yup
    .string()
    .required()
    .url()
    .notOneOf(list);

  try {
    schema.validateSync(value);
    return null;
  } catch (err) {
    return err.message;
  }
};

const buildUrlString = (url) => {
  const proxy = 'https://hexlet-allorigins.herokuapp.com';
  const result = new URL('/get', proxy);
  result.searchParams.set('disableCache', true);
  result.searchParams.set('url', url);
  return result.toString();
};

const parse = (str) => {
  const doc = (new DOMParser()).parseFromString(str, 'text/xml');
  if (doc.querySelector('parsererror')) {
    return null;
  }
  const title = doc.querySelector('title').textContent;
  const description = doc.querySelector('description').textContent;
  const elements = doc.querySelectorAll('item');
  const items = Array.from(elements).map((element) => ({
    title: element.querySelector('title').textContent,
    description: element.querySelector('description').textContent,
    link: element.querySelector('link').textContent,
  }));
  return {
    title,
    description,
    items,
  };
};

const postsUpdater = (watchedState) => {
  const promises = watchedState.feeds.map(({ id, url }) => {
    const promise = axios
      .get(buildUrlString(url))
      .then((response) => {
        const { items: current } = parse(response.data.contents);
        const existing = watchedState.posts.filter(({ channelId }) => channelId === id);
        const newPosts = differenceBy(current, existing, 'title')
          .map(({ title, description, link }) => (
            {
              id: uniqueId(),
              channelId: id,
              title,
              description,
              link,
            }
          ));

        watchedState.posts = [
          ...newPosts,
          ...watchedState.posts,
        ];
      });
    return promise;
  });

  Promise.all(promises).finally(() => {
    setTimeout(() => postsUpdater(watchedState), timeout);
  });
};

export default (watchedState, elements) => {
  elements.form.addEventListener('submit', (e) => {
    e.preventDefault();

    const formData = new FormData(e.target);
    const url = formData.get('url').trim();
    const existingUrls = watchedState.feeds.map((feed) => feed.url);

    const validationError = validate(url, existingUrls);
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

    watchedState.loadingProcess = {
      status: 'loading',
      error: null,
    };

    const promise = axios.get(buildUrlString(url));
    promise.then((response) => {
      const data = parse(response.data.contents);
      if (!data) {
        watchedState.loadingProcess = {
          status: 'failed',
          error: 'noRss',
        };
        return;
      }

      watchedState.loadingProcess = {
        status: 'idle',
        error: null,
      };

      const feed = {
        id: uniqueId(),
        url,
        title: data.title,
        description: data.description,
      };

      const posts = data.items.map((item) => ({
        id: uniqueId(),
        channelId: feed.id,
        title: item.title,
        description: item.description,
        link: item.link,
      }));

      watchedState.feeds = [
        feed,
        ...watchedState.feeds,
      ];

      watchedState.posts = [
        ...posts,
        ...watchedState.posts,
      ];
    })
      .catch((err) => {
        watchedState.loadingProcess = {
          status: 'failed',
          error: 'network',
        };
        throw err;
      })
      .finally(() => {
        setTimeout(() => postsUpdater(watchedState), timeout);
      });
  });

  elements.postsBox.addEventListener('click', (e) => {
    if (e.target.dataset.id) {
      const { id } = e.target.dataset;
      watchedState.modal.postId = String(id);
      watchedState.ui.seenPosts.add(id);
    }
  });
};
