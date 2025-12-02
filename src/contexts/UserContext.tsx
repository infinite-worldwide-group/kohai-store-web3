import { UserSessionFragment } from "graphql/generated/graphql";
import { createContext, ReactNode, useContext, useState } from "react";

interface UserContextType {
  user: UserSessionFragment | null;
  setUser: (user: UserSessionFragment | null) => void;
  isAuthenticated: boolean;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserSessionFragment | null>(null);

  const value = {
    user,
    setUser,
    isAuthenticated: !!user,
  };

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
}

export function useUser() {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error("useUser must be used within a UserProvider");
  }
  return context;
}
