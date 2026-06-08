import { randomUUID } from 'crypto';

type User = {
  _id: string;
  email: string;
  name: string;
  role: 'admin' | 'user';
};

// In‑memory store (reset on server restart)
const users: User[] = [];

export const register = async (name: string, email: string, password: string) => {
  // simple duplicate check
  if (users.find((u) => u.email === email)) {
    throw new Error('User already exists');
  }
  const user: User = {
    _id: randomUUID(),
    email,
    name,
    role: 'user',
  };
  users.push(user);
  // token is just a placeholder string for mock purposes
  return { token: 'mock-token', user };
};

export const login = async (email: string, password: string) => {
  const user = users.find((u) => u.email === email);
  if (!user) {
    throw new Error('Invalid credentials');
  }
  return { token: 'mock-token', user };
};

export const me = async () => {
  // Return first user if any; otherwise error
  if (users.length === 0) {
    throw new Error('No authenticated user');
  }
  return users[0];
};
