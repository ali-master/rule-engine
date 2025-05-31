// Enums
import { ConditionTypes, Operators } from "@root/enums";

export type ConditionType = ConditionTypes.OR | ConditionTypes.AND | ConditionTypes.NONE;
export type OperatorsType =
  | Operators.Equals
  | Operators.NotEquals
  | Operators.GreaterThan
  | Operators.LessThan
  | Operators.GreaterThanOrEquals
  | Operators.LessThanOrEquals
  | Operators.Like
  | Operators.NotLike
  | Operators.In
  | Operators.NotIn
  | Operators.Contains
  | Operators.NotContains
  | Operators.ContainsAny
  | Operators.SelfContainsAny
  | Operators.NotContainsAny
  | Operators.SelfContainsNone
  | Operators.SelfNotContainsAny
  | Operators.ContainsAll
  | Operators.SelfContainsAll
  | Operators.NotContainsAll
  | Operators.SelfNotContainsAll
  | Operators.Matches
  | Operators.NotMatches
  | Operators.Exists
  | Operators.NotExists
  | Operators.NullOrUndefined
  | Operators.NotNullOrUndefined
  | Operators.Empty
  | Operators.NotEmpty
  | Operators.DateAfter
  | Operators.DateAfterNow
  | Operators.DateBefore
  | Operators.DateBeforeNow
  | Operators.DateAfterOrEquals
  | Operators.DateAfterNowOrEquals
  | Operators.DateBeforeOrEquals
  | Operators.DateBeforeNowOrEquals
  | Operators.DateEquals
  | Operators.DateEqualsToNow
  | Operators.DateNotEquals
  | Operators.DateNotEqualsToNow
  | Operators.DateBetween
  | Operators.DateNotBetween
  | Operators.TimeAfter
  | Operators.TimeBefore
  | Operators.TimeAfterOrEquals
  | Operators.TimeBeforeOrEquals
  | Operators.TimeEquals
  | Operators.TimeNotEquals
  | Operators.TimeBetween
  | Operators.TimeNotBetween
  | Operators.NullOrWhiteSpace
  | Operators.NotNullOrWhiteSpace
  | Operators.Numeric
  | Operators.NotNumeric
  | Operators.Boolean
  | Operators.NotBoolean
  | Operators.Date
  | Operators.NotDate
  | Operators.Email
  | Operators.NotEmail
  | Operators.Url
  | Operators.NotUrl
  | Operators.UUID
  | Operators.NotUUID
  | Operators.Alpha
  | Operators.NotAlpha
  | Operators.AlphaNumeric
  | Operators.NotAlphaNumeric
  | Operators.PersianAlpha
  | Operators.NotPersianAlpha
  | Operators.PersianAlphaNumeric
  | Operators.NotPersianAlphaNumeric
  | Operators.LowerCase
  | Operators.NotLowerCase
  | Operators.UpperCase
  | Operators.NotUpperCase
  | Operators.String
  | Operators.NotString
  | Operators.Object
  | Operators.NotObject
  | Operators.Array
  | Operators.NotArray
  | Operators.BooleanString
  | Operators.NotBooleanString
  | Operators.BooleanNumber
  | Operators.NotBooleanNumber
  | Operators.BooleanNumberString
  | Operators.NotBooleanNumberString
  | Operators.Number
  | Operators.NotNumber
  | Operators.Integer
  | Operators.NotInteger
  | Operators.Float
  | Operators.NotFloat
  | Operators.Positive
  | Operators.NotPositive
  | Operators.Negative
  | Operators.NotNegative
  | Operators.Zero
  | Operators.NotZero
  | Operators.Min
  | Operators.NotMin
  | Operators.Max
  | Operators.NotMax
  | Operators.Between
  | Operators.NotBetween
  | Operators.NumberBetween
  | Operators.NotNumberBetween
  | Operators.StringLength
  | Operators.NotStringLength
  | Operators.MinLength
  | Operators.NotMinLength
  | Operators.MaxLength
  | Operators.NotMaxLength
  | Operators.LengthBetween
  | Operators.NotLengthBetween
  | Operators.Falsy
  | Operators.NotFalsy
  | Operators.Truthy
  | Operators.NotTruthy;

export interface Constraint {
  /**
   * The field to evaluate.
   * @example "name"
   * @example "age"
   * @example "$.meta.default.password"
   * @example "$.foo[0].bar"
   */
  field: string;
  /**
   * The operator to use for the evaluation.
   * @example Operators.Equals
   */
  operator: OperatorsType;
  /**
   * The value to compare against the field.
   * @example "test"
   * @example 5
   * @example true
   * @example { name: "test" }
   * @example ["test", 5, true, { name: "test" }]
   * @example ["$.username", "$.name", "$.family"]
   */
  value?:
    | string
    | number
    | boolean
    | Record<string, unknown>
    | Array<string | number | boolean | Record<string, unknown>>;
  /**
   * The message to display if the constraint is invalid. This is optional and only used if the constraint is invalid.
   * @default "The constraint is invalid."
   * @example "The field must be a string."
   * @example "The field must be a number."
   * @example "The field must be a boolean."
   * @example "The field must be an object."
   */
  message?: string;
}

/**
 * The result of the evaluation.
 * This is the value of the field that was evaluated.
 * * If the field is valid, then the `isPassed` property is `true`.
 * * If the field is invalid, then the `isPassed` property is `false`.
 * * The `message` property is optional and only used if the field is invalid.
 
 * @example { value: "The field is valid." }
 * @example { value: "The field is invalid.", isPassed: false }
 * @example { value: "The field is invalid.", isPassed: false, message: "The field must be a string." }
 */
export interface EvaluationResult<T = any> {
  // The value of the field that was evaluated. This is the result of the evaluation.
  value: T;
  // If the field is valid, then the `isPassed` property is `true`. If the field is invalid, then the `isPassed` property is `false`.
  // The engine fills this field. Do not set it manually.
  isPassed: boolean;
  // The message to display if the field is invalid. This is optional and only used if the field is invalid.
  message?: string;
}
export type EngineResult<T = any> = Omit<EvaluationResult<T>, "isPassed">;
export type CriteriaObject<T = any> = Record<string, T>;
export type Criteria<T = any> = CriteriaObject<T> | Array<T>;

export interface Condition<R = any> {
  /**
   * The constraints to evaluate. This is optional.
   * * If one of the constraints is met, then the result is valid.
   * @example { or: [{ field: "name", operator: Operators.Equals, value: "test" }] } // The result is valid if the name field equals "test".
   */
  or?: Array<Constraint | Condition<R>>;
  /**
   * The constraints to evaluate. This is optional.
   * * If all the constraints are met, then the result is valid.
   * @example { and: [{ field: "name", operator: Operators.Equals, value: "test" }] } // The result is valid if the name field equals "test".
   */
  and?: Array<Constraint | Condition<R>>;
  /**
   * The constraints to evaluate. This is optional.
   * * If none of the constraints are met, then the result is valid.
   * @example { none: [{ field: "name", operator: Operators.Equals, value: "test" }] } // The result is valid if the name field does not equal "test".
   */
  none?: Array<Constraint | Condition<R>>;
  /**
   * The result of the evaluation.
   * * This is the value of the field that was evaluated.
   * * This is optional.
   */
  result?: EngineResult<R>;
}

export interface RuleType<R = any> {
  conditions: Condition<R> | Array<Condition<R>>;
  // The default result if no conditions are met. This is optional.
  default?: EngineResult<R>;
}

export interface CriteriaRange<R = any> {
  result: EngineResult<R>;
  options?: Array<Record<string, unknown>>;
}

export interface IntrospectionResult<R = any> {
  results: Array<CriteriaRange<R>>;
  default?: EngineResult<R>;
}
