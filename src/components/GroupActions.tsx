import React from 'react';
import { Group } from '../types';
import { CheckCircle, UserPlus } from 'lucide-react';

interface GroupActionsProps {
  groups: Group[];
  selectedGroup: string;
  onSelectGroup: (groupName: string) => void;
  onAddGroupToAll: () => void;
  usersWithoutGroup: number;
  isProcessing: boolean;
}

const GroupActions: React.FC<GroupActionsProps> = ({ 
  groups, 
  selectedGroup, 
  onSelectGroup,
  onAddGroupToAll,
  usersWithoutGroup,
  isProcessing
}) => {
  return (
    <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm mb-4">
      <h2 className="text-lg font-semibold mb-3 text-gray-800 dark:text-white">Group Management</h2>
      
      <div className="flex flex-col md:flex-row md:items-end gap-4">
        <div className="flex-1">
          <label htmlFor="group-select" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Target Group
          </label>
          <select
            id="group-select"
            value={selectedGroup}
            onChange={(e) => onSelectGroup(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
          >
            {groups.map(group => (
              <option key={group.id} value={group.name}>
                {group.name}
              </option>
            ))}
          </select>
        </div>
        
        <div className="flex-shrink-0">
          <button
            onClick={onAddGroupToAll}
            disabled={isProcessing || usersWithoutGroup === 0}
            className={`
              flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-md
              hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50
              transition-colors
              ${(isProcessing || usersWithoutGroup === 0) ? 'opacity-50 cursor-not-allowed' : ''}
            `}
          >
            {isProcessing ? (
              <>
                <span className="animate-spin mr-2">⟳</span>
                Processing...
              </>
            ) : (
              <>
                <UserPlus className="h-5 w-5 mr-2" />
                Add to {usersWithoutGroup} User{usersWithoutGroup !== 1 ? 's' : ''}
              </>
            )}
          </button>
        </div>
      </div>
      
      {usersWithoutGroup === 0 && (
        <div className="mt-3 flex items-center text-sm text-teal-600 dark:text-teal-400">
          <CheckCircle className="h-4 w-4 mr-1" />
          All users have the selected group
        </div>
      )}
    </div>
  );
};

export default GroupActions;