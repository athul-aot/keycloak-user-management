import React from 'react';
// import { Moon, Sun } from 'lucide-react';


const Header: React.FC = () => {
  return (
    <header className="bg-gradient-to-r from-blue-800 to-blue-600 text-white p-4 shadow-md">
      <div className="container mx-auto flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">Keycloak User Manager</h1>
          <p className="text-blue-100 text-sm">Manage users and their group memberships</p>
        </div>
      </div>
    </header>
  );
};

export default Header;