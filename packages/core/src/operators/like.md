# Like Operator
It provides a safe and expressive way to parse and evaluate SQL WHERE LIKE filter expressions with wildcards (%, _), startsWith, and endsWith capabilities. It prioritizes security by escaping special characters to prevent SQL injection vulnerabilities.

### Function Parameters

- `text` (string): The text string to search for.
- `pattern` (string): The filter expression pattern to match against.

### Return Value

- `boolean`: Returns true if the text matches the pattern, false otherwise.

### Supported Wildcards and Features

- `%`: Matches any sequence of characters (zero or more times).
- `_`: Matches any single character.
- `*`:
  - Placed at the beginning of the pattern: Matches strings that start with the characters following *. (startsWith)
  - Placed at the end of the pattern: Matches strings that end with the characters preceding *. (endsWith)
  - Any other placement of * is considered invalid and will return false.
  
### Example Usage

- `Basic` Matching:
```typeScript
const text1 = "This is an example string";
const pattern1 = "Th%s is an exa%le str%g"; // Matches
console.log(safeSqlLikeEnhanced(text1, pattern1)); // Output: true
```
- `Not` Matching:
```typeScript
const text2 = "This is a different string";
const pattern2 = "%manager%"; // Doesn't match
console.log(safeSqlLikeEnhanced(text2, pattern2)); // Output: false
```
- `StartsWith` Matching:
```typeScript
const text3 = "Starting string";
const pattern3 = "*ing string"; // Starts with "ing"
console.log(safeSqlLikeEnhanced(text3, pattern3)); // Output: true
```
- `EndsWith` Matching:
```typeScript
const text4 = "Ending string";
const pattern4 = "Ending*"; // Ends with "ing"
console.log(safeSqlLikeEnhanced(text4, pattern4)); // Output: true
```
- `Invalid` Wildcard Placement:
```typeScript
const text5 = "Invalid*placement";
const pattern5 = "In*val*id"; // Invalid placement of "*"
console.log(safeSqlLikeEnhanced(text5, pattern5)); // Output: false
```

### Constraints
- The function should handle special characters and escape sequences correctly.
- The function should return false for invalid wildcard placements.
- The function should return true for valid wildcard placements and matching patterns.
- The function should return false for valid wildcard placements and non-matching patterns.

### Use Cases
1. Matching strings with specific lengths:
   - Example: `pattern = "abc_de_%"`
   - Explanation: This pattern matches strings that start with "abc", followed by an underscore, then any single character, another underscore, and finally any sequence of characters (zero or more times). This would match strings like "abc_x_defg", "abc_y_123", etc., but not "abc_def" (too short) or "abc_defg" (no trailing characters allowed).
   - Example:
     - `text = "abc_x_defg"` => `pattern = "abc_de_%"` => `true`
     - `text = "abc_y_123"` => `pattern = "abc_de_%"` => `true`
     - `text = "abc_def"` => `pattern = "abc_de_%"` => `false`
     - `text = "abc_defg"` => `pattern = "abc_de_%"` => `false`
     - `text = "abc_x_defg"` => `pattern = "abc_de_%g"` => `true`
     - `text = "abc_y_123"` => `pattern = "abc_de_%g"` => `false`
2. Matching a range of characters within a set:
   - Example: `pattern = "[a-c]_%"`
   - Explanation: This pattern matches strings that start with a character between 'a' and 'c' (inclusive), followed by an underscore, and then any sequence of characters (zero or more times). This would match strings like "a_def", "b_ghi", "c_jkl", but not "d_mno" (character outside the range).
   - Example:
     - `text = "a_def"` => `pattern = "[a-c]_%"` => `true`
     - `text = "b_ghi"` => `pattern = "[a-c]_%"` => `true`
     - `text = "c_jkl"` => `pattern = "[a-c]_%"` => `true`
     - `text = "d_mno"` => `pattern = "[a-c]_%"` => `false`
3. Negation within a character set:
   - Example: `pattern = "[^aeiou]_%"`
   - Explanation: This pattern matches strings that start with a character that is not a vowel (a, e, i, o, u), followed by an underscore, and then any sequence of characters (zero or more times). This would match strings like "x_def", "z_ghi", but not "a_jkl" (vowel) or "e_mno" (vowel).
   - Example:
     - `text = "x_def"` => `pattern = "[^aeiou]_%"` => `true`
     - `text = "z_ghi"` => `pattern = "[^aeiou]_%"` => `true`
     - `text = "a_jkl"` => `pattern = "[^aeiou]_%"` => `false`
     - `text = "e_mno"` => `pattern = "[^aeiou]_%"` => `false`
4. Combining features with wildcards and escapes:
   - Example: `pattern = "Th\%is is an exa\%ple str%ng"`
   - Explanation: This pattern matches strings that are an exact match for "This is an example string", but with escaped percentage signs (`\%`) to treat them literally. This is useful when you want to search for literal percentages in the text.
   - Note: The backslash (`\`) is used to escape special characters, treating them as literals.
   - Example:
     - `text = "This is an example string"` => `pattern = "Th\%is is an exa\%ple str%ng"` => `true`
     - `text = "This is an example string"` => `pattern = "Th\%is is an exa%ple str%ng"` => `false`
     - `text = "This is an example string"` => `pattern = "Th\%is is an exa\%ple str%ng"` => `false`
5. Matching filenames with specific extensions:
   - Example: `pattern = "%.txt"` (assuming extensions are separated by a dot)
   - Explanation: This pattern matches strings that end with ".txt" (case-sensitive). This would match filenames like "myfile.txt", "document.txt", but not "image.jpg" (different extension).
   - Note: The percent sign (`%`) matches any sequence of characters (zero or more times), allowing for flexible matching of filenames with different prefixes.
   - Example:
     - `text = "myfile.txt"` => `pattern = "%.txt"` => `true`
     - `text = "document.txt"` => `pattern = "%.txt"` => `true`
     - `text = "image.jpg"` => `pattern = "%.txt"` => `false`
     - `text = "myfile.txt"` => `pattern = "myfile.%"` => `false`
     - `text = "myfile.txt"` => `pattern = "myfile.txt%"` => `false`
     - `text = "myfile.txt"` => `pattern = "myfile.txt"` => `true`

### Important Notes
- This function prioritizes security by escaping special characters (\, %, ., _) in the pattern to prevent SQL injection vulnerabilities.
- While it offers a safe approach, consider using prepared statements or parameterized queries in production environments for maximum security.
- The underscore (`_`) wildcard matches any single character.
- The percent sign (`%`) matches any sequence of characters (zero or more times).
- The square brackets (`[]`) denote a character set, allowing you to specify a range of characters or individual characters to match.
- The hyphen (`-`) inside a character set denotes a range of characters.
- The caret (`^`) symbol at the beginning of a character set negates the set, matching any character not in the set.
- The backslash (`\`) is used to escape special characters, treating them as literals.
- The asterisk (`*`) is used to denote startsWith and endsWith capabilities in the pattern.
- This function is designed to be used in a safe and controlled environment to evaluate SQL LIKE filter expressions.
- The function is case-sensitive by default, but you can modify it to be case-insensitive if needed.
- The function is designed to work with standard SQL LIKE patterns and may require modifications for specific database implementations.
- The function is intended for use in backend applications where SQL queries are constructed dynamically based on user input or other criteria.
- The function is written in TypeScript, but it can be easily adapted to other programming languages like JavaScript.

### Additional Considerations 
- This implementation can be extended to support more complex patterns and escape characters if needed.
- Error handling could be further improved to provide more informative messages for invalid patterns.
