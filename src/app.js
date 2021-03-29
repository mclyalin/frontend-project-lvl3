/* eslint-disable no-param-reassign, no-console  */

import axios from 'axios';
import * as yup from 'yup';
import _ from 'lodash';

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

export default (watchedState, elements) => {
  elements.form.addEventListener('submit', (e) => {
    e.preventDefault();

    const formData = new FormData(e.target);
    const targetUrl = formData.get('url').trim();
    const existingUrls = watchedState.feeds.map(({ url }) => url);

    const validationError = validate(targetUrl, existingUrls);
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
    url.searchParams.set('disableCache', true);
    url.searchParams.set('url', targetUrl);
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
          return;
        }
        const feed = {
          id: _.uniqueId(),
          url: targetUrl,
          title: data.title,
          description: data.description,
        };

        const posts = data.items.map((item) => ({
          id: _.uniqueId(),
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

        watchedState.loadingProcess = {
          status: 'idle',
          error: null,
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
