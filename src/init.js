import i18n from 'i18next';
import resources from './locales';
import app from './app.js';

const defaultLanguage = 'ru';

export default () => {
  i18n.init({
    lng: defaultLanguage,
    debug: true,
    resources,
  }).then(() => {
    app();
  });
};
