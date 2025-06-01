export interface OperatorHelp {
  name: string;
  description: string;
  examples: Array<{
    field: string;
    operator: string;
    value: string | number | boolean;
    explanation: string;
  }>;
  tips?: string[];
}

export const operatorHelp: Record<string, OperatorHelp> = {
  // String Operators
  equals: {
    name: "Equals",
    description: "Checks if the field value exactly matches the specified value. Case-sensitive.",
    examples: [
      {
        field: "status",
        operator: "equals",
        value: "active",
        explanation: "Matches when status is exactly \"active\"",
      },
      {
        field: "user.email",
        operator: "equals",
        value: "john@example.com",
        explanation: "Matches when user email is exactly \"john@example.com\"",
      },
    ],
    tips: [
      "This is case-sensitive. \"Active\" will not match \"active\"",
      "For case-insensitive matching, use \"equalsIgnoreCase\"",
    ],
  },

  notEquals: {
    name: "Not Equals",
    description: "Checks if the field value does not match the specified value.",
    examples: [
      {
        field: "status",
        operator: "notEquals",
        value: "inactive",
        explanation: "Matches when status is anything except \"inactive\"",
      },
    ],
    tips: ["Returns true for null or undefined values if they don't match the specified value"],
  },

  contains: {
    name: "Contains",
    description: "Checks if the field value contains the specified substring. Case-sensitive.",
    examples: [
      {
        field: "description",
        operator: "contains",
        value: "important",
        explanation: "Matches when description contains \"important\" anywhere",
      },
      {
        field: "tags",
        operator: "contains",
        value: "beta",
        explanation: "For arrays, checks if any element contains the substring",
      },
    ],
    tips: [
      "Works with both strings and arrays",
      "For arrays, checks each element",
    ],
  },

  notContains: {
    name: "Not Contains",
    description: "Checks if the field value does not contain the specified substring.",
    examples: [
      {
        field: "title",
        operator: "notContains",
        value: "draft",
        explanation: "Matches when title doesn't contain \"draft\"",
      },
    ],
  },

  startsWith: {
    name: "Starts With",
    description: "Checks if the field value begins with the specified string.",
    examples: [
      {
        field: "phone",
        operator: "startsWith",
        value: "+1",
        explanation: "Matches phone numbers starting with \"+1\"",
      },
      {
        field: "sku",
        operator: "startsWith",
        value: "PROD-",
        explanation: "Matches SKUs starting with \"PROD-\"",
      },
    ],
  },

  endsWith: {
    name: "Ends With",
    description: "Checks if the field value ends with the specified string.",
    examples: [
      {
        field: "email",
        operator: "endsWith",
        value: "@company.com",
        explanation: "Matches company email addresses",
      },
      {
        field: "filename",
        operator: "endsWith",
        value: ".pdf",
        explanation: "Matches PDF files",
      },
    ],
  },

  matchesRegex: {
    name: "Matches Regex",
    description: "Tests the field value against a regular expression pattern.",
    examples: [
      {
        field: "email",
        operator: "matchesRegex",
        value: "^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$",
        explanation: "Validates email format",
      },
      {
        field: "phone",
        operator: "matchesRegex",
        value: "^\\+?[1-9]\\d{1,14}$",
        explanation: "Validates international phone number",
      },
    ],
    tips: [
      "Use JavaScript regex syntax",
      "Escape special characters with backslash",
      "Test your regex patterns before using",
    ],
  },

  // Number Operators
  greaterThan: {
    name: "Greater Than",
    description: "Checks if the numeric field value is greater than the specified number.",
    examples: [
      {
        field: "age",
        operator: "greaterThan",
        value: 18,
        explanation: "Matches when age is 19 or higher",
      },
      {
        field: "price",
        operator: "greaterThan",
        value: 99.99,
        explanation: "Matches prices above $99.99",
      },
    ],
    tips: ["Works with integers and decimals", "Returns false for non-numeric values"],
  },

  greaterThanOrEquals: {
    name: "Greater Than or Equals",
    description: "Checks if the numeric field value is greater than or equal to the specified number.",
    examples: [
      {
        field: "score",
        operator: "greaterThanOrEquals",
        value: 80,
        explanation: "Matches scores of 80 or higher",
      },
    ],
  },

  lessThan: {
    name: "Less Than",
    description: "Checks if the numeric field value is less than the specified number.",
    examples: [
      {
        field: "inventory",
        operator: "lessThan",
        value: 10,
        explanation: "Matches when inventory is below 10",
      },
    ],
  },

  lessThanOrEquals: {
    name: "Less Than or Equals",
    description: "Checks if the numeric field value is less than or equal to the specified number.",
    examples: [
      {
        field: "discount",
        operator: "lessThanOrEquals",
        value: 50,
        explanation: "Matches discounts up to 50%",
      },
    ],
  },

  between: {
    name: "Between",
    description: "Checks if the numeric field value falls within a range (inclusive).",
    examples: [
      {
        field: "temperature",
        operator: "between",
        value: "20,30",
        explanation: "Matches temperatures from 20 to 30 degrees",
      },
    ],
    tips: ["Provide two comma-separated values", "Both bounds are inclusive"],
  },

  // Boolean Operators
  isTrue: {
    name: "Is True",
    description: "Checks if the boolean field value is true.",
    examples: [
      {
        field: "isActive",
        operator: "isTrue",
        value: true,
        explanation: "Matches when isActive is true",
      },
    ],
    tips: ["No value input needed", "Only matches boolean true, not truthy values"],
  },

  isFalse: {
    name: "Is False",
    description: "Checks if the boolean field value is false.",
    examples: [
      {
        field: "isDeleted",
        operator: "isFalse",
        value: false,
        explanation: "Matches when isDeleted is false",
      },
    ],
  },

  // Date Operators
  before: {
    name: "Before",
    description: "Checks if the date field value is before the specified date.",
    examples: [
      {
        field: "createdAt",
        operator: "before",
        value: "2024-01-01",
        explanation: "Matches records created before January 1, 2024",
      },
    ],
    tips: ["Accepts various date formats", "Time component is considered if provided"],
  },

  after: {
    name: "After",
    description: "Checks if the date field value is after the specified date.",
    examples: [
      {
        field: "expiryDate",
        operator: "after",
        value: "2024-12-31",
        explanation: "Matches items expiring after December 31, 2024",
      },
    ],
  },

  dateEquals: {
    name: "Date Equals",
    description: "Checks if the date field value matches the specified date.",
    examples: [
      {
        field: "birthday",
        operator: "dateEquals",
        value: "1990-05-15",
        explanation: "Matches birthdays on May 15, 1990",
      },
    ],
    tips: ["Compares date portion only by default", "Include time for precise matching"],
  },

  dateBetween: {
    name: "Date Between",
    description: "Checks if the date falls within a date range.",
    examples: [
      {
        field: "orderDate",
        operator: "dateBetween",
        value: "2024-01-01,2024-12-31",
        explanation: "Matches orders placed in 2024",
      },
    ],
    tips: ["Provide two comma-separated dates", "Both bounds are inclusive"],
  },

  // Array Operators
  in: {
    name: "In",
    description: "Checks if the field value is included in a list of values.",
    examples: [
      {
        field: "status",
        operator: "in",
        value: "pending,processing,shipped",
        explanation: "Matches any of these three statuses",
      },
      {
        field: "role",
        operator: "in",
        value: "admin,moderator",
        explanation: "Matches admin or moderator roles",
      },
    ],
    tips: ["Provide comma-separated values", "Useful for multiple allowed values"],
  },

  notIn: {
    name: "Not In",
    description: "Checks if the field value is not included in a list of values.",
    examples: [
      {
        field: "status",
        operator: "notIn",
        value: "deleted,archived",
        explanation: "Matches any status except deleted or archived",
      },
    ],
  },

  arrayContains: {
    name: "Array Contains",
    description: "Checks if an array field contains a specific value.",
    examples: [
      {
        field: "tags",
        operator: "arrayContains",
        value: "featured",
        explanation: "Matches when tags array includes \"featured\"",
      },
    ],
    tips: ["Field must be an array", "Checks for exact value match in array"],
  },

  arrayContainsAny: {
    name: "Array Contains Any",
    description: "Checks if an array field contains any of the specified values.",
    examples: [
      {
        field: "permissions",
        operator: "arrayContainsAny",
        value: "read,write,delete",
        explanation: "Matches if user has any of these permissions",
      },
    ],
  },

  arrayContainsAll: {
    name: "Array Contains All",
    description: "Checks if an array field contains all of the specified values.",
    examples: [
      {
        field: "requiredSkills",
        operator: "arrayContainsAll",
        value: "javascript,react,typescript",
        explanation: "Matches only if all three skills are present",
      },
    ],
  },

  // Null/Existence Operators
  isNull: {
    name: "Is Null",
    description: "Checks if the field value is null.",
    examples: [
      {
        field: "deletedAt",
        operator: "isNull",
        value: "",
        explanation: "Matches records that haven't been deleted",
      },
    ],
    tips: ["No value input needed", "Only matches null, not undefined or empty string"],
  },

  isNotNull: {
    name: "Is Not Null",
    description: "Checks if the field value is not null.",
    examples: [
      {
        field: "email",
        operator: "isNotNull",
        value: "",
        explanation: "Matches records with an email value",
      },
    ],
  },

  isEmpty: {
    name: "Is Empty",
    description: "Checks if the field value is empty (null, undefined, empty string, or empty array).",
    examples: [
      {
        field: "description",
        operator: "isEmpty",
        value: "",
        explanation: "Matches when description is empty or not set",
      },
    ],
    tips: ["Works with strings, arrays, and objects", "Considers \"\", [], {}, null, and undefined as empty"],
  },

  isNotEmpty: {
    name: "Is Not Empty",
    description: "Checks if the field value is not empty.",
    examples: [
      {
        field: "tags",
        operator: "isNotEmpty",
        value: "",
        explanation: "Matches when tags array has at least one item",
      },
    ],
  },
};
