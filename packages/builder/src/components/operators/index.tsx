import React from 'react';
import { Operators, type OperatorsType } from '@usex/rule-engine';

// Import all operator handlers
import { ComparisonOperatorHandler } from './ComparisonOperatorHandler';
import { ArrayOperatorHandler } from './ArrayOperatorHandler';
import { ExistenceOperatorHandler } from './ExistenceOperatorHandler';
import { DateOperatorHandler } from './DateOperatorHandler';
import { TypeValidationHandler } from './TypeValidationHandler';
import { StringValidationHandler } from './StringValidationHandler';
import { NumberValidationHandler } from './NumberValidationHandler';
import { LengthValidationHandler } from './LengthValidationHandler';
import { BooleanValidationHandler } from './BooleanValidationHandler';
import { SelfReferenceHandler } from './SelfReferenceHandler';

export interface OperatorHandlerProps {
  operator: OperatorsType;
  value: any;
  onChange: (value: any) => void;
  field?: string;
  fieldType?: string;
  sampleData?: Record<string, any>;
  disabled?: boolean;
}

// Map operators to their specific handlers
const operatorHandlers: Partial<Record<OperatorsType, React.ComponentType<OperatorHandlerProps>>> = {
  // Comparison operators
  [Operators.Equals]: ComparisonOperatorHandler,
  [Operators.NotEquals]: ComparisonOperatorHandler,
  [Operators.Like]: ComparisonOperatorHandler,
  [Operators.NotLike]: ComparisonOperatorHandler,
  [Operators.GreaterThan]: ComparisonOperatorHandler,
  [Operators.LessThan]: ComparisonOperatorHandler,
  [Operators.GreaterThanOrEquals]: ComparisonOperatorHandler,
  [Operators.LessThanOrEquals]: ComparisonOperatorHandler,

  // Array operators
  [Operators.In]: ArrayOperatorHandler,
  [Operators.NotIn]: ArrayOperatorHandler,
  [Operators.Contains]: ArrayOperatorHandler,
  [Operators.NotContains]: ArrayOperatorHandler,
  [Operators.ContainsAny]: ArrayOperatorHandler,
  [Operators.ContainsAll]: ArrayOperatorHandler,
  [Operators.NotContainsAny]: ArrayOperatorHandler,
  [Operators.NotContainsAll]: ArrayOperatorHandler,

  // Self-referencing operators
  [Operators.SelfContainsAny]: SelfReferenceHandler,
  [Operators.SelfContainsAll]: SelfReferenceHandler,
  [Operators.SelfContainsNone]: SelfReferenceHandler,
  [Operators.SelfNotContainsAny]: SelfReferenceHandler,
  [Operators.SelfNotContainsAll]: SelfReferenceHandler,

  // Existence operators
  [Operators.Exists]: ExistenceOperatorHandler,
  [Operators.NotExists]: ExistenceOperatorHandler,
  [Operators.NullOrUndefined]: ExistenceOperatorHandler,
  [Operators.NotNullOrUndefined]: ExistenceOperatorHandler,
  [Operators.Empty]: ExistenceOperatorHandler,
  [Operators.NotEmpty]: ExistenceOperatorHandler,
  [Operators.NullOrWhiteSpace]: ExistenceOperatorHandler,
  [Operators.NotNullOrWhiteSpace]: ExistenceOperatorHandler,

  // Date operators
  [Operators.DateAfter]: DateOperatorHandler,
  [Operators.DateBefore]: DateOperatorHandler,
  [Operators.DateEquals]: DateOperatorHandler,
  [Operators.DateBetween]: DateOperatorHandler,
  [Operators.DateNotBetween]: DateOperatorHandler,
  [Operators.DateAfterNow]: DateOperatorHandler,
  [Operators.DateBeforeNow]: DateOperatorHandler,
  [Operators.DateAfterOrEquals]: DateOperatorHandler,
  [Operators.DateBeforeOrEquals]: DateOperatorHandler,

  // Type validation
  [Operators.String]: TypeValidationHandler,
  [Operators.Number]: TypeValidationHandler,
  [Operators.Boolean]: TypeValidationHandler,
  [Operators.Array]: TypeValidationHandler,
  [Operators.Object]: TypeValidationHandler,
  [Operators.Email]: TypeValidationHandler,
  [Operators.Url]: TypeValidationHandler,
  [Operators.UUID]: TypeValidationHandler,
  [Operators.Date]: TypeValidationHandler,

  // String validation
  [Operators.Alpha]: StringValidationHandler,
  [Operators.AlphaNumeric]: StringValidationHandler,
  [Operators.LowerCase]: StringValidationHandler,
  [Operators.UpperCase]: StringValidationHandler,
  [Operators.Matches]: StringValidationHandler,
  [Operators.NotMatches]: StringValidationHandler,

  // Number validation
  [Operators.Positive]: NumberValidationHandler,
  [Operators.Negative]: NumberValidationHandler,
  [Operators.Zero]: NumberValidationHandler,
  [Operators.Min]: NumberValidationHandler,
  [Operators.Max]: NumberValidationHandler,
  [Operators.Between]: NumberValidationHandler,
  [Operators.NotBetween]: NumberValidationHandler,

  // Length validation
  [Operators.StringLength]: LengthValidationHandler,
  [Operators.MinLength]: LengthValidationHandler,
  [Operators.MaxLength]: LengthValidationHandler,
  [Operators.LengthBetween]: LengthValidationHandler,
  [Operators.NotLengthBetween]: LengthValidationHandler,

  // Boolean validation
  [Operators.Truthy]: BooleanValidationHandler,
  [Operators.Falsy]: BooleanValidationHandler,
  [Operators.BooleanString]: BooleanValidationHandler,
  [Operators.BooleanNumber]: BooleanValidationHandler,
};

export const OperatorHandler: React.FC<OperatorHandlerProps> = (props) => {
  const Handler = operatorHandlers[props.operator] || ComparisonOperatorHandler;
  return <Handler {...props} />;
};