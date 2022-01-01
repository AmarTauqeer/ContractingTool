import React, { useState, useEffect } from "react";
import io from "socket.io-client";
import { Link, useNavigate, useParams } from "react-router-dom";
import httpClient from "../../httpClient";
import ReactScrollableFeed from "react-scrollable-feed";
import { Scrollbars } from "react-custom-scrollbars";
import "./chat.css";
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
    <>
      <section className="section py-5 pt-5 w-75">
        <div className="container">
          <div className="text-center py-4">
            <h3>Chat {roomName && <span>{roomName}</span>}</h3>
          </div>
          <form>
            <div className="row">
              <div className="py-2">
                <Link
                  to={`/add-obligation-section/${params.userid}/${params.roomid}`}
                >
                  Add new section
                </Link>
              </div>
              <div className="col-lg-8">
                <label style={{ marginRight: "20px", fontWeight: "bold" }}>
                  Section
                </label>
                <select
                  name="sectionId"
                  className="chat-form-select"
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
            <div className="w-75 pt-5" style={{ height: "350px" }}>
              <ReactScrollableFeed>
                <br />
                <table className="table table-striped">
                  {chat && (
                    <>
                      {chat.map((x, index) => {
                        return (
                          <>
                            <tr key={index}>
                              <td className="col-lg-4">
                                <b>{x.email} :</b>
                              </td>
                              <td className="col-lg-4">{x.message}</td>
                              <td className="col-lg-4"> {x.created_at}</td>
                            </tr>
                            <br />
                          </>
                        );
                      })}
                    </>
                  )}
                </table>
              </ReactScrollableFeed>
            </div>
            <br />
            <div className="row pt-5">
              <div className="col-lg-9">
                <input
                  name="message"
                  type="text"
                  placeholder="Enter your message"
                  value={message}
                  className="chat-inp"
                  onChange={(e) => setMessage(e.target.value)}
                />
                <button onClick={handleSubmit} className="chat-btn">
                  Submit
                </button>
                <br />
                <p className="py-2 pt-2">
                  <Link to={`/`}>Back to Room</Link>
                </p>
              </div>
            </div>
          </form>
        </div>
      </section>
    </>
  );
};

export default Chat;
