import React from 'react';
import { Label } from '../ui/label';
import { Badge } from '../ui/badge';
import { Info, CheckCircle2, XCircle, AlertCircle } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '../ui/alert';
import { Card, CardContent } from '../ui/card';
import type { OperatorHandlerProps } from './index';

export const ExistenceOperatorHandler: React.FC<OperatorHandlerProps> = ({
  operator,
  value,
  onChange,
  field,
  disabled,
}) => {
  // Existence operators don't need a value, so we ensure it's always undefined
  React.useEffect(() => {
    if (value !== undefined) {
      onChange(undefined);
    }
  }, [value, onChange]);

  const getOperatorInfo = () => {
    const info = {
      'exists': {
        title: 'Field Exists',
        description: 'Checks if the field is present in the data',
        icon: CheckCircle2,
        color: 'text-green-600 dark:text-green-400',
        examples: ['{ name: "John" } ✓', '{ age: 25 } ✗'],
      },
      'not-exists': {
        title: 'Field Does Not Exist',
        description: 'Checks if the field is NOT present in the data',
        icon: XCircle,
        color: 'text-red-600 dark:text-red-400',
        examples: ['{ name: "John" } ✗', '{ age: 25 } ✓'],
      },
      'null-or-undefined': {
        title: 'Null or Undefined',
        description: 'Checks if the field value is null or undefined',
        icon: AlertCircle,
        color: 'text-yellow-600 dark:text-yellow-400',
        examples: ['null ✓', 'undefined ✓', '"" ✗', '0 ✗', 'false ✗'],
      },
      'not-null-or-undefined': {
        title: 'Not Null or Undefined',
        description: 'Checks if the field value is NOT null or undefined',
        icon: CheckCircle2,
        color: 'text-blue-600 dark:text-blue-400',
        examples: ['null ✗', 'undefined ✗', '"" ✓', '0 ✓', 'false ✓'],
      },
      'empty': {
        title: 'Empty',
        description: 'Checks if the field value is empty (null, undefined, "", [], {})',
        icon: AlertCircle,
        color: 'text-orange-600 dark:text-orange-400',
        examples: ['null ✓', '[] ✓', '{} ✓', '"" ✓', '" " ✗', '[1] ✗'],
      },
      'not-empty': {
        title: 'Not Empty',
        description: 'Checks if the field value is NOT empty',
        icon: CheckCircle2,
        color: 'text-green-600 dark:text-green-400',
        examples: ['null ✗', '[] ✗', '{} ✗', '"" ✗', '" " ✓', '[1] ✓'],
      },
      'null-or-whitespace': {
        title: 'Null or Whitespace',
        description: 'Checks if the field is null, undefined, or contains only whitespace',
        icon: AlertCircle,
        color: 'text-gray-600 dark:text-gray-400',
        examples: ['null ✓', '" " ✓', '"  \\t\\n  " ✓', '"text" ✗'],
      },
      'not-null-or-whitespace': {
        title: 'Not Null or Whitespace',
        description: 'Checks if the field has actual content (not just whitespace)',
        icon: CheckCircle2,
        color: 'text-green-600 dark:text-green-400',
        examples: ['null ✗', '" " ✗', '"  \\t\\n  " ✗', '"text" ✓'],
      },
    };
    return info[operator as keyof typeof info] || {
      title: operator,
      description: 'Custom existence check',
      icon: Info,
      color: 'text-gray-600',
      examples: [],
    };
  };

  const operatorInfo = getOperatorInfo();
  const Icon = operatorInfo.icon;

  return (
    <div className="space-y-4">
      <div>
        <div className="flex items-center gap-2 mb-3">
          <Label>Existence Check</Label>
          <Badge variant="outline" className="text-xs">No value required</Badge>
        </div>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-start gap-3">
              <Icon className={`h-5 w-5 mt-0.5 ${operatorInfo.color}`} />
              <div className="flex-1 space-y-2">
                <h4 className="font-medium">{operatorInfo.title}</h4>
                <p className="text-sm text-muted-foreground">
                  {operatorInfo.description}
                </p>
                
                {operatorInfo.examples.length > 0 && (
                  <div className="mt-3 space-y-1">
                    <p className="text-xs font-medium text-muted-foreground">Examples:</p>
                    <div className="flex flex-wrap gap-2">
                      {operatorInfo.examples.map((example, index) => (
                        <code key={index} className="text-xs bg-muted px-2 py-1 rounded">
                          {example}
                        </code>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Alert>
        <Info className="h-4 w-4" />
        <AlertTitle className="text-sm">Checking Field</AlertTitle>
        <AlertDescription className="text-xs">
          <strong>{field}</strong> will be checked for {operatorInfo.title.toLowerCase()}
        </AlertDescription>
      </Alert>

      <div className="p-3 bg-muted rounded-md">
        <p className="text-xs text-muted-foreground mb-2">Rule Preview:</p>
        <code className="text-xs font-mono">
          {field} {operator}
        </code>
      </div>
    </div>
  );
};