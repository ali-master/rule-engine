import React from 'react';
import { Input } from '../ui/input';
import { Button } from '../ui/button';
import { Label } from '../ui/label';
import { Badge } from '../ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Calendar, Clock, Info } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '../ui/tooltip';
import { Alert, AlertDescription } from '../ui/alert';
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover';
import { Calendar as CalendarComponent } from '../ui/calendar';
import { format } from 'date-fns';
import type { OperatorHandlerProps } from './index';

export const DateOperatorHandler: React.FC<OperatorHandlerProps> = ({
  operator,
  value,
  onChange,
  field,
  disabled,
}) => {
  const isRelativeOperator = ['date-after-now', 'date-before-now'].includes(operator);
  const isBetweenOperator = ['date-between', 'date-not-between'].includes(operator);

  const getOperatorDescription = () => {
    const descriptions = {
      'date-after': 'Date must be after the specified date',
      'date-before': 'Date must be before the specified date',
      'date-equals': 'Date must be exactly the specified date',
      'date-between': 'Date must be between two dates (inclusive)',
      'date-not-between': 'Date must NOT be between two dates',
      'date-after-now': 'Date must be after the current date/time plus offset',
      'date-before-now': 'Date must be before the current date/time minus offset',
      'date-after-or-equals': 'Date must be after or equal to the specified date',
      'date-before-or-equals': 'Date must be before or equal to the specified date',
    };
    return descriptions[operator as keyof typeof descriptions] || operator;
  };

  // Handle relative date operators (date-after-now, date-before-now)
  if (isRelativeOperator) {
    const relativeValue = typeof value === 'object' && value !== null ? value : { value: 0, unit: 'days' };
    
    return (
      <div className="space-y-4">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Label>Time Offset</Label>
            <Badge variant="outline" className="text-xs">Relative to now</Badge>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger>
                  <Info className="h-3 w-3 text-muted-foreground" />
                </TooltipTrigger>
                <TooltipContent className="max-w-xs">
                  <p className="font-semibold mb-1">Relative Date Check</p>
                  <p className="text-xs">{getOperatorDescription()}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        </div>

        <div className="flex gap-2">
          <Input
            type="number"
            value={relativeValue.value || 0}
            onChange={(e) => onChange({ ...relativeValue, value: parseInt(e.target.value) || 0 })}
            placeholder="0"
            disabled={disabled}
            className="w-24"
          />
          <Select
            value={relativeValue.unit || 'days'}
            onValueChange={(unit) => onChange({ ...relativeValue, unit })}
            disabled={disabled}
          >
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="minutes">Minutes</SelectItem>
              <SelectItem value="hours">Hours</SelectItem>
              <SelectItem value="days">Days</SelectItem>
              <SelectItem value="weeks">Weeks</SelectItem>
              <SelectItem value="months">Months</SelectItem>
              <SelectItem value="years">Years</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <Alert>
          <Clock className="h-4 w-4" />
          <AlertDescription className="text-xs">
            {operator === 'date-after-now' ? (
              <span>Checking if <strong>{field}</strong> is after: now + {relativeValue.value} {relativeValue.unit}</span>
            ) : (
              <span>Checking if <strong>{field}</strong> is before: now - {relativeValue.value} {relativeValue.unit}</span>
            )}
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  // Handle between operators
  if (isBetweenOperator) {
    const betweenValue = Array.isArray(value) && value.length === 2 ? value : ['', ''];
    
    return (
      <div className="space-y-4">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Label>Date Range</Label>
            <Badge variant="outline" className="text-xs">Inclusive</Badge>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger>
                  <Info className="h-3 w-3 text-muted-foreground" />
                </TooltipTrigger>
                <TooltipContent>
                  <p>{getOperatorDescription()}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        </div>

        <div className="space-y-3">
          <div>
            <Label className="text-xs text-muted-foreground mb-1">Start Date</Label>
            <DatePicker
              value={betweenValue[0]}
              onChange={(date) => onChange([date, betweenValue[1]])}
              disabled={disabled}
              placeholder="Select start date"
            />
          </div>
          <div>
            <Label className="text-xs text-muted-foreground mb-1">End Date</Label>
            <DatePicker
              value={betweenValue[1]}
              onChange={(date) => onChange([betweenValue[0], date])}
              disabled={disabled}
              placeholder="Select end date"
            />
          </div>
        </div>

        {betweenValue[0] && betweenValue[1] && (
          <Alert>
            <Calendar className="h-4 w-4" />
            <AlertDescription className="text-xs">
              <span>Checking if <strong>{field}</strong> is {operator === 'date-between' ? 'between' : 'NOT between'} {betweenValue[0]} and {betweenValue[1]}</span>
            </AlertDescription>
          </Alert>
        )}
      </div>
    );
  }

  // Handle single date operators
  return (
    <div className="space-y-4">
      <div>
        <div className="flex items-center gap-2 mb-2">
          <Label>Date Value</Label>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger>
                <Info className="h-3 w-3 text-muted-foreground" />
              </TooltipTrigger>
              <TooltipContent>
                <p>{getOperatorDescription()}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </div>

      <DatePicker
        value={value}
        onChange={onChange}
        disabled={disabled}
        placeholder="Select date"
      />

      {value && (
        <Alert>
          <Calendar className="h-4 w-4" />
          <AlertDescription className="text-xs">
            <span>Checking if <strong>{field}</strong> is {operator.replace('date-', '').replace(/-/g, ' ')} {value}</span>
          </AlertDescription>
        </Alert>
      )}

      <div className="flex gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => onChange(new Date().toISOString().split('T')[0])}
          disabled={disabled}
        >
          Today
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => {
            const tomorrow = new Date();
            tomorrow.setDate(tomorrow.getDate() + 1);
            onChange(tomorrow.toISOString().split('T')[0]);
          }}
          disabled={disabled}
        >
          Tomorrow
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => {
            const yesterday = new Date();
            yesterday.setDate(yesterday.getDate() - 1);
            onChange(yesterday.toISOString().split('T')[0]);
          }}
          disabled={disabled}
        >
          Yesterday
        </Button>
      </div>
    </div>
  );
};

// Date picker component
const DatePicker: React.FC<{
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  placeholder?: string;
}> = ({ value, onChange, disabled, placeholder }) => {
  const [isOpen, setIsOpen] = React.useState(false);
  const date = value ? new Date(value) : undefined;

  return (
    <div className="flex gap-2">
      <Input
        value={value || ''}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder || "YYYY-MM-DD"}
        disabled={disabled}
        className="font-mono"
      />
      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>
          <Button variant="outline" size="icon" disabled={disabled}>
            <Calendar className="h-4 w-4" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <CalendarComponent
            mode="single"
            selected={date}
            onSelect={(newDate) => {
              if (newDate) {
                onChange(format(newDate, 'yyyy-MM-dd'));
                setIsOpen(false);
              }
            }}
            initialFocus
          />
        </PopoverContent>
      </Popover>
    </div>
  );
};