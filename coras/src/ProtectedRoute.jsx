import { Navigate, Outlet } from "react-router-dom";

const ProtectedRoute = ({ allowedRole }) => {
  let user = null;

  try {
    user = JSON.parse(localStorage.getItem("user"));
  } catch {
    user = null;
  }

  if (!localStorage.getItem("token") || !user) {
    return <Navigate to="/" replace />;
  }

  if (user.role !== allowedRole) {
    if (user.role === "admin") {
      return <Navigate to="/admin" replace />;
    }

    if (user.role === "user") {
      return <Navigate to="/Home" replace />;
    }

    return <Navigate to="/" replace />;
  }

  return <Outlet />;
};
export default ProtectedRoute;