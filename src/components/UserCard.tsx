import React, { useState } from 'react';
import { UserMinus, ChevronDown, ChevronUp, UserIcon } from 'lucide-react';
import { User, Group } from '../types';
import GroupBadge from './GroupBadge';
import { useAppContext } from '../context/AppContext';
import ConfirmDialog from './ConfirmDialog';

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
  const [showConfirmRemove, setShowConfirmRemove] = useState(false);
  const [groupToRemove, setGroupToRemove] = useState<Group | null>(null);
  const { getGroupNameById } = useAppContext();
  
  const hasTargetGroup = user.groups.some(group => group.id === targetGroup);
  
  const handleRemoveFromGroup = (group: Group) => {
    setGroupToRemove(group);
    setShowConfirmRemove(true);
  };

  const confirmRemoveFromGroup = () => {
    if (groupToRemove) {
      onRemoveFromGroup(user.id, groupToRemove.id);
    }
    setShowConfirmRemove(false);
    setGroupToRemove(null);
  };

  return (
    <>
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
              disabled={hasTargetGroup}
              className={`
                h-5 w-5 text-blue-600 focus:ring-blue-500 border-gray-300 rounded mr-3
                ${hasTargetGroup ? 'opacity-50 cursor-not-allowed' : ''}
              `}
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
                  <div key={group.id} className="flex items-center">
                    <GroupBadge 
                      name={getGroupNameById(group.id)} 
                      isHighlighted={true}
                    />
                    <button
                      onClick={() => handleRemoveFromGroup(group)}
                      disabled={isProcessing}
                      className="ml-1 p-1 text-gray-400 hover:text-red-500 dark:text-gray-500 dark:hover:text-red-400 transition-colors"
                      title={`Remove ${user.username} from ${getGroupNameById(group.id)} group`}
                    >
                      <UserMinus className="h-3 w-3" />
                    </button>
                  </div>
                ))
              ) : (
                <p className="text-sm text-gray-500 dark:text-gray-400">No groups assigned</p>
              )}
            </div>
          </div>
        )}
      </div>

      <ConfirmDialog
        isOpen={showConfirmRemove}
        title="Remove from Group"
        message={`Are you sure you want to remove ${user.username} from ${groupToRemove ? getGroupNameById(groupToRemove.id) : ''} group?`}
        confirmLabel="Remove"
        onConfirm={confirmRemoveFromGroup}
        onCancel={() => {
          setShowConfirmRemove(false);
          setGroupToRemove(null);
        }}
      />
    </>
  );
};

export default UserCard;