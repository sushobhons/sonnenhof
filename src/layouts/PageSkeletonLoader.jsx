import React from "react";
// import Skeleton from "react-loading-skeleton";
// import "react-loading-skeleton/dist/skeleton.css";
import Skeleton from "@mui/material/Skeleton";

const PageSkeletonLoader = () => {
  return (
    <Skeleton
      sx={{ bgcolor: "grey.300" }}
      variant="rectangular"
      width={350}
      height={45}
    />
  );
};

export default PageSkeletonLoader;
