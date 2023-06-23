import "../../styles/Background.css";
import { QuestionQueue } from "./QuestionQueue";
import { useCallback, useContext, useEffect, useRef, useState } from "react";
import {
  FrontendContext,
  FrontendDispatchContext,
} from "../../context/FrontendDataModelContext";
import { TopBar } from "../../components/TopBar";
import "../../styles/Button.css";
import Button from "../../components/button/Button";
import { parser } from "../../utils/file-parser";
import { v4 as uuidv4 } from "uuid";
import "../../styles/HostPanel.css";
import Toggle from "../../components/toggle/Toggle";
import { AnswerOption } from "../join/AnswerOption";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarProps,
} from "recharts";
import { closeQuestionAsHost, endSessionAsHost } from "../../utils/actions";
import { createCSV } from "../../utils/export_csv";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPerson } from "@fortawesome/free-solid-svg-icons";
import { downloadCSVToClient } from "../../utils/download-csv";
import { FrontendDataModel } from "../../types/FrontendDataModel";
import { toast } from "react-toastify";

const truncate = (input: any) =>
  input?.length > 90 ? `${input.substring(0, 90)}...` : input;

type DataPoint = {
  answer: string;
  percentage: string;
};

function HostPanel() {
  const dispatch = useContext(FrontendDispatchContext);
  const dataModel = useContext(FrontendContext);
  const [fileStored, setFileStored] = useState(false);
  const hiddenFileInput = useRef<HTMLInputElement>(null);
  const [responseView, setResponseView] = useState(false);
  const [data, setData] = useState<DataPoint[]>([]);
  const [showParticipants, setShowParticipants] = useState(false);

  const handleData = (dataModel: FrontendDataModel) => {
    const map = new Map();
    if (dataModel.type === "host") {
      for (let i = 0; i < dataModel.session.responses.length; i++) {
        const response = dataModel.session.responses[i];
        if (response.questionId === dataModel.session.activeQuestion?.id) {
          if (
            response.questionType === "multipleChoice" &&
            dataModel.session.activeQuestion.type === "multipleChoice"
          ) {
            for (
              let j = 0;
              j < dataModel.session.activeQuestion.options.length;
              j++
            ) {
              const active = dataModel.session.activeQuestion.options[j];
              if (response.selectedResponse === active.text) {
                map.has(active.text)
                  ? map.get(active.text).val++
                  : map.set(active.text, { val: 1 });
              }
            }
          } else if (
            response.questionType === "selectMany" &&
            dataModel.session.activeQuestion.type === "selectMany"
          ) {
            for (
              let j = 0;
              j < dataModel.session.activeQuestion.options.length;
              j++
            ) {
              const active = dataModel.session.activeQuestion.options[j];
              for (let k = 0; k < response.selectedResponses.length; k++) {
                if (response.selectedResponses[k] === active.text) {
                  map.has(active.text)
                    ? map.get(active.text).val++
                    : map.set(active.text, { val: 1 });
                }
              }
            }
          }
        }
      }
      const total = Array.from(map.values()).reduce(
        (sum, val) => sum + val.val,
        0
      );
      const formattedData = [];
      if (
        dataModel.session.activeQuestion?.type !== "freeResponse" &&
        dataModel.session.activeQuestion?.type !== undefined
      ) {
        for (const option of dataModel.session.activeQuestion.options) {
          const count = map.has(option.text) ? map.get(option.text).val : 0;
          const percentage =
            total > 0 ? parseInt(((count / total) * 100).toFixed(2)) : 0;
          formattedData.push({ answer: option.text, percentage });
        }
      }
      return formattedData;
    }
  };

  const handleToggle = (state: boolean) => {
    setResponseView(state);
  };

  const handleClick = () => {
    if (hiddenFileInput.current) {
      hiddenFileInput.current.click();
    }
  };

  const handleParticipantList = () => {
    setShowParticipants(!showParticipants);
  };

  const endQuestion = () => {
    if (dataModel.type === "host") {
      closeQuestionAsHost(
        dispatch,
        dataModel.session.code,
        dataModel.session.hostSecret
      );
    }
  };

  const endSession = () => {
    if (
      dataModel.type === "host" &&
      dataModel.session.activeQuestion === null
    ) {
      endSessionAsHost(
        dispatch,
        dataModel.session.code,
        dataModel.session.hostSecret
      );
      downloadCSVToClient(dataModel.session);
    } else {
      toast.error("End question before ending session");
    }
  };

  const clear = useCallback(() => {
    if (hiddenFileInput.current !== null) {
      hiddenFileInput.current.value = "";
    }
  }, []);

  const handleFileUpload = (event: any) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        const content = reader.result;
        if (typeof content === "string") {
          const questions = parser(content, uuidv4);
          if (questions.kind === "success") {
            setFileStored(true);
            dispatch({
              type: "addQuestionsToQueue",
              questionsToAdd: questions.value,
              insertIndex:
                dataModel.type === "host" ? dataModel.questionQueue.length : 0,
            });
          } else {
            alert(questions.msg);
          }
        }
      };
      reader.readAsText(file);
      clear();
    }
  };

  return (
    <>
      {dataModel.type === "host" && (
        <div className="background">
          <TopBar
            secondsLeft={dataModel.timeRemaining ?? undefined}
            sessionCode={dataModel.session.code}
          />
          {dataModel.sessionStatus === "ended" && (
            <>
              <div style={{ paddingTop: "64px" }} />
              <div style={{ textAlign: "center" }} className="title">
                session ended.
              </div>
            </>
          )}
          {dataModel.sessionStatus === "inProgress" && (
            <div style={{ flexDirection: "row", display: "flex" }}>
              <div style={{ width: "33vw" }}>
                <div className="left">
                  <div>
                    <Button
                      text={"upload questions"}
                      onClick={handleClick}
                      isUpload={true}
                      height={75}
                      width={250}
                      fontSize={20}
                      color="#282C34"
                      border={"5px solid #4169E1"}
                      hasFile={fileStored}
                    />
                    <input
                      type="file"
                      accept=".yml"
                      ref={hiddenFileInput}
                      onChange={handleFileUpload}
                      style={{ display: "none" }}
                    />
                  </div>
                </div>
                <QuestionQueue
                  dispatch={dispatch}
                  questionQueue={dataModel.questionQueue}
                />
              </div>
              <div className="right">
                <div className="active">
                  {!showParticipants ? (
                    <div className="active-question">
                      {truncate(dataModel.session.activeQuestion?.prompt)}
                    </div>
                  ) : (
                    ""
                  )}
                  <FontAwesomeIcon
                    icon={faPerson}
                    style={{
                      color: "#4169E1",
                      fontSize: 45,
                      paddingTop: "20px",
                    }}
                    onClick={handleParticipantList}
                  />
                  {showParticipants ? (
                    <div style={{ paddingTop: "50px", textAlign: "center" }}>
                      {dataModel.session.participants.map((p, index) => (
                        <div style={{ fontSize: "30", paddingTop: "5px" }}>
                          {p.name}
                        </div>
                      ))}
                    </div>
                  ) : (
                    ""
                  )}
                  {dataModel.session.activeQuestion !== null &&
                  !showParticipants ? (
                    <div className="toggle-box">
                      <Toggle
                        label="toggle me"
                        toggled={responseView}
                        onClick={handleToggle}
                      ></Toggle>
                    </div>
                  ) : (
                    ""
                  )}
                  {!showParticipants ? (
                    <div style={{ marginTop: 60 }}>
                      {responseView ? (
                        dataModel.session.activeQuestion?.type ===
                        "freeResponse" ? (
                          dataModel.session.responses?.map((response, index) =>
                            response.questionId ===
                              dataModel.session.activeQuestion?.id &&
                            response.questionType === "freeResponse" ? (
                              <div className="free-response-box">
                                <div className="free-response-id">
                                  {response.participantId}
                                </div>
                                <div className="free-response-text">
                                  {response.responseText}
                                </div>
                              </div>
                            ) : null
                          )
                        ) : (
                          dataModel.session.activeQuestion !== null && (
                            <BarChart
                              width={730}
                              height={250}
                              data={handleData(dataModel)}
                            >
                              <XAxis dataKey="answer" />
                              <Tooltip />
                              <Bar dataKey="percentage" fill="#4169E1" />
                            </BarChart>
                          )
                        )
                      ) : dataModel.session.activeQuestion?.type ===
                        "freeResponse" ? (
                        <div className="correct-box">
                          {dataModel.session.activeQuestion?.correctAnswers?.map(
                            (answer, index) => (
                              <div className="free-response-box">
                                <div className="free-response-text">
                                  {answer}
                                </div>
                              </div>
                            )
                          )}
                        </div>
                      ) : (
                        dataModel.session.activeQuestion?.options?.map(
                          (option, index) => (
                            <AnswerOption
                              key={index}
                              index={index}
                              onClick={() => {
                                return;
                              }}
                              selected={false}
                              type={
                                dataModel.session.activeQuestion?.type ===
                                "multipleChoice"
                                  ? "radio"
                                  : "checkbox"
                              }
                              text={option.text}
                              isCorrect={option.isCorrect!}
                            />
                          )
                        )
                      )}
                    </div>
                  ) : (
                    ""
                  )}
                  {!showParticipants ? (
                    <div style={{ flexDirection: "row", display: "flex" }}>
                      {dataModel.session.activeQuestion !== null ? (
                        <Button
                          text="stop question"
                          width={200}
                          height={75}
                          fontSize={25}
                          onClick={endQuestion}
                        />
                      ) : (
                        <div className="active-question">
                          NO ACTIVE QUESTION
                        </div>
                      )}
                      <Button
                        text="end session"
                        width={200}
                        height={75}
                        fontSize={25}
                        onClick={endSession}
                        color="#E03E3E"
                        border="none"
                      />
                    </div>
                  ) : (
                    ""
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </>
  );
}

export default HostPanel;
