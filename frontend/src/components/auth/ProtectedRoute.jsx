import { Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const ProtectedRoute = ({ children }) => {
  const { loading, isAuthenticated } = useAuth();

  console.log("ProtectedRoute");
  console.log("loading:", loading);
  console.log("authenticated:", isAuthenticated);

  if (loading) {
    console.log("Loading...");
    return <div>Loading...</div>;
  }

  if (!isAuthenticated) {
    console.log("Redirecting to login");
    return <Navigate to="/login" replace />;
  }

  console.log("Rendering children");
  return children;
};

export default ProtectedRoute;