import React, { useState } from 'react';
import { X } from 'lucide-react';
import { Group } from '../types';

interface CreateGroupModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (name: string, parentGroup?: string) => Promise<void>;
  isProcessing: boolean;
  existingGroups: Group[];
}

const CreateGroupModal: React.FC<CreateGroupModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  isProcessing,
  existingGroups
}) => {
  const [groupName, setGroupName] = useState('');
  const [isSubgroup, setIsSubgroup] = useState(false);
  const [parentGroupId, setParentGroupId] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSubmit(groupName, isSubgroup ? parentGroupId : undefined);
    setGroupName('');
    setIsSubgroup(false);
    setParentGroupId('');
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg w-full max-w-md">
        <div className="flex justify-between items-center p-4 border-b dark:border-gray-700">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Create New Group</h2>
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
                Group Name*
              </label>
              <input
                type="text"
                required
                value={groupName}
                onChange={(e) => setGroupName(e.target.value)}
                className="w-full p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                placeholder="Enter group name"
              />
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                id="isSubgroup"
                checked={isSubgroup}
                onChange={(e) => setIsSubgroup(e.target.checked)}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label htmlFor="isSubgroup" className="ml-2 block text-sm text-gray-900 dark:text-gray-300">
                Create as subgroup
              </label>
            </div>

            {isSubgroup && (
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Parent Group*
                </label>
                <select
                  required
                  value={parentGroupId}
                  onChange={(e) => setParentGroupId(e.target.value)}
                  className="w-full p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                >
                  <option value="">Select parent group</option>
                  {existingGroups.map(group => (
                    <option key={group.id} value={group.id}>
                      {group.name}
                    </option>
                  ))}
                </select>
              </div>
            )}
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
              disabled={isProcessing || (isSubgroup && !parentGroupId)}
              className={`
                px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md
                hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500
                ${(isProcessing || (isSubgroup && !parentGroupId)) ? 'opacity-50 cursor-not-allowed' : ''}
              `}
            >
              {isProcessing ? 'Creating...' : 'Create Group'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateGroupModal;