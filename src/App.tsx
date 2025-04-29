import React from 'react';
import { AppProvider, useAppContext } from './context/AppContext';
import Header from './components/Header';
import SearchBar from './components/SearchBar';
import GroupActions from './components/GroupActions';
import UserList from './components/UserList';
import ToastContainer from './components/ToastContainer';

const AppContent: React.FC = () => {
  const { 
    users,
    groups,
    loading,
    selectedGroup,
    darkMode,
    searchQuery,
    toasts,
    isProcessing,
    setSelectedGroup,
    setSearchQuery, 
    toggleDarkMode,
    removeToast,
    addUserToSelectedGroup,
    addAllUsersToSelectedGroup,
    getUsersWithoutSelectedGroup
  } = useAppContext();

  // Filter users based on search query
  const filteredUsers = React.useMemo(() => {
    if (!searchQuery) return users;
    
    const query = searchQuery.toLowerCase();
    return users.filter(user => 
      user.username.toLowerCase().includes(query) ||
      (user.firstName && user.firstName.toLowerCase().includes(query)) ||
      (user.lastName && user.lastName.toLowerCase().includes(query)) ||
      (user.email && user.email.toLowerCase().includes(query)) ||
      user.groups.some(group => group.name.toLowerCase().includes(query))
    );
  }, [users, searchQuery]);

  // Count users without the selected group
  const usersWithoutGroup = React.useMemo(() => {
    return getUsersWithoutSelectedGroup().length;
  }, [users, selectedGroup, getUsersWithoutSelectedGroup]);

  return (
    <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-gray-900 transition-colors duration-200">
      <Header darkMode={darkMode} toggleDarkMode={toggleDarkMode} />
      
      <main className="flex-1 container mx-auto px-4 py-6">
        <div className="grid grid-cols-1 gap-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <SearchBar 
              searchQuery={searchQuery} 
              setSearchQuery={setSearchQuery} 
              placeholder="Search users by name, email, or group..."
            />
          </div>
          
          {loading ? (
            <div className="bg-white dark:bg-gray-800 rounded-lg p-8 text-center shadow-sm border border-gray-200 dark:border-gray-700">
              <div className="animate-pulse flex flex-col items-center">
                <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/4 mb-4"></div>
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-full mb-2"></div>
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-full mb-2"></div>
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
              </div>
            </div>
          ) : (
            <>
              <GroupActions 
                groups={groups}
                selectedGroup={selectedGroup}
                onSelectGroup={setSelectedGroup}
                onAddGroupToAll={addAllUsersToSelectedGroup}
                usersWithoutGroup={usersWithoutGroup}
                isProcessing={isProcessing}
              />
              
              <UserList 
                users={users}
                filteredUsers={filteredUsers}
                searchQuery={searchQuery}
                targetGroup={selectedGroup}
                onAddUserToGroup={addUserToSelectedGroup}
                isProcessing={isProcessing}
              />
            </>
          )}
        </div>
      </main>
      
      <footer className="py-4 px-6 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700">
        <div className="container mx-auto">
          <p className="text-center text-sm text-gray-500 dark:text-gray-400">
            Keycloak User Manager • {new Date().getFullYear()}
          </p>
        </div>
      </footer>
      
      <ToastContainer toasts={toasts} removeToast={removeToast} />
    </div>
  );
};

function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}

export default App;