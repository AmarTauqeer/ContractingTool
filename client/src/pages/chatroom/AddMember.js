import React, { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import httpClient from "../../httpClient";

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
    console.log(memberName);

    const isValid = validate();

    if (isValid) {
      let data = {
        user_id: memberName,
        room_id: param.id,
        added_by: user.id,
      };

      const resp = await httpClient.post(
        "//localhost:5000/contract/api/addmembers",
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
    <div>
      <h3>Room Member</h3>
      <div>{message && message}</div>
      <form>
        <div class="row col-sm-4">
          <label for="inputName" class="col-sm-4 col-form-label">
            Name
          </label>
          <div class="col-sm-8">
            <select
              name="memberName"
              className="form-select"
              onChange={(e) => setMemberName(e.target.value)}
            >
              {users.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.email}
                </option>
              ))}
            </select>
          </div>
        </div>
        {stateErrors.roomNameError && (
          <>
            <div class="row col-sm-4">
              <label for="inputName" class="col-sm-4 col-form-label"></label>
              <div class="col-sm-8">
                <span className="error">
                  {stateErrors.roomNameError && stateErrors.roomNameError}
                </span>
              </div>
            </div>
          </>
        )}

        <div class="row col-sm-4">
          <label for="inputCreateBy" class="col-sm-4 col-form-label">
            Created By
          </label>
          <div class="col-sm-8">
            <input
              name="createdBy"
              type="text"
              className="form-control form-control-sm"
              value={user && user.email}
              onChange={(e) => setCreatedBy(e.target.value)}
            />
          </div>
        </div>

        <div class="row col-sm-4">
          <label for="inputCreateBy" class="col-sm-4 col-form-label"></label>
          <div class="col-sm-8">
            <button className="btn btn-sm btn-success" onClick={handleSubmit}>
              Submit
            </button>
          </div>
          <p>
            <Link to={"/roommembers/" + param.id}>Back to room members</Link>
          </p>
        </div>
      </form>
    </div>
  );
};

export default AddMember;
