import { createContext, useContext, useState } from "react";

const UserContext = createContext();

export function UserProvider({ children }) {
  const [user, setUser] = useState(null); 

  const signIn = (userData) => setUser(userData);
  const signOut = () => setUser(null);

  return (
    <UserContext.Provider value={{ user, signIn, signOut }}>
      {children}
    </UserContext.Provider>
  );
}

export const useUser = () => useContext(UserContext);