import React, { useState } from 'react';
import { User as UserIcon, ChevronDown, ChevronUp, UserPlus } from 'lucide-react';
import { User, Group } from '../types';
import GroupBadge from './GroupBadge';

interface UserCardProps {
  user: User;
  targetGroup: string;
  onAddToGroup: (userId: string) => void;
  isProcessing: boolean;
}

const UserCard: React.FC<UserCardProps> = ({ 
  user, 
  targetGroup, 
  onAddToGroup,
  isProcessing
}) => {
  const [expanded, setExpanded] = useState(false);
  
  const hasTargetGroup = user.groups.some(group => group.name === targetGroup);
  
  return (
    <div className={`
      border rounded-lg p-4 mb-4 transition-all duration-200 shadow-sm hover:shadow-md
      ${hasTargetGroup ? 'border-l-4 border-l-teal-500' : 'border-l-4 border-l-gray-300'}
      dark:bg-gray-800 dark:border-gray-700 dark:border-l-4 
      ${hasTargetGroup ? 'dark:border-l-teal-500' : 'dark:border-l-gray-600'}
    `}>
      <div className="flex justify-between items-start">
        <div className="flex items-center">
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
          {!hasTargetGroup && (
            <button 
              onClick={() => onAddToGroup(user.id)}
              disabled={isProcessing}
              className={`
                p-1.5 rounded-full text-white bg-blue-600 hover:bg-blue-700 transition-colors
                ${isProcessing ? 'opacity-50 cursor-not-allowed' : ''}
              `}
              title={`Add ${user.username} to ${targetGroup} group`}
            >
              <UserPlus className="h-4 w-4" />
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
                  name={group.name} 
                  isHighlighted={group.name === targetGroup} 
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