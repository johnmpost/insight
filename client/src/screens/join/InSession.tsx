import "../../styles/Title.css";
import { useContext } from "react";
import { FrontendContext } from "../../context/FrontendDataModelContext";
import { useRandomPhrase } from "./useRandomPhrase";
import { RespondToMultipleChoice } from "./RespondToMultipleChoice";
import { RespondToSelectMany } from "./RespondToSelectMany";
import { RespondToFreeResponse } from "./RespondToFreeResponse";
import { ShowCorrect } from "./ShowCorrect";

export const InSession = () => {
  const dataModel = useContext(FrontendContext);
  const waitingPhrase = useRandomPhrase();

  return dataModel.type === "participant" ? (
    <>
      {dataModel.participantState.type === "waitingForHost" && (
        <>
          <div style={{ paddingTop: "64px" }} />
          <div style={{ textAlign: "center" }} className="title">
            host is {waitingPhrase}...
          </div>
        </>
      )}
      {dataModel.participantState.type === "sessionEnded" && (
        <>
          <div style={{ paddingTop: "64px" }} />
          <div style={{ textAlign: "center" }} className="title">
            session ended.
          </div>
        </>
      )}
      {dataModel.participantState.type === "acceptingResponses" && (
        <>
          {dataModel.participantState.question.type === "multipleChoice" && (
            <RespondToMultipleChoice
              question={dataModel.participantState.question}
            />
          )}
          {dataModel.participantState.question.type === "freeResponse" && (
            <RespondToFreeResponse
              question={dataModel.participantState.question}
            />
          )}
          {dataModel.participantState.question.type === "selectMany" && (
            <RespondToSelectMany
              question={dataModel.participantState.question}
            />
          )}
        </>
      )}
      {dataModel.participantState.type === "showingCorrect" && (
        <ShowCorrect
          question={dataModel.participantState.question}
          latestResponse={dataModel.participantState.latestResponse}
        />
      )}
    </>
  ) : (
    <></>
  );
};
