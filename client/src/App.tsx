import { FrontendProvider } from "./components/FrontendProvider";
import Home from "./screens/home/Home";
import Join from "./screens/join/Join";
import Host from "./screens/host/Host";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Help from "./screens/help/Help";
import "./styles/Toast.css";

function App() {
  return (
    <>
      <ToastContainer
        toastStyle={{ fontFamily: "Ubuntu" }}
        theme="dark"
        position="bottom-left"
        autoClose={3000}
        pauseOnFocusLoss={false}
      />
      <FrontendProvider>
        <Router>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/join" element={<Join />} />
            <Route path="/host" element={<Host />} />
            <Route path="/help" element={<Help />} />
          </Routes>
        </Router>
      </FrontendProvider>
    </>
  );
}

export default App;
