export interface User {
  id: string;
  username: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  groups: Group[];
}

export interface Group {
  id: string;
  name: string;
  path?: string;
}

export interface ApiConfig {
  baseUrl: string;
  realm: string;
  clientId: string;
  clientSecret: string;
}