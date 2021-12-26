import { BrowserRouter, Routes, Route } from "react-router-dom";
import AddRoom from "./pages/chatroom/AddRoom";
import LandingPage from "./pages/LandingPage";
import Login from "./pages/authentication/Login";
import NotFound from "./pages/NotFound";
import Register from "./pages/authentication/Register";
import RoomMembers from "./pages/chatroom/RoomMembers";
import AddMember from "./pages/chatroom/AddMember";
import Chat from "./pages/chatroom/Chat";
import Header from "./pages/Header";
import Footer from "./pages/Footer";
const Router = () => {
  return (
    <BrowserRouter>
      <div className="container-md">
        <Header />
        <Routes>
          <Route exact path="/" element={<LandingPage />} />
          <Route exact path="/chat/:userid/:roomid" element={<Chat />} />
          <Route exact path="/notfound" element={<NotFound />} />
          <Route exact path="/login" element={<Login />} />
          <Route exact path="/register" element={<Register />} />
          <Route exact path="/addroom" element={<AddRoom />} />
          <Route exact path="/addmember/:id" element={<AddMember />} />
          <Route exact path="/roommembers/:id" element={<RoomMembers />} />
        </Routes>
        <Footer />
      </div>
    </BrowserRouter>
  );
};

export default Router;
