import React from 'react';
import { User } from '../types';
import UserCard from './UserCard';

interface UserListProps {
  users: User[];
  filteredUsers: User[];
  searchQuery: string;
  targetGroup: string;
  onAddUserToGroup: (userId: string) => void;
  isProcessing: boolean;
}

const UserList: React.FC<UserListProps> = ({ 
  users, 
  filteredUsers,
  searchQuery,
  targetGroup,
  onAddUserToGroup,
  isProcessing
}) => {
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
  
  return (
    <div>
      <div className="mb-4 flex justify-between items-center">
        <h2 className="text-lg font-semibold text-gray-800 dark:text-white">
          Users {searchQuery && `matching "${searchQuery}"`}
        </h2>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Showing {filteredUsers.length} of {users.length} users
        </p>
      </div>
      
      <div className="space-y-4">
        {filteredUsers.map(user => (
          <UserCard 
            key={user.id} 
            user={user} 
            targetGroup={targetGroup}
            onAddToGroup={onAddUserToGroup}
            isProcessing={isProcessing}
          />
        ))}
      </div>
    </div>
  );
};

export default UserList;