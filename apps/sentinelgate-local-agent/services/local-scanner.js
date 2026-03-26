const RULE_DEFINITIONS = [
  {
    type: "EMAIL_ADDRESS",
    ruleId: "email-address",
    label: "Email address",
    severity: "LOW",
    regex: /\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/gi,
    explanation: "Contains an email address that could identify a person or account."
  },
  {
    type: "PHONE_NUMBER",
    ruleId: "phone-number",
    label: "Phone number",
    severity: "LOW",
    regex: /\b(?:\+?\d{1,3}[\s.-]?)?(?:\(?\d{2,4}\)?[\s.-]?)\d{3}[\s.-]?\d{4}\b/g,
    explanation: "Contains a phone number that should stay inside the trusted boundary."
  },
  {
    type: "LONG_NUMERIC_IDENTIFIER",
    ruleId: "long-numeric-identifier",
    label: "Long numeric identifier",
    severity: "HIGH",
    regex: /\b\d{8,}\b/g,
    explanation: "Contains a long numeric identifier that may be sensitive."
  },
  {
    type: "CONFIDENTIAL_KEYWORD",
    ruleId: "confidential-keyword",
    label: "Confidential keyword",
    severity: "MEDIUM",
    regex: /\bconfidential\b/gi,
    explanation: "Contains the keyword 'confidential', which suggests restricted handling."
  },
  {
    type: "INTERNAL_ONLY_KEYWORD",
    ruleId: "internal-only-keyword",
    label: "Internal only keyword",
    severity: "MEDIUM",
    regex: /\binternal only\b/gi,
    explanation: "Contains the phrase 'internal only', which suggests the content should not leave the organization."
  },
  {
    type: "SALARY_KEYWORD",
    ruleId: "salary-keyword",
    label: "Salary keyword",
    severity: "MEDIUM",
    regex: /\bsalary\b/gi,
    explanation: "Contains salary-related language that may be confidential."
  },
  {
    type: "PASSPORT_REFERENCE",
    ruleId: "passport-reference",
    label: "Passport reference",
    severity: "HIGH",
    regex: /\bpassport\b/gi,
    explanation: "Contains a passport-related reference, which should be treated as high risk."
  }
];

const buildMatchPreview = (match) => match.length > 32 ? `${match.slice(0, 29)}...` : match;

export const scanText = (rawText) => {
  const detectedSignals = [];

  for (const rule of RULE_DEFINITIONS) {
    const matches = rawText.matchAll(rule.regex);

    for (const match of matches) {
      detectedSignals.push({
        type: rule.type,
        ruleId: rule.ruleId,
        label: rule.label,
        severity: rule.severity,
        matchPreview: buildMatchPreview(match[0]),
        explanation: rule.explanation
      });
    }
  }

  return detectedSignals;
};
