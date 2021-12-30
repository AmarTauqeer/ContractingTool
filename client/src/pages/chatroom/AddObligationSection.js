import React, { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import httpClient from "../../httpClient";

const AddObligationSection = () => {
  const [name, setName] = useState("");
  const [room, setRoom] = useState([]);
  const [roomId, setRoomId] = useState("");
  const [stateErrors, setStateErrors] = useState({
    nameError: "",
    roomError: "",
  });

  const navigate = useNavigate();
  const params = useParams();

  useEffect(() => {
    (async () => {
      try {
        const resp = await httpClient.get(
          "//localhost:5000/contract/api/get_rooms"
        );
        // initial value for select
        setRoomId(resp.data.response[0].id);

        setRoom(resp.data.response);
      } catch (error) {
        console.log("Not authenticated");
      }
    })();
  }, []);

  const validate = () => {
    let nameError = "";
    let roomError = "";

    if (name === "") {
      nameError = "Section name is required.";
    }
    if (roomId === "") {
      roomError = "Room name is required.";
    }

    if (nameError || roomError) {
      setStateErrors({
        nameError,
        roomError,
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
        room_id: roomId,
        name: name,
      };

      try {
        await httpClient.post(
          "//localhost:5000/contract/api/add_obligation_section",
          data
        );

        navigate(`/chat/${params.userid}/${params.roomid}`);
      } catch (error) {
        if (error.response.status === 401) {
          alert("Record can't be inserted!");
        }
      }
    }
  };
  return (
    <div>
      <h3>Obligation Section</h3>

      <form>
        <div class="row col-sm-4">
          <label for="inputCreateBy" class="col-sm-4 col-form-label">
            Room
          </label>
          <div class="col-sm-8">
            <select
              name="roomId"
              className="form-select"
              value={roomId}
              onChange={(e) => {
                setRoomId(e.currentTarget.value);
              }}
            >
              {room.map((u) => (
                <option key={u.room_id} value={u.room_id}>
                  {u.room_name}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div class="row col-sm-4">
          <label for="inputName" class="col-sm-4 col-form-label">
            Name
          </label>
          <div class="col-sm-8">
            <input
              name="name"
              type="text"
              className="form-control form-control-sm"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>
        </div>
        {stateErrors.nameError && (
          <>
            <div class="row col-sm-4">
              <label for="inputName" class="col-sm-4 col-form-label"></label>
              <div class="col-sm-8">
                <span className="error">
                  {stateErrors.nameError && stateErrors.nameError}
                </span>
              </div>
            </div>
          </>
        )}

        <div class="row col-sm-4">
          <label for="inputCreateBy" class="col-sm-4 col-form-label"></label>
          <div class="col-sm-8">
            <button className="btn btn-sm btn-success" onClick={handleSubmit}>
              Submit
            </button>
          </div>
          <p>
            <Link to={`/chat/${params.userid}/${params.roomid}`}>
              Back to chat
            </Link>
          </p>
        </div>
      </form>
    </div>
  );
};

export default AddObligationSection;
