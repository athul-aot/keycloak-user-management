import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, Group, NewUser, NewGroup } from '../types';
import { 
  getAccessToken, 
  fetchUsers, 
  fetchAllGroups, 
  addUserToGroup,
  removeUserFromGroup,
  createUser,
  createGroup
} from '../services/api';
import { ToastMessage } from '../components/ToastContainer';

interface AppContextType {
  users: User[];
  groups: Group[];
  loading: boolean;
  error: string | null;
  selectedGroup: string;
  darkMode: boolean;
  searchQuery: string;
  toasts: ToastMessage[];
  isProcessing: boolean;
  setSelectedGroup: (groupId: string) => void;
  setSearchQuery: (query: string) => void;
  toggleDarkMode: () => void;
  addToast: (type: ToastMessage['type'], message: string) => void;
  removeToast: (id: string) => void;
  addUserToSelectedGroup: (userId: string) => Promise<void>;
  removeUserFromSelectedGroup: (userId: string, groupId: string) => Promise<void>;
  addAllUsersToSelectedGroup: () => Promise<void>;
  getUsersWithoutSelectedGroup: () => User[];
  createNewUser: (userData: NewUser) => Promise<void>;
  createNewGroup: (name: string, parentGroup?: string) => Promise<void>;
  refreshData: () => Promise<void>;
  getGroupNameById: (groupId: string) => string;
}

const AppContext = createContext<AppContextType | null>(null);

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
};

interface AppProviderProps {
  children: ReactNode;
}

export const AppProvider: React.FC<AppProviderProps> = ({ children }) => {
  const [users, setUsers] = useState<User[]>([]);
  const [groups, setGroups] = useState<Group[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [accessToken, setAccessToken] = useState<string>('');
  const [selectedGroup, setSelectedGroup] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [darkMode, setDarkMode] = useState<boolean>(
    () => window.matchMedia('(prefers-color-scheme: dark)').matches
  );
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);

  const getGroupNameById = (groupId: string): string => {
    const findGroupName = (groups: Group[], id: string): string => {
      for (const group of groups) {
        if (group.id === id) return group.name;
        if (group.subGroups && group.subGroups.length > 0) {
          const found = findGroupName(group.subGroups, id);
          if (found) return found;
        }
      }
      return '';
    };
    return findGroupName(groups, groupId);
  };

  const refreshData = async () => {
    try {
      setLoading(true);
      const [fetchedUsers, fetchedGroups] = await Promise.all([
        fetchUsers(accessToken),
        fetchAllGroups(accessToken)
      ]);
      
      setUsers(fetchedUsers);
      setGroups(fetchedGroups);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
      addToast('error', 'Failed to refresh data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const initializeData = async () => {
      try {
        setLoading(true);
        const token = await getAccessToken();
        setAccessToken(token);
        
        const [fetchedUsers, fetchedGroups] = await Promise.all([
          fetchUsers(token),
          fetchAllGroups(token)
        ]);
        
        setUsers(fetchedUsers);
        setGroups(fetchedGroups);
        
        if (fetchedGroups.length > 0) {
          const defaultGroup = fetchedGroups.find(g => g.name === 'camunda-admin');
          if (defaultGroup) {
            setSelectedGroup(defaultGroup.id);
          } else {
            setSelectedGroup(fetchedGroups[0].id);
          }
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An unknown error occurred');
        addToast('error', 'Failed to load users and groups');
      } finally {
        setLoading(false);
      }
    };
    
    initializeData();
  }, []);
  
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  const toggleDarkMode = () => {
    setDarkMode(prev => !prev);
  };
  
  const addToast = (type: ToastMessage['type'], message: string) => {
    const id = crypto.randomUUID();
    setToasts(prev => [...prev, { id, type, message }]);
  };
  
  const removeToast = (id: string) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  };
  
  const addUserToSelectedGroup = async (userId: string) => {
    if (!accessToken) {
      addToast('error', 'Not authenticated. Please refresh the page.');
      return;
    }
    
    try {
      setIsProcessing(true);
      
      const success = await addUserToGroup(accessToken, userId, selectedGroup);
      
      if (success) {
        const selectedGroupName = getGroupNameById(selectedGroup);
        setUsers(prevUsers => 
          prevUsers.map(user => {
            if (user.id === userId) {
              const hasGroup = user.groups.some(g => g.id === selectedGroup);
              if (!hasGroup) {
                return {
                  ...user,
                  groups: [...user.groups, { id: selectedGroup, name: selectedGroupName }]
                };
              }
            }
            return user;
          })
        );
        
        const user = users.find(u => u.id === userId);
        addToast('success', `Added ${user?.username || 'user'} to ${selectedGroupName} group`);
      } else {
        throw new Error('Failed to add user to group');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
      addToast('error', 'Failed to add user to group');
    } finally {
      setIsProcessing(false);
    }
  };

  const removeUserFromSelectedGroup = async (userId: string, groupId: string) => {
    if (!accessToken) {
      addToast('error', 'Not authenticated. Please refresh the page.');
      return;
    }
    
    try {
      setIsProcessing(true);
      
      const success = await removeUserFromGroup(accessToken, userId, groupId);
      
      if (success) {
        setUsers(prevUsers => 
          prevUsers.map(user => {
            if (user.id === userId) {
              return {
                ...user,
                groups: user.groups.filter(g => g.id !== groupId)
              };
            }
            return user;
          })
        );
        
        const user = users.find(u => u.id === userId);
        const groupName = getGroupNameById(groupId);
        addToast('success', `Removed ${user?.username || 'user'} from ${groupName} group`);
      } else {
        throw new Error('Failed to remove user from group');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
      addToast('error', 'Failed to remove user from group');
    } finally {
      setIsProcessing(false);
    }
  };
  
  const addAllUsersToSelectedGroup = async () => {
    if (!accessToken) {
      addToast('error', 'Not authenticated. Please refresh the page.');
      return;
    }
    
    const usersToUpdate = getUsersWithoutSelectedGroup();
    if (usersToUpdate.length === 0) {
      addToast('info', 'All users already have this group');
      return;
    }
    
    try {
      setIsProcessing(true);
      const selectedGroupName = getGroupNameById(selectedGroup);
      
      let successCount = 0;
      for (const user of usersToUpdate) {
        const success = await addUserToGroup(accessToken, user.id, selectedGroup);
        if (success) {
          successCount++;
        }
      }
      
      if (successCount > 0) {
        setUsers(prevUsers => 
          prevUsers.map(user => {
            if (usersToUpdate.some(u => u.id === user.id)) {
              const hasGroup = user.groups.some(g => g.id === selectedGroup);
              if (!hasGroup) {
                return {
                  ...user,
                  groups: [...user.groups, { id: selectedGroup, name: selectedGroupName }]
                };
              }
            }
            return user;
          })
        );
        
        addToast(
          'success', 
          `Added ${successCount} user${successCount !== 1 ? 's' : ''} to ${selectedGroupName} group`
        );
      } else {
        throw new Error('Failed to add users to group');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
      addToast('error', 'Failed to add users to group');
    } finally {
      setIsProcessing(false);
    }
  };
  
  const getUsersWithoutSelectedGroup = () => {
    return users.filter(user => 
      !user.groups.some(group => group.id === selectedGroup)
    );
  };

  const createNewUser = async (userData: NewUser) => {
    if (!accessToken) {
      addToast('error', 'Not authenticated. Please refresh the page.');
      return;
    }

    try {
      setIsProcessing(true);
      const success = await createUser(accessToken, userData);
      
      if (success) {
        addToast('success', `User ${userData.username} created successfully`);
        await refreshData();
      } else {
        throw new Error('Failed to create user');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
      addToast('error', 'Failed to create user');
      throw err;
    } finally {
      setIsProcessing(false);
    }
  };

  const createNewGroup = async (name: string, parentGroup?: string) => {
    if (!accessToken) {
      addToast('error', 'Not authenticated. Please refresh the page.');
      return;
    }

    try {
      setIsProcessing(true);
      const groupData: NewGroup = { name, parentGroup };
      const success = await createGroup(accessToken, groupData);
      
      if (success) {
        addToast('success', `Group ${name} created successfully`);
        await refreshData();
      } else {
        throw new Error('Failed to create group');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
      addToast('error', 'Failed to create group');
      throw err;
    } finally {
      setIsProcessing(false);
    }
  };

  const contextValue: AppContextType = {
    users,
    groups,
    loading,
    error,
    selectedGroup,
    darkMode,
    searchQuery,
    toasts,
    isProcessing,
    setSelectedGroup,
    setSearchQuery,
    toggleDarkMode,
    addToast,
    removeToast,
    addUserToSelectedGroup,
    removeUserFromSelectedGroup,
    addAllUsersToSelectedGroup,
    getUsersWithoutSelectedGroup,
    createNewUser,
    createNewGroup,
    refreshData,
    getGroupNameById
  };

  return (
    <AppContext.Provider value={contextValue}>
      {children}
    </AppContext.Provider>
  );
};