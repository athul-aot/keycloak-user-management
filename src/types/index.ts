export interface User {
  id: string;
  username: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  groups: Group[];
}

export interface NewUser {
  username: string;
  firstName?: string;
  lastName?: string;
  email: string;
  enabled: boolean;
  emailVerified: boolean;
  credentials?: {
    type: string;
    value: string;
    temporary: boolean;
  }[];
}

export interface Group {
  id: string;
  name: string;
  path?: string;
  subGroups?: Group[];
  parentGroup?: string;
}

export interface ApiConfig {
  baseUrl: string;
  realm: string;
  clientId: string;
  clientSecret: string;
}

export interface NewGroup {
  name: string;
  parentGroup?: string;
}