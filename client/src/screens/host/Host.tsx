import "../../styles/Background.css";
import "../../styles/Title.css";
import "../../styles/Button.css";
import { useContext, useState } from "react";
import { FrontendDispatchContext } from "../../context/FrontendDataModelContext";
import { createNewSessionAsHost } from "../../utils/actions";
import HostPanel from "./HostPanel";
import { TopBar } from "../../components/TopBar";

function Host() {
  const dispatch = useContext(FrontendDispatchContext);
  const [view, setView] = useState<"startSession" | "activeSession">(
    "startSession"
  );

  const handleStartSession = async () => {
    await createNewSessionAsHost(dispatch);
    setView("activeSession");
  };

  return view === "startSession" ? (
    <div className="background">
      <TopBar />
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "flex-start",
        }}
      >
        <div style={{ paddingTop: "50px" }}></div>
        <div className="title">host.</div>
        <div style={{ paddingTop: "100px" }}></div>
        <button className="large-button" onClick={handleStartSession}>
          start poll
        </button>
        <div style={{ paddingTop: "50px" }}></div>
      </div>
    </div>
  ) : (
    <HostPanel />
  );
}

export default Host;
