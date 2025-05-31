import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Plus } from 'lucide-react';
import { ConditionGroup } from './ConditionGroup';
import { ImportExport } from './ImportExport';
import { useRuleBuilder } from '../context/RuleBuilderContext';
import { ConditionTypes } from '@usex/rule-engine';
import type { RuleEditorProps } from '../types';
import { cn } from '../lib/utils';

export const RuleEditor: React.FC<RuleEditorProps> = ({
  className,
  readOnly = false,
}) => {
  const { 
    state, 
    addCondition, 
    updateCondition, 
    removeCondition,
    importRule,
    exportRule,
  } = useRuleBuilder();

  const conditions = React.useMemo(() => {
    if (!state.rule.conditions) return [];
    return Array.isArray(state.rule.conditions) 
      ? state.rule.conditions 
      : [state.rule.conditions];
  }, [state.rule.conditions]);

  const handleAddRootCondition = () => {
    addCondition('', ConditionTypes.OR);
  };

  return (
    <Card className={cn('w-full', className)}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Rule Editor</CardTitle>
          {!readOnly && (
            <ImportExport
              onImport={importRule}
              onExport={exportRule}
            />
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {conditions.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground mb-4">
              No conditions defined. Start by adding a condition group.
            </p>
            {!readOnly && (
              <Button onClick={handleAddRootCondition}>
                <Plus className="h-4 w-4 mr-2" />
                Add Condition Group
              </Button>
            )}
          </div>
        ) : (
          <>
            {conditions.map((condition, index) => (
              <ConditionGroup
                key={`root-${index}`}
                condition={condition}
                path={`${index}`}
                readOnly={readOnly}
                onUpdate={(updatedCondition) => 
                  updateCondition(`${index}`, updatedCondition)
                }
                onRemove={() => removeCondition(`${index}`)}
              />
            ))}
            {!readOnly && (
              <Button 
                onClick={handleAddRootCondition}
                variant="outline"
                className="w-full"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Condition Group
              </Button>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
};