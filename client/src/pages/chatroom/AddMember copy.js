import React, { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import httpClient from "../../httpClient";

const AddRoom = () => {
  const [members, setMembers] = useState([]);
  const [memberSelection, setMemberSelection] = useState(false);
  const [addedBy, setAddedBy] = useState("");
  const [user, setUser] = useState({});
  const [users, setUsers] = useState([]);
  const [selectedUsers, setSelectedUsers] = useState([]);

  const param = useParams();
  // console.log(memberSelection);

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
      let user_data = [];
      const resp = await httpClient.get(
        "//localhost:5000/contract/api/get_all_users"
      );
      // get already added member
      const users = resp.data.response;
      // console.log(users);
      const result = await httpClient.get(
        `//localhost:5000/contract/api/get_room_members/${param.id}`
      );

      const member_user_id = result.data.response.filter((x) => x.user_id);
      // console.log(member_user_id);

      if (member_user_id.length !== 0) {
        let user_array = [];
        for (let index = 0; index < member_user_id.length; index++) {
          const e = member_user_id[index];

          // console.log("e value= " + e.user_id);

          for (let index = 0; index < users.length; index++) {
            const u = users[index];

            // console.log("u value= " + u.id);

            if (e.user_id === u.id) {
              console.log(e.user_id);
              console.log(u.id);
              break;
              // let data = {
              //   user_id: u.id,
              //   email: u.email,
              // };
              // user_array.push(data);
            }
          }
        }
        // console.log(user_array);
        // setMembers(user_array);
      } else {
        let user_array = [];
        users.forEach((user) => {
          let data = {
            user_id: user.id,
            email: user.email,
          };
          user_array.push(data);
        });
        setMembers(user_array);
      }
    })();
    if (user) {
      setAddedBy(user.email);
    }
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    // console.log(selectedUsers);

    let data = [];

    for (let index = 0; index < selectedUsers.length; index++) {
      const element = selectedUsers[index];
      let newData = {
        user_id: element.user_id,
        room_id: param.id,
        added_by: user.id,
      };
      data.push(newData);
    }

    try {
      await httpClient.post("//localhost:5000/contract/api/addmembers", data);

      navigate("/roommembers/" + param.id);
    } catch (error) {
      if (error.response.status === 401) {
        alert("Record can't be inserted!");
      }
    }
  };

  return (
    <div className="mb-3 mt-3">
      <h3 className="mb-3">Add Room Members</h3>
      <table className="table table-striped w-75 border">
        {members && (
          <>
            {members.map((x, index) => {
              return (
                <>
                  <thead>
                    <tr key={index}>
                      <td>{x.user_id}</td>

                      <td>
                        <input
                          name="user"
                          value={memberSelection}
                          type="checkbox"
                          onChange={(e) => {
                            setMemberSelection(e.target.checked);
                            const data = {
                              user_id: x.user_id,
                              value: e.target.checked,
                            };
                            if (data.value === true) {
                              selectedUsers.push(data);
                            } else {
                              const filterdata = selectedUsers.filter(
                                (x) => x.user_id !== data.user_id
                              );
                              setSelectedUsers(filterdata);
                            }
                          }}
                        />
                      </td>
                    </tr>
                  </thead>
                </>
              );
            })}
          </>
        )}
      </table>
      <form>
        <button onClick={handleSubmit} className="btn btn-sm btn-success">
          Submit
        </button>
        <div className="col-sm-3">
          <Link to={"/roommembers/" + param.id}>Back to room members</Link>
        </div>
      </form>
    </div>
  );
};

export default AddRoom;
