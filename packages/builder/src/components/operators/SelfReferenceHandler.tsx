import React from 'react';
import { DynamicFieldSelector } from '../DynamicFieldSelector';
import { Badge } from '../ui/badge';
import { Label } from '../ui/label';
import { Button } from '../ui/button';
import { Plus, X, ArrowRight, Info } from 'lucide-react';
import { Alert, AlertDescription } from '../ui/alert';
import type { OperatorHandlerProps } from './index';

export const SelfReferenceHandler: React.FC<OperatorHandlerProps> = ({
  operator,
  value,
  onChange,
  field,
  sampleData,
  disabled,
}) => {
  const fields = Array.isArray(value) ? value : value ? [value] : [];

  const addField = (fieldPath: string) => {
    if (!fields.includes(fieldPath)) {
      onChange([...fields, fieldPath]);
    }
  };

  const removeField = (index: number) => {
    onChange(fields.filter((_, i) => i !== index));
  };

  const operatorDescriptions = {
    'self-contains-any': 'Field value contains ANY of the referenced field values',
    'self-contains-all': 'Field value contains ALL of the referenced field values',
    'self-contains-none': 'Field value contains NONE of the referenced field values',
    'self-not-contains-any': 'Field value does NOT contain ANY of the referenced field values',
    'self-not-contains-all': 'Field value does NOT contain ALL of the referenced field values',
  };

  return (
    <div className="space-y-4">
      <div>
        <div className="flex items-center gap-2 mb-2">
          <Label>Referenced Fields</Label>
          <Badge variant="outline" className="text-xs">Self-Reference</Badge>
        </div>
        <Alert className="mb-3">
          <Info className="h-4 w-4" />
          <AlertDescription className="text-xs">
            <strong>{field}</strong> <ArrowRight className="inline h-3 w-3 mx-1" />
            {operatorDescriptions[operator as keyof typeof operatorDescriptions] || operator}
          </AlertDescription>
        </Alert>
      </div>

      <div className="space-y-2">
        {fields.map((fieldPath, index) => (
          <div key={index} className="flex items-center gap-2">
            <div className="flex-1">
              <DynamicFieldSelector
                value={fieldPath}
                onChange={(newValue) => {
                  const newFields = [...fields];
                  newFields[index] = newValue;
                  onChange(newFields);
                }}
                sampleData={sampleData}
                placeholder="Select field to reference"
                disabled={disabled}
              />
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => removeField(index)}
              disabled={disabled}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        ))}

        <Button
          variant="outline"
          size="sm"
          onClick={() => addField('')}
          disabled={disabled}
          className="w-full"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Field Reference
        </Button>
      </div>

      {fields.length > 0 && (
        <div className="p-3 bg-muted rounded-md">
          <p className="text-xs text-muted-foreground mb-2">Example:</p>
          <code className="text-xs font-mono">
            {field} {operator} [{fields.join(', ')}]
          </code>
        </div>
      )}
    </div>
  );
};