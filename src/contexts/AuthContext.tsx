import { createContext, useContext, useState, useEffect, ReactNode } from "react";

interface User {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  level: number;
  xp: number;
  xpToNextLevel: number;
  tier: "free" | "pro" | "elite";
  completedAssessment: boolean;
  capital: number;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (email: string) => void;
  logout: () => void;
  updateUser: (updates: Partial<User>) => void;
  completeAssessment: (level: number, capital: number) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const defaultUser: User = {
  id: "demo-user-1",
  email: "demo@stratix.io",
  name: "Demo Trader",
  level: 3,
  xp: 450,
  xpToNextLevel: 1000,
  tier: "free",
  completedAssessment: false,
  capital: 10000,
};

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(() => {
    // Initialize state from localStorage
    const savedUser = localStorage.getItem('demo_user');
    return savedUser ? JSON.parse(savedUser) : null;
  });

  // Persist user to localStorage whenever it changes
  useEffect(() => {
    if (user) {
      localStorage.setItem('demo_user', JSON.stringify(user));
    } else {
      localStorage.removeItem('demo_user');
    }
  }, [user]);

  const login = (email: string) => {
    // Mock login - in production this would hit an auth endpoint
    const newUser = {
      ...defaultUser,
      email,
      name: email.split("@")[0],
    };
    setUser(newUser);
  };

  const logout = () => {
    setUser(null);
  };

  const updateUser = (updates: Partial<User>) => {
    if (user) {
      setUser({ ...user, ...updates });
    }
  };

  const completeAssessment = (level: number, capital: number) => {
    if (user) {
      setUser({
        ...user,
        level,
        capital,
        completedAssessment: true,
        xp: 0,
        xpToNextLevel: 1000 * level,
      });
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        login,
        logout,
        updateUser,
        completeAssessment,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
