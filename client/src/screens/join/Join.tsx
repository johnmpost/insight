import "../../styles/Background.css";
import "../../styles/Title.css";
import "../../styles/Button.css";
import "../../styles/Input.css";
import { useContext, useEffect, useState } from "react";
import { joinSessionAsParticipant } from "../../utils/actions";
import {
  FrontendContext,
  FrontendDispatchContext,
} from "../../context/FrontendDataModelContext";
import { checkActiveQuestion, checkSessionExists } from "../../utils/endpoints";
import { getId } from "../../services/socket";
import { TopBar } from "../../components/TopBar";
import { InSession } from "./InSession";
import { toast } from "react-toastify";

const Join = () => {
  const dispatch = useContext(FrontendDispatchContext);
  const dataModel = useContext(FrontendContext);
  const [screen, setScreen] = useState<"enterCode" | "enterName" | "inSession">(
    "enterCode"
  );
  const [sessionCodeInput, setSessionCodeInput] = useState("");
  const [nameInput, setNameInput] = useState("");

  // upon joining a session, checks for any currently active question
  useEffect(() => {
    if (dataModel.type === "participant") {
      checkActiveQuestion(dataModel.sessionCode, getId());
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dataModel.type]);

  const handleNext = async () => {
    if (screen === "enterCode") {
      const sessionExists = await checkSessionExists(sessionCodeInput);
      if (sessionExists) {
        setScreen("enterName");
      } else {
        toast.error("Session does not exist");
      }
    } else if (screen === "enterName") {
      await joinSessionAsParticipant(dispatch, sessionCodeInput, nameInput);
      setScreen("inSession");
    }
  };

  return (
    <div className="background">
      <TopBar
        sessionCode={
          dataModel.type === "participant" ? dataModel.sessionCode : undefined
        }
        secondsLeft={
          dataModel.type === "participant" &&
          dataModel.participantState.type === "acceptingResponses"
            ? dataModel.participantState.timeRemaining ?? undefined
            : undefined
        }
      />
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "flex-start",
        }}
      >
        {screen === "enterCode" && (
          <>
            <div style={{ paddingTop: "50px" }}></div>
            <div className="title">join.</div>
            <div style={{ paddingTop: "100px" }}></div>
            <input
              className="big-text-input"
              type="text"
              value={sessionCodeInput}
              onChange={(e) =>
                setSessionCodeInput(e.target.value.toUpperCase())
              }
              placeholder="session code"
              maxLength={6}
            />
            <div style={{ paddingTop: "40px" }}></div>
            <button className="large-button" onClick={handleNext}>
              next
            </button>
            <div style={{ paddingTop: "50px" }}></div>
          </>
        )}
        {screen === "enterName" && (
          <>
            <div style={{ paddingTop: "50px" }}></div>
            <div className="title">join.</div>
            <div style={{ paddingTop: "100px" }}></div>
            <input
              className="big-text-input"
              type="text"
              value={nameInput}
              onChange={(e) => setNameInput(e.target.value)}
              placeholder="name"
            />
            <div style={{ paddingTop: "40px" }}></div>
            <button className="large-button" onClick={handleNext}>
              enter poll
            </button>
          </>
        )}
        {screen === "inSession" && dataModel.type === "participant" && (
          <InSession />
        )}
      </div>
    </div>
  );
};

export default Join;
