import React, { useState, useEffect } from "react";
import io from "socket.io-client";
import { Link, useNavigate, useParams } from "react-router-dom";
import httpClient from "../../httpClient";
import ReactScrollableFeed from "react-scrollable-feed";
import { Scrollbars } from "react-custom-scrollbars";

const socket = io("http://127.0.0.1:5000/");

const Chat = () => {
  const [member, setMember] = useState([]);
  const [message, setMessage] = useState("");
  const [email, setEmail] = useState("");
  const [roomName, setRoomName] = useState("");
  const [chat, setChat] = useState([]);
  const [section, setSection] = useState([]);
  const [sectionId, setSectionId] = useState("");

  const params = useParams();

  const getRoomMemberId = async (id) => {
    try {
      const res = await httpClient.get(
        `//localhost:5000/contract/api/get_room_members/${id}`
      );

      const result = res.data.response;
      const filtered = result.filter((x) => x.user_id === params.userid);
      // console.log(filtered);
      setMember(filtered);
    } catch (error) {
      console.log("No room is available");
    }
  };

  const getObligationSection = async () => {
    try {
      const res = await httpClient.get(
        `//localhost:5000/contract/api/get_obligation_section`
      );
      const result = res.data.response;
      setSectionId(res.data.response[0].id);
      setSection(result);
    } catch (error) {
      console.log("No section is available");
    }
  };

  const getChatMessages = async (id) => {
    try {
      const res = await httpClient.get(
        `//localhost:5000/contract/api/message/${id}`
      );
      // console.log(res.data.response);
      const result = res.data.response;
      setChat(result);
    } catch (error) {
      console.log("No message is available");
    }
  };

  // get room name
  const getRoom = async (id) => {
    try {
      const res = await httpClient.get(
        `//localhost:5000/contract/api/get_room_by_id/${id}`
      );
      // console.log(res.data.response);
      const result = res.data.response.room_name;
      setRoomName(result);
    } catch (error) {
      console.log("No room name is available");
    }
  };

  useEffect(() => {
    getRoomMemberId(params.roomid);
    getChatMessages(params.roomid);
    getRoom(params.roomid);
    getObligationSection();
  }, []);

  useEffect(() => {
    socket.on("Message", (payload) => {
      // console.log(payload);
      setChat([...chat, payload]);
    });

    socket.on("connect", function () {
      socket.emit("join_room", {
        user: params.userid,
        room: params.roomid,
      });
    });
  });

  const getUserEmail = async (id) => {
    try {
      const res = await httpClient.get(
        `//localhost:5000/contract/api/get_user_by_id/${id}`
      );

      const result = res.data.email;
      // console.log(result);
      return result;
    } catch (error) {
      console.log("No user is available");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const room_id = params.roomid;

    getRoomMemberId(room_id);

    if (member && message !== "") {
      const room_member_id = member[0].id;
      const created_date = Date();
      const created_at = created_date.substring(-1, 28);

      const email = await getUserEmail(params.userid);
      socket.emit("Message", {
        room_id,
        room_member_id,
        created_at,
        email,
        message,
        sectionId,
      });
      setMessage("");
    }
  };
  return (
    <div style={{ height: "350px" }} className="w-75 mb-3">
      {member.length !== 0 ? (
        <>
          <h3 className="mb-3">Chat {roomName && <span>{roomName}</span>} </h3>
          <div class="row col-sm-4">
            <label for="inputCreateBy" class="col-sm-4 col-form-label">
              Section
            </label>
            <div class="col-sm-8">
              <select
                name="sectionId"
                className="form-select"
                value={sectionId}
                onChange={(e) => {
                  setSectionId(e.currentTarget.value);
                }}
              >
                {section.map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <Link
            to={`/add-obligation-section/${params.userid}/${params.roomid}`}
          >
            Add new section
          </Link>

          <ReactScrollableFeed>
            <br />
            <table className="table table-striped">
              {chat && (
                <>
                  {chat.map((x, index) => {
                    return (
                      <>
                        <tr key={index}>
                          <td className="col-sm-2">
                            <b>{x.email} :</b>
                          </td>
                          <td className="col-sm-4">{x.message}</td>
                          <td className="col-sm-4"> {x.created_at}</td>
                        </tr>
                        <br />
                      </>
                    );
                  })}
                </>
              )}
            </table>
          </ReactScrollableFeed>

          <form>
            <div class="mb-3 row">
              <div class="col-sm-10">
                <input
                  name="message"
                  type="text"
                  placeholder="Enter your message"
                  value={message}
                  className="form-control"
                  onChange={(e) => setMessage(e.target.value)}
                />
              </div>

              <button
                onClick={handleSubmit}
                className="btn btn-success col-sm-1"
              >
                Submit
              </button>
              <p>
                <Link to={`/`}>Back to Room</Link>
              </p>
            </div>
          </form>
        </>
      ) : (
        <p>
          you are not invited: <Link to={`/`}>Back</Link>
        </p>
      )}
    </div>
  );
};

export default Chat;
