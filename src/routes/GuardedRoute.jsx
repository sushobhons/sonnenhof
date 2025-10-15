import React from "react";
import { Navigate } from "react-router-dom";
import { getCurrentUser } from "../utils/getCurrentUser";
import {
  getEffectiveRole,
  hasAccess,
  getRedirectForRole,
  isDomainRoleValid,
} from "../utils/roleUtils";

/**
 * Universal route guard for Admin / Reseller / Customer.
 *
 * Props:
 * - element: React component
 * - requiredRoles: roles allowed (["admin"], ["reseller"], ["customer"], or [])
 * - allowGuests: true = guests can access (like public landing)
 * - publicOnly: true = redirect logged-in users away (like login)
 */
const GuardedRoute = ({
  element,
  requiredRoles = [],
  allowGuests = false,
  publicOnly = false,
}) => {
  const user = getCurrentUser();
  const roleKey = getEffectiveRole(user);

  // Case 1: Public-only route (login, forgot-password, etc.)
  if (publicOnly) {
    if (roleKey && isDomainRoleValid(roleKey)) {
      return <Navigate to={getRedirectForRole(roleKey)} />;
    }
    return element;
  }

  // Case 2: Guest user
  if (!roleKey) {
    return allowGuests ? element : <Navigate to="/" />;
  }

  // Case 3: Logged in
  const hasRequiredRole =
    requiredRoles.length === 0 ||
    requiredRoles.some((role) => hasAccess(roleKey, role));
  // if (hasRequiredRole && isDomainRoleValid(roleKey)) {
  //   return element;
  // }
  if (hasRequiredRole) {
    return element;
  }
  return <Navigate to={getRedirectForRole(roleKey)} />;
};

export default GuardedRoute;
