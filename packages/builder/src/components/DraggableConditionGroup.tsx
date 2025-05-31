import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Card } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { GripVertical, Plus, Trash2, Copy, ChevronDown, ChevronRight } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import type { Condition, ConditionType } from '@usex/rule-engine';
import { cn } from '../lib/utils';

interface DraggableConditionGroupProps {
  id: string;
  condition: Condition;
  depth: number;
  onUpdate: (condition: Condition) => void;
  onRemove: () => void;
  onDuplicate: () => void;
  onAddConstraint: () => void;
  onAddGroup: () => void;
  children: React.ReactNode;
  readOnly?: boolean;
  labels?: {
    or?: string;
    and?: string;
    none?: string;
    addRule?: string;
    addGroup?: string;
  };
  colors?: {
    or?: string;
    and?: string;
    none?: string;
  };
  enableDragDrop?: boolean;
}

export const DraggableConditionGroup: React.FC<DraggableConditionGroupProps> = ({
  id,
  condition,
  depth,
  onUpdate,
  onRemove,
  onDuplicate,
  onAddConstraint,
  onAddGroup,
  children,
  readOnly = false,
  labels = {},
  colors = {},
  enableDragDrop = true,
}) => {
  const [collapsed, setCollapsed] = React.useState(false);
  
  const conditionConfig = React.useMemo(() => ({
    or: {
      label: labels?.or || 'OR',
      color: colors?.or || 'hsl(var(--rule-or))',
      bg: 'hsl(var(--rule-or-bg))',
      description: 'At least one condition must be true',
    },
    and: {
      label: labels?.and || 'AND',
      color: colors?.and || 'hsl(var(--rule-and))',
      bg: 'hsl(var(--rule-and-bg))',
      description: 'All conditions must be true',
    },
    none: {
      label: labels?.none || 'NONE',
      color: colors?.none || 'hsl(var(--rule-none))',
      bg: 'hsl(var(--rule-none-bg))',
      description: 'No conditions should be true',
    },
  }), [labels, colors]);
  
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id, disabled: readOnly || !enableDragDrop });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const conditionType = (Object.keys(condition).find(
    key => key === 'or' || key === 'and' || key === 'none'
  ) || 'or') as ConditionType;

  const config = conditionConfig[conditionType];
  const items = condition[conditionType] || [];

  const handleTypeChange = (newType: ConditionType) => {
    if (newType === conditionType) return;
    
    const newCondition: Condition = {
      [newType]: items,
      result: condition.result,
    };
    
    onUpdate(newCondition);
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        'relative animate-fadeIn',
        isDragging && 'opacity-50',
        depth > 0 && 'ml-6'
      )}
    >
      <Card 
        className={cn(
          'border-2 transition-all duration-200',
          `hover:shadow-lg`
        )}
        style={{
          borderColor: config.color,
          backgroundColor: config.bg,
        }}
      >
        <div className="p-4">
          {/* Header */}
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              {!readOnly && enableDragDrop && (
                <button
                  className="cursor-grab active:cursor-grabbing text-muted-foreground hover:text-foreground"
                  {...attributes}
                  {...listeners}
                >
                  <GripVertical className="h-5 w-5" />
                </button>
              )}
              
              <button
                onClick={() => setCollapsed(!collapsed)}
                className="p-1 hover:bg-background/50 rounded"
              >
                {collapsed ? (
                  <ChevronRight className="h-4 w-4" />
                ) : (
                  <ChevronDown className="h-4 w-4" />
                )}
              </button>

              <Select
                value={conditionType}
                onValueChange={handleTypeChange}
                disabled={readOnly}
              >
                <SelectTrigger className="w-[100px] h-8">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(conditionConfig).map(([type, conf]) => (
                    <SelectItem key={type} value={type}>
                      <div className="flex items-center gap-2">
                        <Badge 
                          variant={type as any}
                          className="w-12 justify-center"
                        >
                          {conf.label}
                        </Badge>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <span className="text-sm text-muted-foreground">
                {config.description}
              </span>
            </div>

            <div className="flex items-center gap-1">
              {!readOnly && (
                <>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={onDuplicate}
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={onAddConstraint}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={onAddGroup}
                  >
                    <Plus className="h-4 w-4" />
                    <Plus className="h-3 w-3 -ml-2" />
                  </Button>
                  {depth > 0 && (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-destructive hover:text-destructive"
                      onClick={onRemove}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </>
              )}
            </div>
          </div>

          {/* Content */}
          {!collapsed && (
            <div className="space-y-3">
              {items.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <p className="text-sm mb-3">No conditions in this group</p>
                  {!readOnly && (
                    <div className="flex justify-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={onAddConstraint}
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        {labels?.addRule || 'Add Rule'}
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={onAddGroup}
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        {labels?.addGroup || 'Add Group'}
                      </Button>
                    </div>
                  )}
                </div>
              ) : (
                children
              )}
            </div>
          )}
        </div>
      </Card>
    </div>
  );
};