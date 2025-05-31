// Purpose: Enumerates the types of logical operators that can be used to combine multiple criteria.
export enum ConditionTypes {
  OR = "or", // Logical OR operator. If any condition is true, the result is true. Otherwise, the result is false.
  AND = "and", // Logical AND operator. If all conditions are true, the result is true. Otherwise, the result is false.
  NONE = "none", // Logical NOT operator. If no conditions are true, the result is true. Otherwise, the result is false.
}
