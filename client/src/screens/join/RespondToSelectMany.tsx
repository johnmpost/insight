import "../../styles/Title.css";
import "../../styles/Button.css";
import { useContext, useState } from "react";
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
    type: "selectMany";
    prompt: string;
    options: AnswerChoice[];
  };
};

export const RespondToSelectMany = ({ question }: Props) => {
  const [selectedAnswerIndexes, setSelectedAnswerIndexes] = useState<number[]>(
    []
  );
  const dispatch = useContext(FrontendDispatchContext);
  const dataModel = useContext(FrontendContext);

  const submitResponse = () =>
    selectedAnswerIndexes !== null &&
    dataModel.type === "participant" &&
    sendResponseAsParticipant(
      dispatch,
      dataModel.sessionCode,
      dataModel.participant.secret,
      {
        questionType: "selectMany",
        selectedResponses: selectedAnswerIndexes.map(
          (index) => question.options[index].text
        ),
        participantId: dataModel.participant.id,
        questionId: question.id,
      }
    );

  const toggleOption = (index: number) => {
    if (selectedAnswerIndexes.includes(index)) {
      setSelectedAnswerIndexes(
        selectedAnswerIndexes.filter((i) => i !== index)
      );
    } else {
      setSelectedAnswerIndexes([...selectedAnswerIndexes, index]);
    }
  };

  return (
    <>
      {question.type === "selectMany" && (
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
                onClick={() => toggleOption(index)}
                selected={selectedAnswerIndexes.includes(index)}
                type={"checkbox"}
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
