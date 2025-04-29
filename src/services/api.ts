import { ApiConfig, Group, User, NewUser } from '../types';

export const defaultConfig: ApiConfig = {
  baseUrl: import.meta.env.VITE_BASE_URL, // http://{ip-address}:8080
  realm: import.meta.env.VITE_REALM_NAME, // realm_name
  clientId: import.meta.env.VITE_CLIENT_ID, // client_id
  clientSecret: import.meta.env.VITE_CLIENT_SECRET, // client_secret
};

export async function getAccessToken(config: ApiConfig = defaultConfig) {
  const params = new URLSearchParams();
  params.append('client_id', config.clientId);
  params.append('client_secret', config.clientSecret);
  params.append('grant_type', 'client_credentials');

  const response = await fetch(`${config.baseUrl}/auth/realms/${config.realm}/protocol/openid-connect/token`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: params
  });

  if (!response.ok) {
    throw new Error(`Failed to get access token: ${response.status} ${response.statusText}`);
  }

  const data = await response.json();
  return data.access_token;
}

export async function fetchUsers(token: string, config: ApiConfig = defaultConfig): Promise<User[]> {
  const response = await fetch(`${config.baseUrl}/auth/admin/realms/${config.realm}/users`, {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch users: ${response.status} ${response.statusText}`);
  }

  const users = await response.json();
  
  const usersWithGroups = await Promise.all(
    users.map(async (user: any) => {
      const groups = await fetchUserGroups(token, user.id, config);
      return {
        ...user,
        groups
      };
    })
  );

  return usersWithGroups;
}

export async function fetchUserGroups(
  token: string, 
  userId: string, 
  config: ApiConfig = defaultConfig
): Promise<Group[]> {
  const response = await fetch(`${config.baseUrl}/auth/admin/realms/${config.realm}/users/${userId}/groups`, {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch user groups: ${response.status} ${response.statusText}`);
  }

  return await response.json();
}

export async function fetchAllGroups(token: string, config: ApiConfig = defaultConfig): Promise<Group[]> {
  const response = await fetch(`${config.baseUrl}/auth/admin/realms/${config.realm}/groups`, {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch groups: ${response.status} ${response.statusText}`);
  }

  return await response.json();
}

export async function addUserToGroup(
  token: string, 
  userId: string, 
  groupId: string, 
  config: ApiConfig = defaultConfig
): Promise<boolean> {
  const url = `${config.baseUrl}/auth/admin/realms/${config.realm}/users/${userId}/groups/${groupId}`;
  const response = await fetch(url, {
    method: 'PUT',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({})
  });

  return response.ok;
}
