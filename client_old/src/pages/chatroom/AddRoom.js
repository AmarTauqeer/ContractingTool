import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import httpClient from "../../httpClient";

const AddRoom = () => {
  const [roomName, setRoomName] = useState("");
  const [createdBy, setCreatedBy] = useState("");
  const [user, setUser] = useState({});
  const [users, setUsers] = useState([]);
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [memberSelection, setMemberSelection] = useState(false);
  const [stateErrors, setStateErrors] = useState({
    roomNameError: "",
  });

  const navigate = useNavigate();

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
    let roomNameError = "";

    if (roomName === "") {
      roomNameError = "Room name is required.";
    }

    if (roomNameError) {
      setStateErrors({
        roomNameError,
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
        room_name: roomName,
        created_by: user.id,
      };

      try {
        await httpClient.post("//localhost:5000/contract/api/addroom", data);

        navigate("/");
      } catch (error) {
        if (error.response.status === 401) {
          alert("Record can't be inserted!");
        }
      }
    }
  };
  return (
    <div>
      <h3>Room Information</h3>

      <form>
        <div class="row col-sm-4">
          <label for="inputName" class="col-sm-4 col-form-label">
            Room Name
          </label>
          <div class="col-sm-8">
            <input
              name="roomName"
              type="text"
              className="form-control form-control-sm"
              value={roomName}
              onChange={(e) => setRoomName(e.target.value)}
            />
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
            <Link to={`/`}>Back to Room</Link>
          </p>
        </div>
      </form>
    </div>
  );
};

export default AddRoom;
