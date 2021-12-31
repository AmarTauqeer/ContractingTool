import React from "react";
import logo from "../images/negotiation-1.jpg";

function Header() {
  return (
    <>
      <img src={logo} alt="" height={250} width="100%" />
      <h2 className="mb-3 mt-2">Welcome to collaboration tool</h2>
    </>
  );
}

export default Header;
