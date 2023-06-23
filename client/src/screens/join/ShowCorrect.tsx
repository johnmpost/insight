import "../../styles/Title.css";
import "../../styles/Button.css";
import { useContext } from "react";
import { Option } from "../../../../shared/utils/Option";
import { FrontendDispatchContext } from "../../context/FrontendDataModelContext";
import { Question } from "../../../../shared/domain/Question";
import { QuestionResponseForParticipant } from "../../../../shared/dtos/QuestionResponseForParticipant";
import { AnswerOption } from "./AnswerOption";

type Props = {
  question: Question;
  latestResponse: Option<QuestionResponseForParticipant>;
};

export const ShowCorrect = ({ question, latestResponse }: Props) => {
  const dispatch = useContext(FrontendDispatchContext);

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
                onClick={() => undefined}
                selected={
                  latestResponse?.questionType === "multipleChoice" &&
                  option.text === latestResponse.selectedResponse
                }
                type={"radio"}
                text={option.text}
                isCorrect={option.isCorrect ?? undefined}
              />
            ))}
          </div>
        </div>
      )}
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
                onClick={() => undefined}
                selected={
                  latestResponse?.questionType === "selectMany" &&
                  latestResponse.selectedResponses.includes(option.text)
                }
                type={"checkbox"}
                text={option.text}
                isCorrect={option.isCorrect ?? undefined}
              />
            ))}
          </div>
        </div>
      )}
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
            value={
              latestResponse?.questionType === "freeResponse"
                ? latestResponse.responseText
                : ""
            }
            rows={5}
            cols={40}
            style={{
              fontSize: "18px",
              borderRadius: "10px",
            }}
            readOnly
          />
          <div style={{ marginLeft: "20px", marginRight: "20px" }}>
            {question.correctAnswers?.map((answer) => (
              <div
                style={{
                  textAlign: "center",
                  fontSize: "20px",
                  paddingTop: "10px",
                  color: "white",
                }}
              >
                Correct: {answer}
              </div>
            ))}
          </div>
        </div>
      )}
      <div style={{ paddingTop: "32px" }} />
      <button
        className="small-button"
        onClick={() => dispatch({ type: "doneViewingCorrect" })}
      >
        okay
      </button>
    </>
  );
};
