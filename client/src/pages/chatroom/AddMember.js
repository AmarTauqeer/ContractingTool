import React, { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import httpClient from "../../httpClient";
import "./addmember.css";

const AddMember = () => {
  const [memberName, setMemberName] = useState("");
  const [createdBy, setCreatedBy] = useState("");
  const [message, setMessage] = useState("");
  const [user, setUser] = useState({});
  const [users, setUsers] = useState([]);
  const [stateErrors, setStateErrors] = useState({
    memberNameError: "",
  });

  const param = useParams();

  useEffect(() => {
    (async () => {
      try {
        const resp = await httpClient.get(
          "//localhost:5000/contract/api/get_user"
        );
        setMemberName(resp.data.id);
        setUser(resp.data);
      } catch (error) {
        console.log("Not authenticated");
      }
    })();

    (async () => {
      try {
        const resp = await httpClient.get(
          "//localhost:5000/contract/api/get_all_users"
        );
        // console.log(resp.data.response);
        setUsers(resp.data.response);
      } catch (error) {
        console.log("Not authenticated");
      }
    })();
    if (user) {
      setCreatedBy(user.email);
    }
  }, []);

  const validate = () => {
    let memberNameError = "";

    if (memberName === "") {
      memberNameError = "Name is required.";
    }

    if (memberNameError) {
      setStateErrors({
        memberNameError,
      });
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const isValid = validate();

    if (isValid) {
      let data = {
        user_id: memberName,
        room_id: param.id,
        added_by: user.id,
      };

      const resp = await httpClient.post(
        "//localhost:5000/contract/api/add_members",
        data
      );
      if (resp.status === 200) {
        setMessage("Record inserted successfully");
      } else {
        setMessage("Record can't be inserted");
      }
      if (resp.status === 409) {
        setMessage("Member already exist");
      }
    }
  };
  return (
    <>
      <section className="member pt-5 w-50">
        <div className="container">
          <div className="py-4">
            <h3 className="text-center">Room Member</h3>
            <div>{message && message}</div>
            <form>
              <div className="row pt-5">
                <label class="col-lg-3 col-form-label fw-bold">
                  Member name:
                </label>
                <div className="col-lg-9">
                  <select
                    name="memberName"
                    className="form-select"
                    value={memberName}
                    onChange={(e) => {
                      setMemberName(e.currentTarget.value);
                    }}
                  >
                    {users.map((u) => (
                      <option key={u.id} value={u.id}>
                        {u.email}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              {stateErrors.memberNameError && (
                <>
                  <div className="row pt-2">
                    <label class="col-lg-3 col-form-label"></label>
                    <div class="col-lg-9">
                      <span className="error">
                        {stateErrors.memberNameError &&
                          stateErrors.memberNameError}
                      </span>
                    </div>
                  </div>
                </>
              )}
              <div className="row py-3">
                <label class="col-lg-3 col-form-label fw-bold">
                  Created by:
                </label>
                <div className="col-lg-9">
                  <input
                    name="createdBy"
                    placeholder="Created by"
                    type="text"
                    className="member-inp px-3"
                    value={user && user.email}
                    onChange={(e) => setCreatedBy(e.target.value)}
                  />
                </div>
              </div>
              <div className="row pt-2">
                <label class="col-lg-3 col-form-label"></label>
                <div class="col-lg-9">
                  <button className="member-btn" onClick={handleSubmit}>
                    Submit
                  </button>
                  <p>
                    <Link to={"/room-members/" + param.id}>
                      Back to room members
                    </Link>
                  </p>
                </div>
              </div>
            </form>
          </div>
        </div>
      </section>
      <div></div>
    </>
  );
};

export default AddMember;
