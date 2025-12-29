import "./App.css";
import { AuthProvider, useAuth } from "./authContext/UserContext";
import Layout from "./components/Layout";
import Home from "./pages/Home";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import RegisterForm from "./pages/RegisterForm";
import LoginForm from "./pages/LoginForm";
import Profile from "./pages/Profile";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import UserDetails from "./pages/UserDetails";
import Notifications from "./pages/Notifications";
import Messages from "./pages/Messages";
import Explore from "./pages/Explore";
import PostDetails from "./pages/PostDetails";

function App() {
  const { user } = useAuth();
  return (
    <>
      <ToastContainer 
        position="bottom-right"
        autoClose={2500}
        hideProgressBar={true}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover={false}
        theme="light"
        toastClassName="premium-toast"
        bodyClassName="premium-toast-body"
      />
      <BrowserRouter>
        <Layout>
          <Routes>
            <Route path="/" element={user ? <Home /> : <LoginForm />} />
            <Route path="/register" element={<RegisterForm />} />
            <Route path="/login" element={<LoginForm />} />
            <Route path="/profile/:id" element={<Profile />} />
            <Route path="/user/:id" element={<UserDetails />} />
            <Route path="/notifications" element={<Notifications />} />
            <Route path="/messages" element={<Messages />} />
            <Route path="/explore" element={<Explore />} />
            <Route path="/post/:id" element={<PostDetails />} />
          </Routes>
        </Layout>
      </BrowserRouter>
    </>
  );
}

export default App;
