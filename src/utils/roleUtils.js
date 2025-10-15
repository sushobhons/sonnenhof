import { getDomainRole } from "./getDomainRole";

export const getEffectiveRole = (user) => {
  if (!user || !user.role) return null;
  return user.role.toLowerCase();
};

export const hasAccess = (userRole, requiredRole) => {
  return userRole === requiredRole;
};

export const getRedirectForRole = (role, currentPath) => {
  switch (role) {
    case "admin":
      console.log("routeUtil:Redirect to admin");
      return "/admin/dashboard";
    case "reseller":
      console.log("routeUtil:Redirect to reseller");
      if (currentPath === "/") {
        // Add more specific checks here
        return "/";
      }
      return "/admin/dashboard";
    case "customer":
      return "/";
    default:
      return "/";
  }
};

export const isDomainRoleValid = (userRole) => {
  const { role: domainRole } = getDomainRole();
  return userRole === domainRole;
};
