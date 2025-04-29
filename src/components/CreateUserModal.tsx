import React, { useState } from 'react';
import { X } from 'lucide-react';
import { NewUser } from '../types';

interface CreateUserModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (userData: NewUser) => Promise<void>;
  isProcessing: boolean;
}

const CreateUserModal: React.FC<CreateUserModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  isProcessing
}) => {
  const [userData, setUserData] = useState<NewUser>({
    username: '',
    email: '',
    firstName: '',
    lastName: '',
    enabled: true,
    emailVerified: true,
    credentials: [{
      type: 'password',
      value: '',
      temporary: true
    }]
  });

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSubmit(userData);
    setUserData({
      username: '',
      email: '',
      firstName: '',
      lastName: '',
      enabled: true,
      emailVerified: true,
      credentials: [{
        type: 'password',
        value: '',
        temporary: true
      }]
    });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg w-full max-w-md">
        <div className="flex justify-between items-center p-4 border-b dark:border-gray-700">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Create New User</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Username*
              </label>
              <input
                type="text"
                required
                value={userData.username}
                onChange={(e) => setUserData({ ...userData, username: e.target.value })}
                className="w-full p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Email*
              </label>
              <input
                type="email"
                required
                value={userData.email}
                onChange={(e) => setUserData({ ...userData, email: e.target.value })}
                className="w-full p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                First Name
              </label>
              <input
                type="text"
                value={userData.firstName}
                onChange={(e) => setUserData({ ...userData, firstName: e.target.value })}
                className="w-full p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Last Name
              </label>
              <input
                type="text"
                value={userData.lastName}
                onChange={(e) => setUserData({ ...userData, lastName: e.target.value })}
                className="w-full p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Initial Password*
              </label>
              <input
                type="password"
                required
                value={userData.credentials?.[0]?.value || ''}
                onChange={(e) => setUserData({
                  ...userData,
                  credentials: [{
                    type: 'password',
                    value: e.target.value,
                    temporary: true
                  }]
                })}
                className="w-full p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              />
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                User will be prompted to change this on first login
              </p>
            </div>
          </div>

          <div className="mt-6 flex justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-600"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isProcessing}
              className={`
                px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md
                hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500
                ${isProcessing ? 'opacity-50 cursor-not-allowed' : ''}
              `}
            >
              {isProcessing ? 'Creating...' : 'Create User'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateUserModal;