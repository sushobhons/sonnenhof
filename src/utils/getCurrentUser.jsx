export const getCurrentUser = () => {
  const resellerOrAdmin = JSON.parse(localStorage.getItem("vehicleTune_user"));
  const customerData = JSON.parse(localStorage.getItem("VehicleTunningCredential"));

  if (resellerOrAdmin) {
    return resellerOrAdmin;
  }

  if (customerData && customerData.user) {
    return customerData.user;
  }

  return null;
};
