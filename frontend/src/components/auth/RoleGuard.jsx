import { Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const RoleGuard = ({ children, allowedRoles = [] }) => {
  const { user } = useAuth();

  console.log("RoleGuard");
  console.log(user);

  if (!user) return <Navigate to="/login" replace />;

  console.log("User role:", user.role);

  if (!allowedRoles.includes(user.role)) {
    console.log("Wrong role");
    return <Navigate to="/login" replace />;
  }

  console.log("Role OK");

  return children;
};

export default RoleGuard;