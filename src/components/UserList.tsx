import React, { useState } from 'react';
import { User } from '../types';
import UserCard from './UserCard';
import { UserPlus } from 'lucide-react';
import ConfirmDialog from './ConfirmDialog';
import { useAppContext } from '../context/AppContext';

interface UserListProps {
  users: User[];
  filteredUsers: User[];
  searchQuery: string;
  targetGroup: string;
  onAddUserToGroup: (userId: string) => void;
  onRemoveUserFromGroup: (userId: string, groupId: string) => void;
  isProcessing: boolean;
}

const UserList: React.FC<UserListProps> = ({ 
  users, 
  filteredUsers,
  searchQuery,
  targetGroup,
  onAddUserToGroup,
  onRemoveUserFromGroup,
  isProcessing
}) => {
  const [selectedUsers, setSelectedUsers] = useState<Set<string>>(new Set());
  const [showConfirmAdd, setShowConfirmAdd] = useState(false);
  const { getGroupNameById } = useAppContext();

  const handleToggleSelect = (userId: string) => {
    setSelectedUsers(prev => {
      const newSet = new Set(prev);
      if (newSet.has(userId)) {
        newSet.delete(userId);
      } else {
        newSet.add(userId);
      }
      return newSet;
    });
  };

  const handleAddSelectedToGroup = () => {
    setShowConfirmAdd(true);
  };

  const confirmAddSelectedToGroup = async () => {
    for (const userId of selectedUsers) {
      await onAddUserToGroup(userId);
    }
    setSelectedUsers(new Set()); // Clear selection after adding
    setShowConfirmAdd(false);
  };

  if (users.length === 0) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg p-8 text-center shadow-sm border border-gray-200 dark:border-gray-700">
        <p className="text-gray-500 dark:text-gray-400">Loading users...</p>
      </div>
    );
  }
  
  if (filteredUsers.length === 0 && searchQuery) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg p-8 text-center shadow-sm border border-gray-200 dark:border-gray-700">
        <p className="text-gray-500 dark:text-gray-400">No users match your search criteria.</p>
      </div>
    );
  }

  const selectedUsersWithoutGroup = Array.from(selectedUsers).filter(userId => {
    const user = users.find(u => u.id === userId);
    return user && !user.groups.some(g => g.id === targetGroup);
  });
  
  return (
    <div>
      <div className="mb-4 flex justify-between items-center">
        <h2 className="text-lg font-semibold text-gray-800 dark:text-white">
          Users {searchQuery && `matching "${searchQuery}"`}
        </h2>
        <div className="flex items-center gap-4">
          {selectedUsersWithoutGroup.length > 0 && (
            <button
              onClick={handleAddSelectedToGroup}
              disabled={isProcessing}
              className={`
                flex items-center px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md
                hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500
                ${isProcessing ? 'opacity-50 cursor-not-allowed' : ''}
              `}
            >
              <UserPlus className="h-4 w-4 mr-2" />
              Add Selected to Group ({selectedUsersWithoutGroup.length})
            </button>
          )}
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Showing {filteredUsers.length} of {users.length} users
          </p>
        </div>
      </div>
      
      <div className="space-y-4">
        {filteredUsers.map(user => (
          <UserCard 
            key={user.id} 
            user={user} 
            targetGroup={targetGroup}
            onAddToGroup={onAddUserToGroup}
            onRemoveFromGroup={onRemoveUserFromGroup}
            isProcessing={isProcessing}
            isSelected={selectedUsers.has(user.id)}
            onToggleSelect={handleToggleSelect}
          />
        ))}
      </div>

      <ConfirmDialog
        isOpen={showConfirmAdd}
        title="Add Users to Group"
        message={`Are you sure you want to add ${selectedUsersWithoutGroup.length} selected user(s) to ${getGroupNameById(targetGroup)} group?`}
        confirmLabel="Add Users"
        onConfirm={confirmAddSelectedToGroup}
        onCancel={() => setShowConfirmAdd(false)}
      />
    </div>
  );
};

export default UserList;