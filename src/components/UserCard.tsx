import React, { useState } from 'react';
import { User as UserIcon, ChevronDown, ChevronUp, UserMinus } from 'lucide-react';
import { User, Group } from '../types';
import GroupBadge from './GroupBadge';
import { useAppContext } from '../context/AppContext';

interface UserCardProps {
  user: User;
  targetGroup: string;
  onAddToGroup: (userId: string) => void;
  onRemoveFromGroup: (userId: string, groupId: string) => void;
  isProcessing: boolean;
  isSelected: boolean;
  onToggleSelect: (userId: string) => void;
}

const UserCard: React.FC<UserCardProps> = ({ 
  user, 
  targetGroup, 
  onAddToGroup,
  onRemoveFromGroup,
  isProcessing,
  isSelected,
  onToggleSelect
}) => {
  const [expanded, setExpanded] = useState(false);
  const { getGroupNameById } = useAppContext();
  
  const hasTargetGroup = user.groups.some(group => group.id === targetGroup);
  const targetGroupObj = user.groups.find(group => group.id === targetGroup);
  
  return (
    <div className={`
      border rounded-lg p-4 mb-4 transition-all duration-200 shadow-sm hover:shadow-md
      ${hasTargetGroup ? 'border-l-4 border-l-teal-500' : 'border-l-4 border-l-gray-300'}
      dark:bg-gray-800 dark:border-gray-700 dark:border-l-4 
      ${hasTargetGroup ? 'dark:border-l-teal-500' : 'dark:border-l-gray-600'}
    `}>
      <div className="flex justify-between items-start">
        <div className="flex items-center">
          <input
            type="checkbox"
            checked={isSelected}
            onChange={() => onToggleSelect(user.id)}
            className="h-5 w-5 text-blue-600 focus:ring-blue-500 border-gray-300 rounded mr-3"
          />
          <div className="bg-gray-100 dark:bg-gray-700 p-2 rounded-full mr-3">
            <UserIcon className="h-5 w-5 text-gray-500 dark:text-gray-300" />
          </div>
          <div>
            <h3 className="font-medium text-gray-900 dark:text-white">{user.username}</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {user.firstName && user.lastName 
                ? `${user.firstName} ${user.lastName}` 
                : user.email || 'No additional info'}
            </p>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          {hasTargetGroup && targetGroupObj && (
            <button 
              onClick={() => onRemoveFromGroup(user.id, targetGroupObj.id)}
              disabled={isProcessing}
              className={`
                p-1.5 rounded-full text-white bg-red-600 hover:bg-red-700 transition-colors
                ${isProcessing ? 'opacity-50 cursor-not-allowed' : ''}
              `}
              title={`Remove ${user.username} from ${getGroupNameById(targetGroupObj.id)} group`}
            >
              <UserMinus className="h-4 w-4" />
            </button>
          )}
          
          <button 
            onClick={() => setExpanded(!expanded)} 
            className="p-1.5 rounded-full text-gray-500 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700 transition-colors"
            aria-label={expanded ? "Collapse user details" : "Expand user details"}
          >
            {expanded ? (
              <ChevronUp className="h-4 w-4" />
            ) : (
              <ChevronDown className="h-4 w-4" />
            )}
          </button>
        </div>
      </div>
      
      {expanded && (
        <div className="mt-4 pt-3 border-t border-gray-200 dark:border-gray-700 animate-fadeIn">
          <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">Groups:</h4>
          <div className="flex flex-wrap gap-2">
            {user.groups.length > 0 ? (
              user.groups.map(group => (
                <GroupBadge 
                  key={group.id} 
                  name={getGroupNameById(group.id)} 
                  isHighlighted={group.id === targetGroup} 
                />
              ))
            ) : (
              <p className="text-sm text-gray-500 dark:text-gray-400">No groups assigned</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default UserCard;