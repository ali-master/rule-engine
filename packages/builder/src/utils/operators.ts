import { Operators, type OperatorsType } from "@usex/rule-engine";
import type { OperatorConfig } from "../types";

export const operatorCategories = {
  comparison: "Comparison",
  array: "Array/Collection",
  existence: "Existence",
  date: "Date/Time",
  type: "Type Validation",
  string: "String Validation",
  number: "Number Validation",
  length: "Length Validation",
  boolean: "Boolean Validation",
} as const;

export const operatorConfigs: OperatorConfig[] = [
  // Comparison Operators
  {
    name: Operators.Equals,
    label: "Equals",
    category: operatorCategories.comparison,
    valueType: "single",
  },
  {
    name: Operators.NotEquals,
    label: "Not Equals",
    category: operatorCategories.comparison,
    valueType: "single",
  },
  {
    name: Operators.Like,
    label: "Like",
    category: operatorCategories.comparison,
    valueType: "single",
    applicableTypes: ["string"],
  },
  {
    name: Operators.NotLike,
    label: "Not Like",
    category: operatorCategories.comparison,
    valueType: "single",
    applicableTypes: ["string"],
  },
  {
    name: Operators.GreaterThan,
    label: "Greater Than",
    category: operatorCategories.comparison,
    valueType: "single",
    applicableTypes: ["number", "date"],
  },
  {
    name: Operators.LessThan,
    label: "Less Than",
    category: operatorCategories.comparison,
    valueType: "single",
    applicableTypes: ["number", "date"],
  },
  {
    name: Operators.GreaterThanOrEquals,
    label: "Greater Than or Equals",
    category: operatorCategories.comparison,
    valueType: "single",
    applicableTypes: ["number", "date"],
  },
  {
    name: Operators.LessThanOrEquals,
    label: "Less Than or Equals",
    category: operatorCategories.comparison,
    valueType: "single",
    applicableTypes: ["number", "date"],
  },

  // Array/Collection Operators
  {
    name: Operators.In,
    label: "In",
    category: operatorCategories.array,
    valueType: "multiple",
  },
  {
    name: Operators.NotIn,
    label: "Not In",
    category: operatorCategories.array,
    valueType: "multiple",
  },
  {
    name: Operators.Contains,
    label: "Contains",
    category: operatorCategories.array,
    valueType: "single",
  },
  {
    name: Operators.NotContains,
    label: "Not Contains",
    category: operatorCategories.array,
    valueType: "single",
  },
  {
    name: Operators.ContainsAny,
    label: "Contains Any",
    category: operatorCategories.array,
    valueType: "multiple",
  },
  {
    name: Operators.ContainsAll,
    label: "Contains All",
    category: operatorCategories.array,
    valueType: "multiple",
  },

  // Existence/Nullability
  {
    name: Operators.Exists,
    label: "Exists",
    category: operatorCategories.existence,
    valueType: "none",
  },
  {
    name: Operators.NotExists,
    label: "Not Exists",
    category: operatorCategories.existence,
    valueType: "none",
  },
  {
    name: Operators.NullOrUndefined,
    label: "Null or Undefined",
    category: operatorCategories.existence,
    valueType: "none",
  },
  {
    name: Operators.NotNullOrUndefined,
    label: "Not Null or Undefined",
    category: operatorCategories.existence,
    valueType: "none",
  },
  {
    name: Operators.Empty,
    label: "Empty",
    category: operatorCategories.existence,
    valueType: "none",
  },
  {
    name: Operators.NotEmpty,
    label: "Not Empty",
    category: operatorCategories.existence,
    valueType: "none",
  },

  // Date/Time Operators
  {
    name: Operators.DateAfter,
    label: "Date After",
    category: operatorCategories.date,
    valueType: "single",
    applicableTypes: ["date"],
  },
  {
    name: Operators.DateBefore,
    label: "Date Before",
    category: operatorCategories.date,
    valueType: "single",
    applicableTypes: ["date"],
  },
  {
    name: Operators.DateEquals,
    label: "Date Equals",
    category: operatorCategories.date,
    valueType: "single",
    applicableTypes: ["date"],
  },
  {
    name: Operators.DateBetween,
    label: "Date Between",
    category: operatorCategories.date,
    valueType: "range",
    applicableTypes: ["date"],
  },
  {
    name: Operators.DateAfterNow,
    label: "Date After Now",
    category: operatorCategories.date,
    valueType: "none",
    applicableTypes: ["date"],
  },
  {
    name: Operators.DateBeforeNow,
    label: "Date Before Now",
    category: operatorCategories.date,
    valueType: "none",
    applicableTypes: ["date"],
  },

  // Type Validation
  {
    name: Operators.String,
    label: "Is String",
    category: operatorCategories.type,
    valueType: "none",
  },
  {
    name: Operators.Number,
    label: "Is Number",
    category: operatorCategories.type,
    valueType: "none",
  },
  {
    name: Operators.Boolean,
    label: "Is Boolean",
    category: operatorCategories.type,
    valueType: "none",
  },
  {
    name: Operators.Array,
    label: "Is Array",
    category: operatorCategories.type,
    valueType: "none",
  },
  {
    name: Operators.Object,
    label: "Is Object",
    category: operatorCategories.type,
    valueType: "none",
  },
  {
    name: Operators.Email,
    label: "Is Email",
    category: operatorCategories.type,
    valueType: "none",
    applicableTypes: ["string"],
  },
  {
    name: Operators.Url,
    label: "Is URL",
    category: operatorCategories.type,
    valueType: "none",
    applicableTypes: ["string"],
  },
  {
    name: Operators.UUID,
    label: "Is UUID",
    category: operatorCategories.type,
    valueType: "none",
    applicableTypes: ["string"],
  },

  // String Validation
  {
    name: Operators.Alpha,
    label: "Alpha",
    category: operatorCategories.string,
    valueType: "none",
    applicableTypes: ["string"],
  },
  {
    name: Operators.AlphaNumeric,
    label: "Alpha Numeric",
    category: operatorCategories.string,
    valueType: "none",
    applicableTypes: ["string"],
  },
  {
    name: Operators.LowerCase,
    label: "Lower Case",
    category: operatorCategories.string,
    valueType: "none",
    applicableTypes: ["string"],
  },
  {
    name: Operators.UpperCase,
    label: "Upper Case",
    category: operatorCategories.string,
    valueType: "none",
    applicableTypes: ["string"],
  },
  {
    name: Operators.Matches,
    label: "Matches (Regex)",
    category: operatorCategories.string,
    valueType: "single",
    applicableTypes: ["string"],
  },
  {
    name: Operators.NotMatches,
    label: "Not Matches (Regex)",
    category: operatorCategories.string,
    valueType: "single",
    applicableTypes: ["string"],
  },

  // Number Validation
  {
    name: Operators.Positive,
    label: "Positive",
    category: operatorCategories.number,
    valueType: "none",
    applicableTypes: ["number"],
  },
  {
    name: Operators.Negative,
    label: "Negative",
    category: operatorCategories.number,
    valueType: "none",
    applicableTypes: ["number"],
  },
  {
    name: Operators.Zero,
    label: "Zero",
    category: operatorCategories.number,
    valueType: "none",
    applicableTypes: ["number"],
  },
  {
    name: Operators.Min,
    label: "Minimum",
    category: operatorCategories.number,
    valueType: "single",
    applicableTypes: ["number"],
  },
  {
    name: Operators.Max,
    label: "Maximum",
    category: operatorCategories.number,
    valueType: "single",
    applicableTypes: ["number"],
  },
  {
    name: Operators.Between,
    label: "Between",
    category: operatorCategories.number,
    valueType: "range",
    applicableTypes: ["number"],
  },

  // Length Validation
  {
    name: Operators.StringLength,
    label: "String Length",
    category: operatorCategories.length,
    valueType: "single",
    applicableTypes: ["string"],
  },
  {
    name: Operators.MinLength,
    label: "Min Length",
    category: operatorCategories.length,
    valueType: "single",
    applicableTypes: ["string", "array"],
  },
  {
    name: Operators.MaxLength,
    label: "Max Length",
    category: operatorCategories.length,
    valueType: "single",
    applicableTypes: ["string", "array"],
  },
  {
    name: Operators.LengthBetween,
    label: "Length Between",
    category: operatorCategories.length,
    valueType: "range",
    applicableTypes: ["string", "array"],
  },

  // Boolean Validation
  {
    name: Operators.Truthy,
    label: "Truthy",
    category: operatorCategories.boolean,
    valueType: "none",
  },
  {
    name: Operators.Falsy,
    label: "Falsy",
    category: operatorCategories.boolean,
    valueType: "none",
  },
];

export const getOperatorConfig = (
  operator: OperatorsType,
): OperatorConfig | undefined => {
  return operatorConfigs.find((config) => config.name === operator);
};

export const getOperatorsByCategory = (category: string): OperatorConfig[] => {
  return operatorConfigs.filter((config) => config.category === category);
};

export const getOperatorsForFieldType = (
  fieldType?: string,
): OperatorConfig[] => {
  if (!fieldType) return operatorConfigs;

  return operatorConfigs.filter((config) => {
    if (!config.applicableTypes || config.applicableTypes.length === 0) {
      return true;
    }
    return config.applicableTypes.includes(fieldType as any);
  });
};
