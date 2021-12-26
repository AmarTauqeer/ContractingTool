import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import httpClient from "../httpClient";

const LandingPage = () => {
  const [user, setUser] = useState({});
  const [room, setRoom] = useState([]);
  const [roomMember, setRoomMember] = useState([]);

  const logoutUser = async () => {
    await httpClient.get("//localhost:5000/contract/api/logout");
    window.location.href = "/";
  };

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
        const res = await httpClient.get(
          "//localhost:5000/contract/api/get_rooms"
        );
        // console.log(res.data.response);
        setRoom(res.data.response);
      } catch (error) {
        console.log("No room is available");
      }
    })();
  }, []);

  const deleteRoom = async (id) => {
    if (id) {
      try {
        const resp = await httpClient.get(
          `//localhost:5000/contract/api/delete_room/${id}`
        );
        window.location.reload(false);
      } catch (error) {
        console.log("No room available");
      }
    }
  };
  return (
    <div className="mt-2 mb-3">
      {user && (
        <>
          {Object.keys(user).length !== 0 ? (
            <>
              <h4 className="mb-3">Logged in</h4>
              <div className="row">
                <div className="col-sm-2">
                  <b>ID:</b>{" "}
                </div>
                <div className="col-sm-4">{user.id}</div>
              </div>

              <div className="row">
                <div className="col-sm-2">
                  <b>Email:</b>
                </div>
                <div className="col-sm-4">{user.email}</div>
              </div>

              <h5 className="mb-3"> </h5>
              <Link to="/addroom">Add Room</Link>
              <br />
              {room.length == 0 && <p>No room is available</p>}
              <table className="table table-striped w-75 border">
                <thead class="table-dark">
                  <tr>
                    <th scope="col">ID</th>
                    <th scope="col">Name</th>
                    <th scope="col">Members</th>
                    <th scope="col">Chat</th>
                    <th scope="col">Actions</th>
                  </tr>
                </thead>
                {room && roomMember && (
                  <>
                    {room.map((x, index) => {
                      return (
                        <>
                          <tr key={index}>
                            <td>{x.id}</td>
                            <td>{x.room_name}</td>
                            <td>
                              <Link to={`/roommembers/${x.id}`}>
                                Member Detail
                              </Link>
                            </td>
                            <td>
                              <Link to={`/chat/${user.id}/${x.id}`}>Chat</Link>
                            </td>
                            <td>
                              <button
                                onClick={(e) => deleteRoom(x.id)}
                                // className="btn btn-sm btn-danger"
                              >
                                X
                              </button>
                            </td>
                          </tr>
                        </>
                      );
                    })}
                  </>
                )}
              </table>

              <br />
              <button onClick={logoutUser} className="btn btn-danger">
                Logout
              </button>
            </>
          ) : (
            <>
              <p>You are not logged in</p>
              <button className="btn btn-primary">
                <Link to="/login">Login</Link>
              </button>
              <button className="btn btn-primary">
                <Link to="/register">Register</Link>
              </button>
            </>
          )}
        </>
      )}
    </div>
  );
};

export default LandingPage;
