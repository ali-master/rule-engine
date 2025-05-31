import React from 'react';
import { Label } from '../ui/label';
import { Badge } from '../ui/badge';
import { Switch } from '../ui/switch';
import { ToggleLeft, ToggleRight, Binary, Hash, Info } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '../ui/alert';
import { Card, CardContent } from '../ui/card';
import { Separator } from '../ui/separator';
import type { OperatorHandlerProps } from './index';

export const BooleanValidationHandler: React.FC<OperatorHandlerProps> = ({
  operator,
  value,
  onChange,
  field,
  disabled,
}) => {
  // Boolean validators don't need a value
  React.useEffect(() => {
    if (value !== undefined) {
      onChange(undefined);
    }
  }, [value, onChange]);

  const getValidationInfo = () => {
    const info = {
      'truthy': {
        title: 'Truthy Value',
        description: 'Value evaluates to true in a boolean context',
        icon: ToggleRight,
        color: 'text-green-600 dark:text-green-400',
        truthyExamples: ['true', '1', '"text"', '[]', '{}', 'new Date()'],
        falsyExamples: ['false', '0', '""', 'null', 'undefined', 'NaN'],
      },
      'falsy': {
        title: 'Falsy Value',
        description: 'Value evaluates to false in a boolean context',
        icon: ToggleLeft,
        color: 'text-red-600 dark:text-red-400',
        truthyExamples: ['false', '0', '""', 'null', 'undefined', 'NaN'],
        falsyExamples: ['true', '1', '"text"', '[]', '{}', 'new Date()'],
      },
      'boolean-string': {
        title: 'Boolean String',
        description: 'String representation of a boolean ("true" or "false")',
        icon: Binary,
        color: 'text-blue-600 dark:text-blue-400',
        truthyExamples: ['"true"', '"TRUE"', '"True"'],
        falsyExamples: ['"false"', '"FALSE"', '"False"', '"yes"', '"1"', 'true (actual boolean)'],
      },
      'boolean-number': {
        title: 'Boolean Number',
        description: 'Numeric representation of a boolean (1 or 0)',
        icon: Hash,
        color: 'text-purple-600 dark:text-purple-400',
        truthyExamples: ['1', '0'],
        falsyExamples: ['2', '-1', '0.5', 'true', '"1"'],
      },
    };
    return info[operator as keyof typeof info] || {
      title: operator,
      description: 'Custom boolean validation',
      icon: Info,
      color: 'text-gray-600',
      truthyExamples: [],
      falsyExamples: [],
    };
  };

  const validationInfo = getValidationInfo();
  const Icon = validationInfo.icon;

  // Interactive demo for truthy/falsy
  const [demoValue, setDemoValue] = React.useState('');
  const getDemoResult = () => {
    if (!demoValue) return null;
    try {
      // eslint-disable-next-line no-eval
      const evaluated = eval(demoValue);
      if (operator === 'truthy') return !!evaluated;
      if (operator === 'falsy') return !evaluated;
      if (operator === 'boolean-string') {
        return typeof evaluated === 'string' && ['true', 'false'].includes(evaluated.toLowerCase());
      }
      if (operator === 'boolean-number') {
        return evaluated === 0 || evaluated === 1;
      }
    } catch {
      return false;
    }
  };

  return (
    <div className="space-y-4">
      <div>
        <div className="flex items-center gap-2 mb-3">
          <Label>Boolean Validation</Label>
          <Badge variant="outline" className="text-xs">No config needed</Badge>
        </div>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-start gap-3">
              <Icon className={`h-5 w-5 mt-0.5 ${validationInfo.color}`} />
              <div className="flex-1 space-y-3">
                <div>
                  <h4 className="font-medium">{validationInfo.title}</h4>
                  <p className="text-sm text-muted-foreground mt-1">
                    {validationInfo.description}
                  </p>
                </div>

                <Separator />

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs font-medium text-green-600 dark:text-green-400 mb-2">
                      ✓ Valid Examples
                    </p>
                    <div className="space-y-1">
                      {validationInfo.truthyExamples.map((example, index) => (
                        <code key={index} className="block text-xs bg-green-50 dark:bg-green-950 text-green-700 dark:text-green-300 px-2 py-1 rounded">
                          {example}
                        </code>
                      ))}
                    </div>
                  </div>
                  <div>
                    <p className="text-xs font-medium text-red-600 dark:text-red-400 mb-2">
                      ✗ Invalid Examples
                    </p>
                    <div className="space-y-1">
                      {validationInfo.falsyExamples.map((example, index) => (
                        <code key={index} className="block text-xs bg-red-50 dark:bg-red-950 text-red-700 dark:text-red-300 px-2 py-1 rounded">
                          {example}
                        </code>
                      ))}
                    </div>
                  </div>
                </div>

                {(operator === 'truthy' || operator === 'falsy') && (
                  <>
                    <Separator />
                    <div>
                      <p className="text-xs font-medium text-muted-foreground mb-2">Interactive Demo</p>
                      <div className="flex items-center gap-2">
                        <input
                          type="text"
                          value={demoValue}
                          onChange={(e) => setDemoValue(e.target.value)}
                          placeholder="Try: true, 1, '', null, []"
                          className="flex-1 text-xs px-2 py-1 rounded border bg-background"
                        />
                        {demoValue && (
                          <Badge variant={getDemoResult() ? "default" : "secondary"}>
                            {getDemoResult() ? "✓ Passes" : "✗ Fails"}
                          </Badge>
                        )}
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Alert>
        <Icon className="h-4 w-4" />
        <AlertTitle className="text-sm">Validating Field</AlertTitle>
        <AlertDescription className="text-xs">
          <strong>{field}</strong> must be a {validationInfo.title.toLowerCase()}
        </AlertDescription>
      </Alert>

      <div className="p-3 bg-muted rounded-md">
        <p className="text-xs text-muted-foreground mb-2">Rule Preview:</p>
        <code className="text-xs font-mono">
          {field} {operator}
        </code>
      </div>

      {/* Visual representation for different operators */}
      {operator === 'truthy' && (
        <div className="flex items-center justify-center p-4 bg-green-50 dark:bg-green-950 rounded-lg">
          <Switch checked={true} disabled className="data-[state=checked]:bg-green-600" />
          <span className="ml-3 text-sm font-medium text-green-700 dark:text-green-300">
            Value must be truthy
          </span>
        </div>
      )}

      {operator === 'falsy' && (
        <div className="flex items-center justify-center p-4 bg-red-50 dark:bg-red-950 rounded-lg">
          <Switch checked={false} disabled />
          <span className="ml-3 text-sm font-medium text-red-700 dark:text-red-300">
            Value must be falsy
          </span>
        </div>
      )}

      {operator === 'boolean-string' && (
        <div className="flex items-center justify-center gap-4 p-4 bg-blue-50 dark:bg-blue-950 rounded-lg">
          <code className="text-sm font-mono text-blue-700 dark:text-blue-300">"true"</code>
          <span className="text-blue-500">or</span>
          <code className="text-sm font-mono text-blue-700 dark:text-blue-300">"false"</code>
        </div>
      )}

      {operator === 'boolean-number' && (
        <div className="flex items-center justify-center gap-4 p-4 bg-purple-50 dark:bg-purple-950 rounded-lg">
          <code className="text-sm font-mono text-purple-700 dark:text-purple-300">1</code>
          <span className="text-purple-500">or</span>
          <code className="text-sm font-mono text-purple-700 dark:text-purple-300">0</code>
        </div>
      )}
    </div>
  );
};