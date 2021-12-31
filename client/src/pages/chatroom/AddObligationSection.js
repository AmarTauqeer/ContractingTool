import React, { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import httpClient from "../../httpClient";
import "./section.css";

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
    <>
      <section className="section pt-5">
        <div className="container w-50">
          <div className="row g-0">
            <div className="text-center py-4">
              <h3>Obligation Section</h3>
              <form>
                <div className="form-row pt-5">
                  <div className="offset-1 col-lg-10">
                    <select
                      name="roomId"
                      className="section-form-select"
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
                <div className="form-row pt-3">
                  <div className="offset-1 col-lg-10">
                    <input
                      name="name"
                      type="text"
                      className="section-inp px-3"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                    />
                  </div>
                </div>
                {stateErrors.nameError && (
                  <>
                    <div class="form-row pt-2">
                      <div className="col-lg-10">
                        <span className="error">
                          {stateErrors.nameError && stateErrors.nameError}
                        </span>
                      </div>
                    </div>
                  </>
                )}
                <div className="form-row pt-5">
                  <div className="offset-1 col-lg-10">
                    <button className="section-btn" onClick={handleSubmit}>
                      Submit
                    </button>
                    <p>
                      <Link to={`/chat/${params.userid}/${params.roomid}`}>
                        Back to chat
                      </Link>
                    </p>
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

export default AddObligationSection;
