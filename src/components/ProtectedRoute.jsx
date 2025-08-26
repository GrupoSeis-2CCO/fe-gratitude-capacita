
import { Navigate } from 'react-router-dom';

const ProtectedRoute = ({ children }) => {
  const isAuthenticated = localStorage.getItem('token');
  
  if (!isAuthenticated) {
    localStorage.setItem("showLoginAlert", "true");
    return <Navigate to="/login" replace />;
  }
  
  return children;
};

export default ProtectedRoute;