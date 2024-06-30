"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { connectToDB } from "@/lib/dbConnect";

type DBConnectionContextType = {
  isConnected: boolean;
  error: string | null;
};

const DBConnectionContext = createContext<DBConnectionContextType>({
  isConnected: false,
  error: null,
});

export const DBConnectionProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const checkConnection = async () => {
      try {
        await connectToDB();
        setIsConnected(true);
        setError(null);
      } catch (err) {
        setIsConnected(false);
        setError("Failed to connect to database");
      }
    };

    checkConnection();
    const interval = setInterval(checkConnection, 30000); // Check every 30 seconds
    return () => clearInterval(interval);
  }, []);

  return (
    <DBConnectionContext.Provider value={{ isConnected, error }}>
      {children}
    </DBConnectionContext.Provider>
  );
};

export const useDBConnection = () => useContext(DBConnectionContext);
