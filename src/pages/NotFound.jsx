// import React, { useEffect, useState } from "react";
// import NotFoundImg from "../../assets/images/new404Page.jpg";

// const NotFound = () => {
//   const [pageLoader, setPageLoader] = useState(false);

//   useEffect(() => {
//     const timer = setTimeout(() => {
//       setPageLoader(false);
//     }, 5000);

//     return () => clearTimeout(timer);
//   }, []);

//   return (
//     <>
//       {pageLoader ? (
//         <></>
//       ) : (
//         <div>
//           <img src={NotFoundImg} alt="404-page" />
//         </div>
//       )}
//     </>
//   );
// };

// export default NotFound;

import React, { useEffect, useState } from "react";

const NotFound = () => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setVisible(true), 100);
    return () => clearTimeout(timer);
  }, []);

  const containerStyle = {
    backgroundColor: "#ffffff",
    color: "#0f0f0f",
    height: "100vh",
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    textAlign: "center",
    padding: "2rem",
    transition: "opacity 1s ease, transform 1s ease",
    opacity: visible ? 1 : 0,
    transform: visible ? "translateY(0)" : "translateY(20px)",
  };

  const headingStyle = {
    fontSize: "5rem",
    marginBottom: "1rem",
    animation: "pulse 2s infinite",
  };

  const textStyle = {
    fontSize: "1.5rem",
    opacity: 0.7,
    fontFamily: "monospace",
    display: "inline-block",
    borderRight: "2px solid #fff",
    paddingRight: "0.5rem",
    animation: "blink 1s step-end infinite",
  };

  return (
    <>
      <style>
        {`
          @keyframes blink {
            0%, 100% { border-color: transparent; }
            50% { border-color: white; }
          }

          @keyframes pulse {
            0% { transform: scale(1); }
            50% { transform: scale(1.05); }
            100% { transform: scale(1); }
          }
        `}
      </style>

      <div style={containerStyle}>
        <h1 style={headingStyle}>404</h1>
        <p style={textStyle}>Page not found</p>
      </div>
    </>
  );
};

export default NotFound;
