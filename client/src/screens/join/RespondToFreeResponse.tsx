import "../../styles/Title.css";
import "../../styles/Button.css";
import { useContext, useState } from "react";
import { Option } from "../../../../shared/utils/Option";
import { sendResponseAsParticipant } from "../../utils/actions";
import {
  FrontendContext,
  FrontendDispatchContext,
} from "../../context/FrontendDataModelContext";

type Props = {
  question: {
    id: string;
    type: "freeResponse";
    prompt: string;
    correctAnswers: Option<string[]>;
  };
};

export const RespondToFreeResponse = ({ question }: Props) => {
  const [responseText, setResponseText] = useState("");
  const dispatch = useContext(FrontendDispatchContext);
  const dataModel = useContext(FrontendContext);

  const submitResponse = () =>
    dataModel.type === "participant" &&
    sendResponseAsParticipant(
      dispatch,
      dataModel.sessionCode,
      dataModel.participant.secret,
      {
        questionType: "freeResponse",
        responseText,
        participantId: dataModel.participant.id,
        questionId: question.id,
      }
    );

  return (
    <>
      {question.type === "freeResponse" && (
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
          }}
        >
          <div style={{ paddingTop: "32px" }} />
          <div className="prompt-title">{question.prompt}</div>
          <div style={{ paddingTop: "48px" }} />
          <textarea
            value={responseText}
            onChange={(e) => setResponseText(e.target.value)}
            rows={5}
            cols={40}
            style={{
              fontSize: "18px",
              borderRadius: "10px",
            }}
          />
        </div>
      )}
      <div style={{ paddingTop: "32px" }} />
      <button className="small-button" onClick={submitResponse}>
        submit
      </button>
      <div style={{ paddingBottom: "32px" }} />
    </>
  );
};
