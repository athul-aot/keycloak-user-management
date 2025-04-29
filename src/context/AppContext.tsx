import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, Group } from '../types';
import { 
  getAccessToken, 
  fetchUsers, 
  fetchAllGroups, 
  addUserToGroup 
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
  setSelectedGroup: (group: string) => void;
  setSearchQuery: (query: string) => void;
  toggleDarkMode: () => void;
  addToast: (type: ToastMessage['type'], message: string) => void;
  removeToast: (id: string) => void;
  addUserToSelectedGroup: (userId: string) => Promise<void>;
  addAllUsersToSelectedGroup: () => Promise<void>;
  getUsersWithoutSelectedGroup: () => User[];
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
  const [selectedGroup, setSelectedGroup] = useState<string>('camunda-admin');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [darkMode, setDarkMode] = useState<boolean>(
    () => window.matchMedia('(prefers-color-scheme: dark)').matches
  );
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);

  // Initialize data on load
  useEffect(() => {
    const fetchData = async () => {
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
        
        // Set default group if available
        if (fetchedGroups.length > 0) {
          const defaultGroup = fetchedGroups.find(g => g.name === 'camunda-admin');
          if (defaultGroup) {
            setSelectedGroup(defaultGroup.name);
          } else {
            setSelectedGroup(fetchedGroups[0].name);
          }
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An unknown error occurred');
        addToast('error', 'Failed to load users and groups');
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, []);
  
  // Apply dark mode class to document
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
      
      // Find the group ID for the selected group name
      const group = groups.find(g => g.name === selectedGroup);
      if (!group) {
        throw new Error(`Group ${selectedGroup} not found`);
      }
      
      // Add user to group
      const success = await addUserToGroup(accessToken, userId, group.id);
      
      if (success) {
        // Update the user in the state with the new group
        setUsers(prevUsers => 
          prevUsers.map(user => {
            if (user.id === userId) {
              // Check if user already has this group
              const hasGroup = user.groups.some(g => g.id === group.id);
              if (!hasGroup) {
                return {
                  ...user,
                  groups: [...user.groups, group]
                };
              }
            }
            return user;
          })
        );
        
        const user = users.find(u => u.id === userId);
        addToast('success', `Added ${user?.username || 'user'} to ${selectedGroup} group`);
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
      
      // Find the group ID for the selected group name
      const group = groups.find(g => g.name === selectedGroup);
      if (!group) {
        throw new Error(`Group ${selectedGroup} not found`);
      }
      
      // Add all users to group
      let successCount = 0;
      for (const user of usersToUpdate) {
        const success = await addUserToGroup(accessToken, user.id, group.id);
        if (success) {
          successCount++;
        }
      }
      
      if (successCount > 0) {
        // Update users in state
        setUsers(prevUsers => 
          prevUsers.map(user => {
            // Check if this user needs the group
            if (usersToUpdate.some(u => u.id === user.id)) {
              // Check if user already has this group
              const hasGroup = user.groups.some(g => g.id === group.id);
              if (!hasGroup) {
                return {
                  ...user,
                  groups: [...user.groups, group]
                };
              }
            }
            return user;
          })
        );
        
        addToast(
          'success', 
          `Added ${successCount} user${successCount !== 1 ? 's' : ''} to ${selectedGroup} group`
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
      !user.groups.some(group => group.name === selectedGroup)
    );
  };
  
  // Filter users based on search query
  const getFilteredUsers = () => {
    if (!searchQuery) return users;
    
    const query = searchQuery.toLowerCase();
    return users.filter(user => 
      user.username.toLowerCase().includes(query) ||
      (user.firstName && user.firstName.toLowerCase().includes(query)) ||
      (user.lastName && user.lastName.toLowerCase().includes(query)) ||
      (user.email && user.email.toLowerCase().includes(query)) ||
      user.groups.some(group => group.name.toLowerCase().includes(query))
    );
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
    addAllUsersToSelectedGroup,
    getUsersWithoutSelectedGroup
  };

  return (
    <AppContext.Provider value={contextValue}>
      {children}
    </AppContext.Provider>
  );
};