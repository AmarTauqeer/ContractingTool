import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import httpClient from "../../httpClient";
import "./rooms.css";

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
        await httpClient.post("//localhost:5000/contract/api/add_room", data);

        navigate("/");
      } catch (error) {
        if (error.response.status === 401) {
          alert("Record can't be inserted!");
        }
      }
    }
  };
  return (
    <>
      <section className="room pt-5">
        <div className="container w-50">
          <div className="row g-0 ">
            <div className="text-center py-4">
              <h3>Add New Room</h3>
              <form>
                <div className="form-row pt-5">
                  <div class="offset-1 col-lg-10">
                    <input
                      name="roomName"
                      placeholder="Room name"
                      type="text"
                      className="room-inp px-3"
                      value={roomName}
                      onChange={(e) => setRoomName(e.target.value)}
                    />
                  </div>
                </div>
                {stateErrors.roomNameError && (
                  <>
                    <div className="form-row pt-2">
                      <div class="col-lg-10">
                        <span className="error">
                          {stateErrors.roomNameError &&
                            stateErrors.roomNameError}
                        </span>
                      </div>
                    </div>
                  </>
                )}
                <div className="form-row py-3">
                  <div class="offset-1 col-lg-10">
                    <input
                      name="createdBy"
                      placeholder="Created by"
                      type="text"
                      className="room-inp px-3"
                      value={user && user.email}
                      onChange={(e) => setCreatedBy(e.target.value)}
                    />
                  </div>
                </div>
                <div className="form-row pt-5">
                  <div class="col-lg-12">
                    <button className="room-btn1" onClick={handleSubmit}>
                      Submit
                    </button>
                    <br />
                    <Link to={`/`}>Back to Room List</Link>
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

export default AddRoom;
