import React from 'react';
import BottomSheet from '../ui/BottomSheet';
import Button from '../ui/Button';
import { formatCurrency } from '../../utils/format';

const MilestoneModal = ({ milestone, onAction }) => {
  if (!milestone) return null;

  return (
    <BottomSheet isOpen={!!milestone} title="Milestone Reached! 🎉">
      <div className="flex flex-col items-center text-center">
        <div className="w-20 h-20 bg-accent-bonus/20 rounded-full flex items-center justify-center text-4xl mb-4">
          🏆
        </div>
        <h3 className="text-xl font-bold mb-1 text-text-primary">Goal Achieved: {milestone.goalName}</h3>
        <p className="text-text-muted mb-6">
          You've saved {formatCurrency(milestone.currentValue)}, surpassing your target of {formatCurrency(milestone.targetValue)}.
        </p>
        
        <div className="w-full space-y-3">
          <Button 
            fullWidth 
            variant="primary" 
            onClick={() => onAction('spend')}
          >
            Spend in full (Achieve it)
          </Button>
          <Button 
            fullWidth 
            variant="secondary" 
            onClick={() => onAction('grow')}
          >
            Grow the target (Keep saving)
          </Button>
          <Button 
            fullWidth 
            variant="ghost" 
            className="text-red-500"
            onClick={() => onAction('delete')}
          >
            Delete this goal (Refund to pool)
          </Button>
        </div>
      </div>
    </BottomSheet>
  );
};

export default MilestoneModal;
