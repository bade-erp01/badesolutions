'use client';

import { createContext, useContext, ReactNode } from 'react';

const UserContext = createContext({
  user: null,
});

export function UserProvider({ children, user }) {
  return (
    <UserContext.Provider value={{ user }}>
      {children}
    </UserContext.Provider>
  );
}

export const useUser = () => useContext(UserContext);