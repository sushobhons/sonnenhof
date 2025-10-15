// utils/getDomainRole.js
export const getDomainRole = () => {
  const rootDomain = import.meta.env.VITE_ROOT_DOMAIN;
  const hostname = window.location.hostname; // e.g. john.file-service-portal.com
  const pathname = window.location.pathname; // e.g. /admin

  let role = null;
  let username = null;

  // Admin → root domain only
  if (hostname === rootDomain || hostname === `www.${rootDomain}`) {
    role = "admin";
  }
  // Subdomain → reseller / customer
  else if (hostname.endsWith(`.${rootDomain}`)) {
    const parts = hostname.split(".");
    username = parts[0];
    role = pathname.startsWith("/admin") ? "reseller" : "customer";
  }

  return { role, username };
};
