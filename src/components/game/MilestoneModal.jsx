import React from 'react';
import BottomSheet from '../ui/BottomSheet';
import Button from '../ui/Button';
import { formatCurrency } from '../../utils/format';

const MilestoneModal = ({ milestone, onAction }) => {
  if (!milestone) return null;

  const isEmergency = Boolean(
    milestone.isEmergency ||
    milestone.goalType === 'emergency' ||
    (milestone.goalName && milestone.goalName.toLowerCase().includes('emergency'))
  );

  return (
    <BottomSheet isOpen={!!milestone} title={isEmergency ? "Emergency Buffer Secured! 🛡️" : "Milestone Reached! 🎉"}>
      <div className="flex flex-col items-center text-center">
        <div className="w-20 h-20 bg-accent-bonus/20 rounded-full flex items-center justify-center text-4xl mb-4">
          {isEmergency ? '🛡️' : '🏆'}
        </div>
        <h3 className="text-xl font-bold mb-1 text-text-primary">
          {isEmergency ? `Safety Target Reached: ${milestone.goalName}` : `Goal Achieved: ${milestone.goalName}`}
        </h3>
        <p className="text-text-muted mb-6">
          {isEmergency
            ? `Your safety buffer of ${formatCurrency(milestone.currentValue)} is fully funded! It will safeguard your household against job loss and sudden emergencies.`
            : `You've saved ${formatCurrency(milestone.currentValue)}, surpassing your target of ${formatCurrency(milestone.targetValue)}.`
          }
        </p>
        
        <div className="w-full space-y-3">
          {isEmergency ? (
            <Button 
              fullWidth 
              variant="primary" 
              className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold"
              onClick={() => onAction('redirect')}
            >
              Protect Buffer & Redirect Surplus to Other Goals 🎯
            </Button>
          ) : (
            <>
              <Button 
                fullWidth 
                variant="primary" 
                onClick={() => onAction('spend')}
              >
                Spend in full (Achieve it)
              </Button>
              <Button 
                fullWidth 
                variant="primary" 
                className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold"
                onClick={() => onAction('redirect')}
              >
                Stop Investing & Redirect Monthly Surplus 🎯
              </Button>
            </>
          )}
          <Button 
            fullWidth 
            variant="secondary" 
            onClick={() => onAction('grow')}
          >
            {isEmergency ? 'Expand Emergency Buffer (Keep saving)' : 'Grow the target (Keep saving)'}
          </Button>
          {!isEmergency && (
            <Button 
              fullWidth 
              variant="ghost" 
              className="text-red-500"
              onClick={() => onAction('delete')}
            >
              Delete this goal (Refund to pool)
            </Button>
          )}
        </div>
      </div>
    </BottomSheet>
  );
};

export default MilestoneModal;
