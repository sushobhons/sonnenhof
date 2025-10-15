// utils/checkDomainUser.js
import useAuth from "../auth/useAuth"; // your auth helpers
import { getDomainRole } from "./getDomainRole";

export const validateDomainUser = () => {
  const { user, logout } = useAuth();
  const { role: domainRole, username } = getDomainRole();
  const rootDomain = import.meta.env.VITE_ROOT_DOMAIN;
  const protocol = "https";

  if (!user) return; // guest

  // If localStorage user role doesn't match current domain role
  if (user.role !== domainRole) {
    console.log(user.role);
    logout(); // clear localStorage, cookies, tokens
    switch (domainRole) {
      case "admin":
        window.location.href = `${protocol}//${rootDomain}`;
        break;
      case "reseller":
        window.location.href = `${protocol}//${username}.${rootDomain}/admin`;
        break;
      case "customer":
        window.location.href = `${protocol}//${username}.${rootDomain}`;
        break;

      default:
        window.location.href = `${protocol}//${rootDomain}`;
    }
  }
};
