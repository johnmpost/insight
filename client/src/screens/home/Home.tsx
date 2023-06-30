import "../../styles/Background.css";
import "../../styles/Title.css";
import "../../styles/Button.css";
import { useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCircleQuestion } from "@fortawesome/free-regular-svg-icons";

function Home() {
  const navigate = useNavigate();

  function handleJoin() {
    navigate("/join");
  }

  function handleHost() {
    navigate("/host");
  }

  return (
    <div className="background">
      <div style={{ height: "90px" }}>
        <a
          href="https://github.com/johnmpost/insight/blob/main/user-guide.md"
          target="_blank"
          rel="noopener noreferrer"
          style={{ cursor: "default" }}
        >
          <FontAwesomeIcon
            icon={faCircleQuestion}
            style={{
              color: "#ffffff",
              fontSize: 45,
              marginLeft: "30px",
              marginTop: "30px",
              cursor: "pointer",
            }}
          />
        </a>
      </div>
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "flex-start",
        }}
      >
        <div style={{ paddingTop: "50px" }}></div>
        <div className="title">insight.</div>
        <div style={{ paddingTop: "100px" }}></div>
        <button className="large-button" onClick={handleJoin}>
          join a poll
        </button>
        <div style={{ paddingTop: "40px" }}></div>
        <button className="large-button" onClick={handleHost}>
          host a poll
        </button>
        <div style={{ paddingTop: "50px" }}></div>
      </div>
    </div>
  );
}

export default Home;
