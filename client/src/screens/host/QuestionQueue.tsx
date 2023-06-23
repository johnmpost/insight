import React, { useContext, useEffect, useState } from "react";
import {
  DragDropContext,
  Droppable,
  Draggable,
  OnDragEndResponder,
} from "@hello-pangea/dnd";
import { Action } from "../../types/FrontendDataModel";
import { Question } from "../../../../shared/domain/Question";
import info from "../../assets/info.png";
import arrow from "../../assets/arrow.png";
import Modal from "../../components/modal/Modal";
import "../../styles/QuestionQueue.css";
import { parser } from "../../utils/file-parser";
import { toast } from "react-toastify";
import { FrontendContext } from "../../context/FrontendDataModelContext";
import {
  activateQuestionAsHost,
  closeQuestionAsHost,
} from "../../utils/actions";

type Props = {
  dispatch: React.Dispatch<Action>;
  questionQueue: Question[];
};

export const QuestionQueue = ({ dispatch, questionQueue }: Props) => {
  const [showModal, setShowModal] = useState(false);
  const [modalQuestion, setModalQuestion] = useState(questionQueue[0]);
  const [modalIndex, setModalIndex] = useState(0);
  const dataModel = useContext(FrontendContext);

  const handleClick = (question: Question, index: number) => {
    setModalIndex(index);
    setModalQuestion(question);
    setShowModal(true);
  };

  const handleClose = () => {
    setShowModal(false);
  };

  const handleQuestion = (questionText: any) => {
    const questionResult = parser(questionText, () => "uuidv4");
    console.log(questionResult);
    if (questionResult.kind === "success") {
      var updateIndex = questionQueue
        .map(function (x) {
          return x.id;
        })
        .indexOf(questionResult.value[0].id);
      dispatch({
        type: "editQuestionInQueue",
        updateIndex: modalIndex,
        updatedQuestion: questionResult.value[0],
      });
      toast.success("Question successfully updated");
    } else {
      toast.error("YAML is improperly formatted");
    }
  };

  const useNext = () => {
    if (
      questionQueue.length > 0 &&
      dataModel.type === "host" &&
      dataModel.session.activeQuestion === null
    ) {
      const active = questionQueue.shift()!;
      activateQuestionAsHost(
        dispatch,
        dataModel.session.code,
        dataModel.session.hostSecret,
        active
      );
    }
  };

  const onDragEnd: OnDragEndResponder = (result) => {
    // Check if the drag-and-drop operation was valid
    if (!result.destination) {
      return;
    }

    // Get the current order of the questionQueue from state
    const currentOrder = [...questionQueue];

    // Reorder the questionQueue based on the drag-and-drop result
    const [removed] = currentOrder.splice(result.source.index, 1);
    currentOrder.splice(result.destination.index, 0, removed);

    // Dispatch a reorderQuestionQueue action with the new order as the payload
    dispatch({
      type: "reorderQuestionQueue",
      newOrder: currentOrder,
    });
  };

  const grid = 8;

  const getItemStyle = (isDragging: any, draggableStyle: any) => ({
    // change background colour if dragging
    background: isDragging ? "lightgray" : "white",

    // styles we need to apply on draggables
    ...draggableStyle,
  });

  const getListStyle = (isDraggingOver: any) => ({
    // if we want to change the list background while dragging
    background: isDraggingOver ? "#4169E1" : "#4169E1",
  });

  return (
    <div>
      <Modal
        question={modalQuestion}
        show={showModal}
        handleClose={handleClose}
        handleQuestion={handleQuestion}
      ></Modal>
      <DragDropContext onDragEnd={onDragEnd}>
        <Droppable droppableId="questionList">
          {(provided, snapshot) => (
            <div className="list-container">
              <div className="next" onClick={useNext}>
                next
                <img src={arrow} alt="ERROR" className="next-arrow"></img>
              </div>
              <div
                ref={provided.innerRef}
                {...provided.droppableProps}
                style={getListStyle(snapshot.isDraggingOver)}
                className="list"
              >
                {questionQueue.map((question, index) => (
                  <Draggable
                    key={question.id}
                    draggableId={question.id}
                    index={index}
                  >
                    {(provided, snapshot) => (
                      <div
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        {...provided.dragHandleProps}
                        style={getItemStyle(
                          snapshot.isDragging,
                          provided.draggableProps.style
                        )}
                        className="item"
                      >
                        <div className="question-wrap">
                          <div className="question-type">
                            {question.type
                              .replace(/([a-z])([A-Z])/g, "$1 $2")
                              .toLowerCase()}
                          </div>
                          <div className="question">{question.prompt}</div>
                        </div>
                        <img
                          src={info}
                          alt="ERROR"
                          className="info"
                          onClick={() => handleClick(question, index)}
                        ></img>
                      </div>
                    )}
                  </Draggable>
                ))}
                {provided.placeholder}
              </div>
            </div>
          )}
        </Droppable>
      </DragDropContext>
    </div>
  );
};
