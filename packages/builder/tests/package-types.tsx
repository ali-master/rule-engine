import { TreeRuleBuilder, RuleBuilder } from "@usex/rule-engine-builder";
import type { FieldConfig } from "@usex/rule-engine-builder";

const fields: FieldConfig[] = [{ name: "name", label: "Name", type: "string" }];
<RuleBuilder fields={fields} readOnly />;
<TreeRuleBuilder fields={fields} />;
// @ts-expect-error Public component props must not degrade to any.
<RuleBuilder readOnly="yes" />;
