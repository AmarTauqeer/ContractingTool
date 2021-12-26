import axios from "axios";
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import httpClient from "../../httpClient";
const Register = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [stateErrors, setStateErrors] = useState({
    emailError: "",
    passwordError: "",
  });
  const navigate = useNavigate();

  // validation
  const validate = () => {
    let emailError = "";
    let passwordError = "";

    if (email === "") {
      emailError = "Email is required.";
    }

    if (password === "") {
      passwordError = "Password is required.";
    }

    if (password && password.length < 4) {
      passwordError = "Password length should be greator or equal 4.";
    }

    if (!email.includes("@")) {
      emailError = "Invalid email";
    }

    if (emailError || passwordError) {
      setStateErrors({
        emailError,
        passwordError,
      });
      return false;
    }
    return true;
  };

  const handleLogin = () => {
    navigate("/login");
  };

  const handleSubmit = () => {
    const isValid = validate();

    if (isValid) {
      const resp = httpClient.post("//localhost:5000/contract/api/register", {
        email,
        password,
      });
      if (resp) {
        navigate("/login");
      }
    }
  };

  return (
    <div className="mb-3">
      <h3 className="mb-3">Register</h3>
      <form>
        <div className="row col-sm-4">
          <label className="col-sm-3 col-form-label">Email</label>
          <div className="col-sm-8">
            <input
              name="email"
              type="email"
              className="form-control form-control-sm"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
        </div>
        {stateErrors.emailError && (
          <>
            <div className="row col-sm-4">
              <label className="col-sm-3 col-form-label"></label>
              <div class="col-sm-8">
                <span className="error">
                  {stateErrors.emailError && stateErrors.emailError}
                </span>
              </div>
            </div>
          </>
        )}

        <div className="row col-sm-4">
          <label className="col-sm-3 col-form-label">Password</label>
          <div className="col-sm-8">
            <input
              name="password"
              type="password"
              className="form-control form-control-sm"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
        </div>

        {stateErrors.passwordError && (
          <>
            <div className="row col-sm-4">
              <label className="col-sm-3 col-form-label"></label>
              <div className="col-sm-8">
                <span className="error">
                  {stateErrors.passwordError && stateErrors.passwordError}
                </span>
              </div>
            </div>
          </>
        )}

        <div className="row col-sm-4">
          <label className="col-sm-3 col-form-label"></label>
          <div className="col-sm-8">
            <button onClick={handleSubmit} className="btn btn-sm btn-success">
              Submit
            </button>
            <button onClick={handleLogin} className="btn btn-sm btn-primary">
              Signin
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default Register;
