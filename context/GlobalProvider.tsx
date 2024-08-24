import React, { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { View, Text, ScrollView, Dimensions, Alert, Image } from "react-native";

import { getCurrentUser } from "@/lib/appwrite";
import { Models } from "react-native-appwrite";

// Define the shape of your context's value
interface GlobalContextType {
    isLogged: boolean;
    setIsLogged: React.Dispatch<React.SetStateAction<boolean>>;
    user: Models.Document | null;
    setUser: React.Dispatch<React.SetStateAction<Models.Document | null>>;
    loading: boolean;
    globalDeerId: string;
    setGlobalDeerId: React.Dispatch<React.SetStateAction<string>>;
}

// Create a context with a default value
const GlobalContext = createContext<GlobalContextType | undefined>(undefined);

// Custom hook to use the GlobalContext
export const useGlobalContext = () => {
    const context = useContext(GlobalContext);
    if (!context) {
        throw new Error("useGlobalContext must be used within a GlobalProvider");
    }
    return context;
};

// Define the provider component
const GlobalProvider: React.FC<{ children: ReactNode }> = ({ children }) => {

    const [isLogged, setIsLogged] = useState(false);
    const [user, setUser] = useState<Models.Document | null>(null);
    const [loading, setLoading] = useState(true);
    const [globalDeerId, setGlobalDeerId] = useState("");

    useEffect(() => {
        getCurrentUser()
            .then((res) => {
                if (res) {
                    setIsLogged(true);
                    setUser(res);
                } else {
                    setIsLogged(false);
                    setUser(null);
                }
            })
            .catch((error) => {
                console.error(error);
            })
            .finally(() => {
                setLoading(false);
            });
    }, []);

    return (
        <GlobalContext.Provider
            value={{
                isLogged, setIsLogged,
                user, setUser,
                globalDeerId, setGlobalDeerId,
                loading
            }}
        >
            {children}
        </GlobalContext.Provider>
    );
};

export default GlobalProvider;
