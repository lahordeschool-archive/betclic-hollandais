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
  
    if(lang){
      req.setLocale(lang);
    } else if (i18n && typeof i18n.getDefaultLocale === 'function') {
      req.setLocale(i18n.getDefaultLocale());
    } else {
      req.setLocale('en');
    }

    next();
  }

module.exports = lang;
    