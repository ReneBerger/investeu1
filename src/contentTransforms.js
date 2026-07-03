export const contentTransformRules = {
  DE: {
    replacements: [],
    translations: {}
  }
};

export function transformText(value, language = 'DE', rules = contentTransformRules) {
  if (!value) return '';

  const languageRules = rules[language] || rules.DE || { replacements: [], translations: {} };
  const translated = languageRules.translations[value] || value;
  return languageRules.replacements.reduce((text, rule) => {
    return text.replace(rule.search, rule.replace);
  }, translated).trim();
}

export function transformProperty(property, language = 'DE', rules = contentTransformRules) {
  return {
    ...property,
    title: transformText(property.title, language, rules),
    description: transformText(property.description, language, rules),
    details: property.details.map((detail) => transformText(detail, language, rules))
  };
}
