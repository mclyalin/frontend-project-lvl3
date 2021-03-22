import * as yup from 'yup';
// import axios from 'axios';
import initView from './view.js';

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
    console.log(err.message);
    return err.message;
  }
};

export default () => {
  const state = {
    error: null,
    form: {
      status: 'filling',
      fields: {
        input: {
          valid: true,
          error: null,
        },
      },
    },
  };

  const elements = {
    form: document.querySelector('.rss-form'),
    input: document.querySelector('.rss-form input'),
    button: document.querySelector('.rss-form button'),
    feedback: document.querySelector('.feedback'),
    feeds: document.querySelector('.feeds'),
    posts: document.querySelector('.posts'),
  };

  const watched = initView(state, elements);

  elements.form.addEventListener('submit', (e) => {
    e.preventDefault();

    const formData = new FormData(e.target);
    const value = formData.get('url').trim();

    const error = validate(value);
    if (error) {
      watched.form.fields.input = {
        error,
        valid: false,
      };
      return;
    }

    watched.form.fields.input = {
      error: null,
      valid: true,
    };
  });
};
