import type { ConditionType } from "@root/types";

export interface IntrospectionStepChange {
  key: string;
  value: unknown;
}

export interface IntrospectionStep {
  parentType?: ConditionType;
  currType: ConditionType;
  depth: number;
  option: Record<string, unknown>;
  changes?: Array<IntrospectionStepChange>;
}
