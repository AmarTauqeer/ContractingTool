import React, { useState, useEffect } from "react";
import { Link, useParams } from "react-router-dom";
import httpClient from "../../httpClient";
const Room = () => {
  const [roomMember, setRoomMember] = useState([]);
  const [users, setUsers] = useState([]);

  const param = useParams();

  const getAllUsers = async () => {
    try {
      const resp = await httpClient.get(
        `//localhost:5000/contract/api/get_all_users`
      );
      setUsers(resp.data.response);
    } catch (error) {
      console.log("No user available");
    }
  };
  useEffect(() => {
    (async () => {
      try {
        const resp = await httpClient.get(
          `//localhost:5000/contract/api/get_room_members/${param.id}`
        );
        // console.log(resp.data.response);
        setRoomMember(resp.data.response);
      } catch (error) {
        console.log("No room member available");
      }
    })();
    getAllUsers();
  }, []);

  const deleteMember = async (memberid) => {
    if (memberid) {
      try {
        const resp = await httpClient.get(
          `//localhost:5000/contract/api/delete_room_member/${memberid}`
        );
        // console.log(resp.data["Error"]);
        if (resp.data["Error"]) {
          alert(resp.data["Error"]);
          return false;
        }
        window.location.reload(false);
      } catch (error) {
        console.log("No room member available");
      }
    }
  };

  return (
    <div className="mb-3 mt-3">
      <h3>List of Room Members</h3> <br />
      <table className="table table-striped w-75 border">
        <thead class="table-dark">
          <tr>
            <th scope="column">Member ID</th>
            <th scope="column">User ID</th>
            <th scope="column">Email</th>
            <th scope="column">Actions</th>
          </tr>
        </thead>
        {roomMember.length === 0 && <p>No member is available</p>}
        {roomMember && (
          <>
            {roomMember.map((x, index) => {
              return (
                <>
                  <tr key={x.id}>
                    <td>{x.id}</td>
                    <td>{x.user_id}</td>
                    <td>
                      {users &&
                        users
                          .filter((item) => item.id === x.user_id)
                          .map((filteredName) => (
                            <div key={filteredName.id}>
                              {filteredName.email}
                            </div>
                          ))}
                    </td>
                    <td>
                      <button onClick={(e) => deleteMember(x.id)}>X</button>
                    </td>
                  </tr>
                </>
              );
            })}
          </>
        )}
      </table>
      <div className="row">
        <div className="col-sm-2">
          <Link to={`/add-member/${param.id}`}>Add Member</Link>
        </div>
        <div className="col-sm-3">
          <Link to={`/`}>Back to Room</Link>
        </div>
      </div>
    </div>
  );
};

export default Room;
