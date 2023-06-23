import "../../styles/Title.css";
import "../../styles/Button.css";
import { useContext, useState } from "react";
import { Option } from "../../../../shared/utils/Option";
import { sendResponseAsParticipant } from "../../utils/actions";
import {
  FrontendContext,
  FrontendDispatchContext,
} from "../../context/FrontendDataModelContext";
import { AnswerOption } from "./AnswerOption";
import { AnswerChoice } from "../../../../shared/domain/AnswerChoice";

type Props = {
  question: {
    id: string;
    type: "multipleChoice";
    prompt: string;
    options: AnswerChoice[];
  };
};

export const RespondToMultipleChoice = ({ question }: Props) => {
  const [selectedAnswerIndex, setSelectedAnswerIndex] =
    useState<Option<number>>(null);
  const dispatch = useContext(FrontendDispatchContext);
  const dataModel = useContext(FrontendContext);

  const submitResponse = () =>
    selectedAnswerIndex !== null &&
    dataModel.type === "participant" &&
    sendResponseAsParticipant(
      dispatch,
      dataModel.sessionCode,
      dataModel.participant.secret,
      {
        questionType: "multipleChoice",
        selectedResponse: question.options[selectedAnswerIndex].text,
        participantId: dataModel.participant.id,
        questionId: question.id,
      }
    );

  return (
    <>
      {question.type === "multipleChoice" && (
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
          <div>
            {question.options.map((option, index) => (
              <AnswerOption
                key={index}
                index={index}
                onClick={() => setSelectedAnswerIndex(index)}
                selected={index === selectedAnswerIndex}
                type={"radio"}
                text={option.text}
              />
            ))}
          </div>
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
