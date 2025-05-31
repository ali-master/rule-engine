/**
 * Extracts JSONPath expressions from a given text.
 *
 * @param {string} text - The text containing the expressions.
 * @returns {string[]} - An array of extracted expressions.
 * @example
 * extractJsonPathExpressions("The value of $.foo.bar is $['foo']['bar']."); // ["$.foo.bar", "$['foo']['bar']"]
 */
export function extractJsonPathExpressions(text: string): Array<string> {
  // Match complex expressions starting with $ followed by nested structures
  const regex = /\$[^\s,()]+(?:\[[^\[\]]*]|\([^()]*\))*/g;
  const matches: Array<string> = [];
  let match: RegExpExecArray | null;

  while ((match = regex.exec(text)) !== null) {
    let expression = match[0];
    let openParenCount = (expression.match(/\(/g) || []).length;
    let closeParenCount = (expression.match(/\)/g) || []).length;
    let openBracketCount = (expression.match(/\[/g) || []).length;
    let closeBracketCount = (expression.match(/]/g) || []).length;

    // Balance closing parentheses
    while (closeParenCount > openParenCount) {
      expression = expression.slice(0, expression.lastIndexOf(")"));
      closeParenCount--;
    }

    // Balance closing brackets
    while (closeBracketCount > openBracketCount) {
      expression = expression.slice(0, expression.lastIndexOf("]"));
      closeBracketCount--;
    }

    matches.push(expression);
  }

  return matches;
}
