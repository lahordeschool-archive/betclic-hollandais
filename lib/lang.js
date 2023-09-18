const i18n = require("i18n");
const lang = (req, res, next) => {
    // First, check if the user has set a language via query parameter
    let lang = req.query.lang;
  
    // If not, use the Accept-Language header
    if (!lang) {
      const acceptedLanguages = req.acceptsLanguages();
      for (let i = 0; i < acceptedLanguages.length; i++) {
        const language = acceptedLanguages[i];
        if (i18n.getLocales().includes(language)) {
          lang = language;
          break;
        }
      }
    }
  
    // If a matching language is found, set it. Otherwise, fallback to the default language.
    lang ? req.setLocale(lang) : req.setLocale(i18n.getDefaultLocale());
  
    next();
  }

module.exports = lang;
    