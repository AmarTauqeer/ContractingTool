import React, { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import httpClient from "../../httpClient";

const AddRoom = () => {
  const [memberName, setMemberName] = useState("");
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
        user_id: element.id,
        email: element.email,
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
        {users && (
          <>
            {users.map((x, index) => {
              return (
                <>
                  <thead>
                    <tr key={index}>
                      <td>{x.id}</td>
                      <td>{x.email}</td>
                      <td>
                        <input
                          name="user"
                          value={memberSelection}
                          type="checkbox"
                          onChange={(e) => {
                            setMemberSelection(e.target.checked);
                            const data = {
                              id: x.id,
                              email: x.email,
                              value: e.target.checked,
                            };
                            if (data.value === true) {
                              selectedUsers.push(data);
                            } else {
                              const filterdata = selectedUsers.filter(
                                (x) =>
                                  x.id !== data.id && x.email !== data.email
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
