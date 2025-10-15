import { useContext } from "react";
import { AuthContext } from "../context/AuthContext";

// Simple hook to consume the AuthContext easily
export const useAuth = () => useContext(AuthContext);

// Use this hook in any component like: const { user, logout } = useAuth();
