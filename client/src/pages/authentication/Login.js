import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import httpClient from "../../httpClient";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [stateErrors, setStateErrors] = useState({
    emailError: "",
    passwordError: "",
  });
  const navigate = useNavigate();

  const handleRegister = () => {
    navigate("/register");
  };

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

  const handleSubmit = async (e) => {
    e.preventDefault();

    const isValid = validate();

    if (isValid) {
      setStateErrors({ emailError: "", passwordError: "" });

      try {
        await httpClient.post("//localhost:5000/contract/api/login", {
          email,
          password,
        });

        navigate("/");
      } catch (error) {
        if (error.response.status === 401) {
          alert("Invalid credentials");
        }
      }

      //clear form
      setEmail("");
      setPassword("");
    }
  };

  return (
    <div className="container-md">
      <h3 className="mb-3">Login</h3>
      <form>
        <div class="row col-sm-4">
          <label for="inputEmail" class="col-sm-3 col-form-label">
            Email
          </label>
          <div class="col-sm-8">
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
            <div class="row col-sm-4">
              <label for="inputEmail" class="col-sm-3 col-form-label"></label>
              <div class="col-sm-8">
                <span className="error">
                  {stateErrors.emailError && stateErrors.emailError}
                </span>
              </div>
            </div>
          </>
        )}

        <div class="row col-sm-4">
          <label for="inputPassword" class="col-sm-3 col-form-label">
            Password
          </label>
          <div class="col-sm-8">
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
            <div class="row col-sm-4">
              <label
                for="inputPassword"
                class="col-sm-3 col-form-label"
              ></label>
              <div class="col-sm-8">
                <span className="error">
                  {stateErrors.passwordError && stateErrors.passwordError}
                </span>
              </div>
            </div>
          </>
        )}

        <div class="row col-sm-4">
          <label for="inputEmail" class="col-sm-3 col-form-label"></label>
          <div class="col-sm-8">
            <button onClick={handleSubmit} className="btn btn-sm btn-success">
              Login
            </button>
            <button onClick={handleRegister} className="btn btn-sm btn-success">
              Register
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default Login;
