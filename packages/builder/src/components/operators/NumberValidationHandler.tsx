import React from 'react';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Badge } from '../ui/badge';
import { Slider } from '../ui/slider';
import { Plus, Minus, CircleDot, TrendingUp, TrendingDown, ArrowUpDown, Info } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '../ui/tooltip';
import { Alert, AlertDescription, AlertTitle } from '../ui/alert';
import { Card, CardContent } from '../ui/card';
import type { OperatorHandlerProps } from './index';

export const NumberValidationHandler: React.FC<OperatorHandlerProps> = ({
  operator,
  value,
  onChange,
  field,
  disabled,
}) => {
  const isBetweenOperator = ['between', 'not-between'].includes(operator);
  
  const getValidationInfo = () => {
    const info = {
      'positive': {
        title: 'Positive Number',
        description: 'Number must be greater than zero',
        icon: Plus,
        color: 'text-green-600 dark:text-green-400',
        examples: ['1 ✓', '0.5 ✓', '0 ✗', '-1 ✗'],
        needsInput: false,
      },
      'negative': {
        title: 'Negative Number',
        description: 'Number must be less than zero',
        icon: Minus,
        color: 'text-red-600 dark:text-red-400',
        examples: ['-1 ✓', '-0.5 ✓', '0 ✗', '1 ✗'],
        needsInput: false,
      },
      'zero': {
        title: 'Zero',
        description: 'Number must be exactly zero',
        icon: CircleDot,
        color: 'text-gray-600 dark:text-gray-400',
        examples: ['0 ✓', '0.0 ✓', '0.1 ✗', '-0.1 ✗'],
        needsInput: false,
      },
      'min': {
        title: 'Minimum Value',
        description: 'Number must be greater than or equal to the specified value',
        icon: TrendingUp,
        color: 'text-blue-600 dark:text-blue-400',
        examples: ['Min: 10 → 15 ✓', 'Min: 10 → 10 ✓', 'Min: 10 → 5 ✗'],
        needsInput: true,
      },
      'max': {
        title: 'Maximum Value',
        description: 'Number must be less than or equal to the specified value',
        icon: TrendingDown,
        color: 'text-purple-600 dark:text-purple-400',
        examples: ['Max: 100 → 50 ✓', 'Max: 100 → 100 ✓', 'Max: 100 → 150 ✗'],
        needsInput: true,
      },
      'between': {
        title: 'Between Range',
        description: 'Number must be within the specified range (inclusive)',
        icon: ArrowUpDown,
        color: 'text-orange-600 dark:text-orange-400',
        examples: ['Range: 10-20 → 15 ✓', 'Range: 10-20 → 10 ✓', 'Range: 10-20 → 25 ✗'],
        needsInput: true,
      },
      'not-between': {
        title: 'Outside Range',
        description: 'Number must NOT be within the specified range',
        icon: ArrowUpDown,
        color: 'text-cyan-600 dark:text-cyan-400',
        examples: ['Range: 10-20 → 5 ✓', 'Range: 10-20 → 25 ✓', 'Range: 10-20 → 15 ✗'],
        needsInput: true,
      },
    };
    return info[operator as keyof typeof info] || {
      title: operator,
      description: 'Custom number validation',
      icon: Info,
      color: 'text-gray-600',
      examples: [],
      needsInput: false,
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

  // Handle between operators
  if (isBetweenOperator) {
    const rangeValue = Array.isArray(value) && value.length === 2 ? value : [0, 100];
    
    return (
      <div className="space-y-4">
        <div>
          <div className="flex items-center gap-2 mb-3">
            <Label>Number Range</Label>
            <Badge variant="outline" className="text-xs">Inclusive</Badge>
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
              <Label className="text-xs text-muted-foreground mb-1">Minimum</Label>
              <Input
                type="number"
                value={rangeValue[0]}
                onChange={(e) => onChange([parseFloat(e.target.value) || 0, rangeValue[1]])}
                disabled={disabled}
                className="font-mono"
              />
            </div>
            <div>
              <Label className="text-xs text-muted-foreground mb-1">Maximum</Label>
              <Input
                type="number"
                value={rangeValue[1]}
                onChange={(e) => onChange([rangeValue[0], parseFloat(e.target.value) || 0])}
                disabled={disabled}
                className="font-mono"
              />
            </div>
          </div>

          <div className="px-3">
            <Slider
              value={rangeValue}
              onValueChange={onChange}
              min={Math.min(rangeValue[0] - 10, -100)}
              max={Math.max(rangeValue[1] + 10, 100)}
              step={1}
              disabled={disabled}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-muted-foreground mt-1">
              <span>{rangeValue[0]}</span>
              <span>{rangeValue[1]}</span>
            </div>
          </div>
        </div>

        <Alert>
          <Icon className="h-4 w-4" />
          <AlertDescription className="text-xs">
            <strong>{field}</strong> must {operator === 'between' ? 'be' : 'NOT be'} between {rangeValue[0]} and {rangeValue[1]} (inclusive)
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  // Handle min/max operators
  if (operator === 'min' || operator === 'max') {
    return (
      <div className="space-y-4">
        <div>
          <div className="flex items-center gap-2 mb-3">
            <Label>{operator === 'min' ? 'Minimum' : 'Maximum'} Value</Label>
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
            value={value || ''}
            onChange={(e) => onChange(e.target.value ? parseFloat(e.target.value) : undefined)}
            placeholder={`Enter ${operator} value`}
            disabled={disabled}
            className="font-mono"
          />
        </div>

        {value !== undefined && (
          <Alert>
            <Icon className="h-4 w-4" />
            <AlertDescription className="text-xs">
              <strong>{field}</strong> must be {operator === 'min' ? '≥' : '≤'} {value}
            </AlertDescription>
          </Alert>
        )}
      </div>
    );
  }

  // Handle simple validators (positive, negative, zero)
  return (
    <div className="space-y-4">
      <div>
        <div className="flex items-center gap-2 mb-3">
          <Label>Number Validation</Label>
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
        <Icon className="h-4 w-4" />
        <AlertTitle className="text-sm">Validating Field</AlertTitle>
        <AlertDescription className="text-xs">
          <strong>{field}</strong> must be {validationInfo.title.toLowerCase()}
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