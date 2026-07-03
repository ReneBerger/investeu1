export const contentTransformRules = {
  replacements: [],
  translations: {}
};

export function transformText(value, rules = contentTransformRules) {
  if (!value) return '';

  const translated = rules.translations[value] || value;
  return rules.replacements.reduce((text, rule) => {
    return text.replace(rule.search, rule.replace);
  }, translated).trim();
}

export function transformProperty(property, rules = contentTransformRules) {
  return {
    ...property,
    title: transformText(property.title, rules),
    description: transformText(property.description, rules),
    details: property.details.map((detail) => transformText(detail, rules))
  };
}
