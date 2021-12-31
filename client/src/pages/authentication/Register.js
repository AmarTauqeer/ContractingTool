import axios from "axios";
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import httpClient from "../../httpClient";
import register from "../../images/registeration.png";
import "./login.css";
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
    <>
      <section className="login py-5">
        <div className="container w-75">
          <div className="row g-0">
            <div className="col-lg-5  border-end border-dark">
              <img
                src={register}
                alt="register-img"
                style={{
                  width: "320px",
                  paddingLeft: "60px",
                  paddingTop: "60px",
                }}
              />
            </div>
            <div className="col-lg-7 text-center py-4">
              <h3>Registration</h3>
              <form>
                <div className="form-row py-3 pt-5">
                  <div class="col-lg-12">
                    <input
                      name="email"
                      placeholder="Email"
                      type="email"
                      className="inp px-3"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                    />
                  </div>
                </div>
                {stateErrors.emailError && (
                  <>
                    <div className="form-row pay-3">
                      <div class="col-lg-12">
                        <span className="error">
                          {stateErrors.emailError && stateErrors.emailError}
                        </span>
                      </div>
                    </div>
                  </>
                )}

                <div className="form-row py-3">
                  <div class=" col-lg-12">
                    <input
                      name="password"
                      placeholder="Password"
                      type="password"
                      className="inp px-3"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                    />
                  </div>
                </div>
                {stateErrors.passwordError && (
                  <>
                    <div className="form-row pay-3 pt-5">
                      <div class="col-lg-12">
                        <span className="error">
                          {stateErrors.passwordError &&
                            stateErrors.passwordError}
                        </span>
                      </div>
                    </div>
                  </>
                )}

                <div className="form-row py-3 pt-5">
                  <div class=" col-lg-12">
                    <button onClick={handleLogin} className="btn1">
                      Login
                    </button>
                    <button onClick={handleSubmit} className="btn1">
                      Register
                    </button>
                  </div>
                </div>
              </form>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default Register;
