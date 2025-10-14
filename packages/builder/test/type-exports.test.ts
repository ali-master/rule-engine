/**
 * Test file to verify TypeScript type exports work correctly
 * This file should compile without errors when types are properly exported
 */

import type { FieldConfig } from '../src/types';
import type {
  RuleType,
  OperatorsType,
  Constraint,
  ConditionType,
  Condition,
} from '@usex/rule-engine';
import { Operators, ConditionTypes } from '../src/index';

// Test that types are available
const _testFieldConfig: FieldConfig = {
  name: 'test.field',
  label: 'Test Field',
  type: 'string',
  description: 'A test field',
};

const _testRule: RuleType = {
  conditions: [],
};

const _testCondition: Condition = {
  [ConditionTypes.AND]: [],
};

const _testConstraint: Constraint = {
  field: 'test.field',
  operator: Operators.Equals,
  value: 'test',
};

// Verify we can use the exported operators
const _testOperator: OperatorsType = Operators.Equals;
const _testConditionType: ConditionType = ConditionTypes.AND;

console.log('Type imports work correctly!');
