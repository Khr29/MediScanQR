import React, { createContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

// ------------------------------------------------
// NOTE: Firebase Setup (Required for persistence in Canvas)
// ------------------------------------------------
// The following global variables are provided by the Canvas environment:
// __app_id, __firebase_config, __initial_auth_token

import { initializeApp } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-app.js";
import { 
    getAuth, 
    signInAnonymously, 
    signInWithCustomToken, 
    onAuthStateChanged,
    signOut
} from "https://www.gstatic.com/firebasejs/11.6.1/firebase-auth.js";
import { 
    getFirestore, 
    doc, 
    setDoc, 
    getDoc,
    // Add imports for collections and queries if needed later for non-auth data
} from "https://www.gstatic.com/firebasejs/11.6.1/firebase-firestore.js";
import { setLogLevel } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-firestore.js";

// Set Firestore log level for debugging
setLogLevel('debug');

const firebaseConfig = typeof __firebase_config !== 'undefined' 
    ? JSON.parse(__firebase_config) 
    : {};
const appId = typeof __app_id !== 'undefined' ? __app_id : 'default-app-id';

// Initialize Firebase instances
let app, db, auth;
try {
    app = initializeApp(firebaseConfig);
    db = getFirestore(app);
    auth = getAuth(app);
} catch (error) {
    console.error("Firebase initialization failed:", error);
}

// ------------------------------------------------

const AuthContext = createContext();

const AuthProvider = ({ children }) => {
    const navigate = useNavigate();
    const [user, setUser] = useState(null); // Firebase User Object
    const [role, setRole] = useState('guest'); // 'doctor', 'pharmacist', or 'guest'
    const [loading, setLoading] = useState(true);
    const [toast, setToast] = useState({ message: '', type: '' }); // Global Toast State

    // Helper to get the path to user's private profile document
    const getUserDocPath = (uid) => {
        // Path: /artifacts/{appId}/users/{userId}/user_profile/{docId}
        return doc(db, 'artifacts', appId, 'users', uid, 'user_profile', 'profile');
    };

    // ------------------------------------------------
    // 1. Initial Authentication and Profile Fetch
    // ------------------------------------------------
    useEffect(() => {
        const initializeAuth = async () => {
            try {
                // Sign in with Custom Token if available, otherwise sign in anonymously
                if (typeof __initial_auth_token !== 'undefined' && __initial_auth_token) {
                    await signInWithCustomToken(auth, __initial_auth_token);
                } else {
                    await signInAnonymously(auth);
                }
            } catch (e) {
                console.error("Authentication failed during init:", e);
                setToast({ message: "Auth initialization failed.", type: "error" });
            }
        };

        const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
            if (currentUser) {
                setUser(currentUser);
                await fetchUserProfile(currentUser.uid); // Fetch role
            } else {
                setUser(null);
                setRole('guest');
            }
            setLoading(false);
        });

        if (auth) {
            initializeAuth();
        } else {
            setLoading(false); 
        }

        return () => {
            if (unsubscribe) unsubscribe();
        };
    }, []); // Empty dependency array ensures this runs once
    
    // ------------------------------------------------
    // 2. Profile Fetch Logic
    // ------------------------------------------------
    const fetchUserProfile = async (uid) => {
        try {
            const docRef = getUserDocPath(uid);
            const docSnap = await getDoc(docRef);

            if (docSnap.exists()) {
                const profile = docSnap.data();
                setRole(profile.role || 'guest');
            } else {
                // Default role for new anonymous or token-based users without a profile
                setRole('guest');
            }
        } catch (error) {
            console.error("Error fetching user profile:", error);
            setRole('guest');
        }
    };
    
    // ------------------------------------------------
    // 3. Authentication Functions (Register, Login, Logout)
    // ------------------------------------------------
    
    // MOCK LOGIN/REGISTER logic: We simulate a successful backend token exchange
    // and store the user's role in Firestore.
    const mockAuthCall = async (endpoint, payload) => {
        const userId = auth.currentUser?.uid || crypto.randomUUID();
        
        // 1. Update/Set the user profile in Firestore with the requested role
        const userDocRef = getUserDocPath(userId);
        await setDoc(userDocRef, { 
            email: payload.email, 
            role: payload.role, 
            createdAt: new Date() 
        }, { merge: true });

        // 2. Update local state to reflect the new profile
        setRole(payload.role);
        
        // In a real app, this is where the backend would send back a JWT.
        return { success: true, user: { uid: userId, email: payload.email, role: payload.role } };
    };

    const register = async (email, password, role) => {
        setLoading(true);
        try {
            // Note: Password/Email are currently just placeholders for Firestore profile
            await mockAuthCall('register', { email, password, role }); 
            setToast({ message: `Registration successful! Signed in as ${role}.`, type: 'success' });
            navigate('/');
        } catch (error) {
            setToast({ message: error.message || "Registration failed.", type: 'error' });
        } finally {
            setLoading(false);
        }
    };

    const login = async (email, password) => {
        setLoading(true);
        try {
            // Mock role determination based on email for testing
            const mockRole = email.includes('doc') ? 'doctor' : email.includes('pharm') ? 'pharmacist' : 'guest';
            
            // Note: Password/Email are currently just placeholders for Firestore profile
            await mockAuthCall('login', { email, password, role: mockRole });
            
            setToast({ message: `Welcome back, ${mockRole}!`, type: 'success' });
            navigate('/');
        } catch (error) {
            setToast({ message: error.message || "Login failed. Check credentials.", type: 'error' });
        } finally {
            setLoading(false);
        }
    };

    const logout = async () => {
        if (auth) {
             await signOut(auth);
        }
        setRole('guest');
        setToast({ message: 'Logged out successfully.', type: 'success' });
        navigate('/login');
    };
    
    // ------------------------------------------------
    // 4. Exposing Context Value
    // ------------------------------------------------

    const value = {
        // User State
        user,
        role,
        loading,
        userId: user?.uid, // Convenient access to UID

        // Global Toast State
        toast,
        setToast,

        // Auth Functions
        register,
        login,
        logout,
        
        // Firebase Instances
        db, // Firestore instance
        appId, // Current application ID
        getUserDocPath, // Expose helper path for other pages if needed
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};

export { AuthContext, AuthProvider };