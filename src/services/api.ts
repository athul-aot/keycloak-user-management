import { ApiConfig, Group, User, NewUser, NewGroup } from '../types';

export const defaultConfig: ApiConfig = {
  baseUrl: import.meta.env.VITE_BASE_URL,
  realm: import.meta.env.VITE_REALM_NAME,
  clientId: import.meta.env.VITE_CLIENT_ID,
  clientSecret: import.meta.env.VITE_CLIENT_SECRET
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

export async function createUser(token: string, userData: NewUser, config: ApiConfig = defaultConfig): Promise<boolean> {
  const response = await fetch(`${config.baseUrl}/auth/admin/realms/${config.realm}/users`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(userData)
  });

  return response.ok;
}

export async function createGroup(
  token: string, 
  groupData: NewGroup, 
  config: ApiConfig = defaultConfig
): Promise<boolean> {
  const endpoint = groupData.parentGroup
    ? `${config.baseUrl}/auth/admin/realms/${config.realm}/groups/${groupData.parentGroup}/children`
    : `${config.baseUrl}/auth/admin/realms/${config.realm}/groups`;

  const response = await fetch(endpoint, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ name: groupData.name })
  });

  return response.ok;
}

export async function removeUserFromGroup(
  token: string,
  userId: string,
  groupId: string,
  config: ApiConfig = defaultConfig
): Promise<boolean> {
  const response = await fetch(
    `${config.baseUrl}/auth/admin/realms/${config.realm}/users/${userId}/groups/${groupId}`,
    {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    }
  );

  return response.ok;
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

async function fetchSubGroups(
  token: string,
  groupId: string,
  config: ApiConfig = defaultConfig
): Promise<Group[]> {
  const response = await fetch(
    `${config.baseUrl}/auth/admin/realms/${config.realm}/groups/${groupId}/children?first=0&max=100`,
    {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    }
  );

  if (!response.ok) {
    throw new Error(`Failed to fetch subgroups: ${response.status} ${response.statusText}`);
  }

  const subGroups = await response.json();
  return await Promise.all(
    subGroups.map(async (group: any) => ({
      id: group.id,
      name: group.name,
      path: group.path,
      subGroups: await fetchSubGroups(token, group.id, config),
      parentGroup: groupId
    }))
  );
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

  const groups = await response.json();
  return await Promise.all(
    groups.map(async (group: any) => ({
      id: group.id,
      name: group.name,
      path: group.path,
      subGroups: await fetchSubGroups(token, group.id, config),
      parentGroup: null
    }))
  );
}

export async function addUserToGroup(
  token: string, 
  userId: string, 
  groupId: string, 
  config: ApiConfig = defaultConfig
): Promise<boolean> {
  const response = await fetch(
    `${config.baseUrl}/auth/admin/realms/${config.realm}/users/${userId}/groups/${groupId}`,
    {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    }
  );

  return response.ok;
}