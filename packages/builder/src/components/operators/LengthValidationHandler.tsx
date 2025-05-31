import React from 'react';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Badge } from '../ui/badge';
import { Slider } from '../ui/slider';
import { Ruler, MoveHorizontal, Minimize2, Maximize2, Info } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '../ui/tooltip';
import { Alert, AlertDescription, AlertTitle } from '../ui/alert';
import { Card, CardContent } from '../ui/card';
import type { OperatorHandlerProps } from './index';

export const LengthValidationHandler: React.FC<OperatorHandlerProps> = ({
  operator,
  value,
  onChange,
  field,
  fieldType,
  disabled,
}) => {
  const isBetweenOperator = ['length-between', 'not-length-between'].includes(operator);
  
  const getValidationInfo = () => {
    const info = {
      'string-length': {
        title: 'Has Length Property',
        description: 'Validates that the value is a string or array with a length property',
        icon: Ruler,
        color: 'text-gray-600 dark:text-gray-400',
        examples: ['"hello" ✓ (length: 5)', '[] ✓ (length: 0)', '123 ✗', 'null ✗'],
        needsInput: false,
        target: 'string or array',
      },
      'min-length': {
        title: 'Minimum Length',
        description: 'Length must be greater than or equal to the specified value',
        icon: Maximize2,
        color: 'text-green-600 dark:text-green-400',
        examples: ['Min: 5 → "hello" ✓', 'Min: 5 → "hi" ✗', 'Min: 2 → [1,2,3] ✓'],
        needsInput: true,
        target: 'string or array',
      },
      'max-length': {
        title: 'Maximum Length',
        description: 'Length must be less than or equal to the specified value',
        icon: Minimize2,
        color: 'text-red-600 dark:text-red-400',
        examples: ['Max: 10 → "hello" ✓', 'Max: 3 → "hello" ✗', 'Max: 5 → [1,2,3] ✓'],
        needsInput: true,
        target: 'string or array',
      },
      'length-between': {
        title: 'Length Between Range',
        description: 'Length must be within the specified range (inclusive)',
        icon: MoveHorizontal,
        color: 'text-blue-600 dark:text-blue-400',
        examples: ['Range: 3-10 → "hello" ✓', 'Range: 3-10 → "hi" ✗', 'Range: 2-5 → [1,2,3] ✓'],
        needsInput: true,
        target: 'string or array',
      },
      'not-length-between': {
        title: 'Length Outside Range',
        description: 'Length must NOT be within the specified range',
        icon: MoveHorizontal,
        color: 'text-purple-600 dark:text-purple-400',
        examples: ['Range: 3-10 → "hi" ✓', 'Range: 3-10 → "hello" ✗', 'Range: 2-5 → [1] ✓'],
        needsInput: true,
        target: 'string or array',
      },
    };
    return info[operator as keyof typeof info] || {
      title: operator,
      description: 'Custom length validation',
      icon: Info,
      color: 'text-gray-600',
      examples: [],
      needsInput: false,
      target: 'value',
    };
  };

  const validationInfo = getValidationInfo();
  const Icon = validationInfo.icon;

  // For validators that don't need input, ensure value is undefined
  React.useEffect(() => {
    if (!validationInfo.needsInput && value !== undefined) {
      onChange(undefined);
    }
  }, [value, onChange, validationInfo.needsInput]);

  // Determine if we're working with strings or arrays based on field type
  const targetType = fieldType === 'array' ? 'array' : 'string';
  const unitLabel = targetType === 'array' ? 'items' : 'characters';

  // Handle between operators
  if (isBetweenOperator) {
    const rangeValue = Array.isArray(value) && value.length === 2 ? value : [0, 50];
    
    return (
      <div className="space-y-4">
        <div>
          <div className="flex items-center gap-2 mb-3">
            <Label>Length Range</Label>
            <Badge variant="outline" className="text-xs">{unitLabel}</Badge>
          </div>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-start gap-3">
                <Icon className={`h-5 w-5 mt-0.5 ${validationInfo.color}`} />
                <div className="flex-1 space-y-2">
                  <h4 className="font-medium">{validationInfo.title}</h4>
                  <p className="text-sm text-muted-foreground">
                    {validationInfo.description}
                  </p>
                  
                  {validationInfo.examples.length > 0 && (
                    <div className="mt-3 space-y-1">
                      <p className="text-xs font-medium text-muted-foreground">Examples:</p>
                      <div className="space-y-1">
                        {validationInfo.examples.map((example, index) => (
                          <code key={index} className="block text-xs bg-muted px-2 py-1 rounded">
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

        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="text-xs text-muted-foreground mb-1">Minimum {unitLabel}</Label>
              <Input
                type="number"
                value={rangeValue[0]}
                onChange={(e) => onChange([parseInt(e.target.value) || 0, rangeValue[1]])}
                min={0}
                disabled={disabled}
                className="font-mono"
              />
            </div>
            <div>
              <Label className="text-xs text-muted-foreground mb-1">Maximum {unitLabel}</Label>
              <Input
                type="number"
                value={rangeValue[1]}
                onChange={(e) => onChange([rangeValue[0], parseInt(e.target.value) || 0])}
                min={0}
                disabled={disabled}
                className="font-mono"
              />
            </div>
          </div>

          <div className="px-3">
            <Slider
              value={rangeValue}
              onValueChange={onChange}
              min={0}
              max={100}
              step={1}
              disabled={disabled}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-muted-foreground mt-1">
              <span>{rangeValue[0]} {unitLabel}</span>
              <span>{rangeValue[1]} {unitLabel}</span>
            </div>
          </div>
        </div>

        <Alert>
          <Icon className="h-4 w-4" />
          <AlertDescription className="text-xs">
            <strong>{field}</strong> length must {operator === 'length-between' ? 'be' : 'NOT be'} between {rangeValue[0]} and {rangeValue[1]} {unitLabel}
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  // Handle min/max length operators
  if (operator === 'min-length' || operator === 'max-length') {
    const currentValue = typeof value === 'number' ? value : 0;
    
    return (
      <div className="space-y-4">
        <div>
          <div className="flex items-center gap-2 mb-3">
            <Label>{operator === 'min-length' ? 'Minimum' : 'Maximum'} Length</Label>
            <Badge variant="outline" className="text-xs">{unitLabel}</Badge>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger>
                  <Info className="h-3 w-3 text-muted-foreground" />
                </TooltipTrigger>
                <TooltipContent>
                  <p>{validationInfo.description}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-start gap-3">
                <Icon className={`h-5 w-5 mt-0.5 ${validationInfo.color}`} />
                <div className="flex-1 space-y-2">
                  <h4 className="font-medium">{validationInfo.title}</h4>
                  <p className="text-sm text-muted-foreground">
                    {validationInfo.description}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-2">
          <Input
            type="number"
            value={currentValue}
            onChange={(e) => onChange(parseInt(e.target.value) || 0)}
            min={0}
            placeholder={`Enter ${operator === 'min-length' ? 'minimum' : 'maximum'} length`}
            disabled={disabled}
            className="font-mono"
          />
          
          <div className="px-3">
            <Slider
              value={[currentValue]}
              onValueChange={([val]) => onChange(val)}
              min={0}
              max={100}
              step={1}
              disabled={disabled}
              className="w-full"
            />
            <div className="text-center text-xs text-muted-foreground mt-1">
              {currentValue} {unitLabel}
            </div>
          </div>
        </div>

        <Alert>
          <Icon className="h-4 w-4" />
          <AlertDescription className="text-xs">
            <strong>{field}</strong> must have {operator === 'min-length' ? 'at least' : 'at most'} {currentValue} {unitLabel}
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  // Handle string-length operator (just checks for length property)
  return (
    <div className="space-y-4">
      <div>
        <div className="flex items-center gap-2 mb-3">
          <Label>Length Validation</Label>
          <Badge variant="outline" className="text-xs">No config needed</Badge>
        </div>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-start gap-3">
              <Icon className={`h-5 w-5 mt-0.5 ${validationInfo.color}`} />
              <div className="flex-1 space-y-2">
                <h4 className="font-medium">{validationInfo.title}</h4>
                <p className="text-sm text-muted-foreground">
                  {validationInfo.description}
                </p>
                
                {validationInfo.examples.length > 0 && (
                  <div className="mt-3 space-y-1">
                    <p className="text-xs font-medium text-muted-foreground">Examples:</p>
                    <div className="flex flex-wrap gap-2">
                      {validationInfo.examples.map((example, index) => (
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
        <Ruler className="h-4 w-4" />
        <AlertTitle className="text-sm">Validating Field</AlertTitle>
        <AlertDescription className="text-xs">
          <strong>{field}</strong> must be a {validationInfo.target} with a length property
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