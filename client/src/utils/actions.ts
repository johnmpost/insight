import React from "react";
import {
  addHostHandlers,
  addParticipantHandlers,
  getId,
} from "../services/socket";
import { Action } from "../types/FrontendDataModel";
import {
  activateQuestion,
  closeQuestion,
  createSession,
  endSession,
  joinSession,
  respondToQuestion,
} from "./endpoints";
import { Question } from "../../../shared/domain/Question";
import { QuestionResponseForParticipant } from "../../../shared/dtos/QuestionResponseForParticipant";
import { toast } from "react-toastify";

export const createNewSessionAsHost = async (
  dispatch: React.Dispatch<Action>
) => {
  const newSession = await createSession(getId());
  addHostHandlers(dispatch);
  dispatch({ type: "createSession", newSession });
};

export const endSessionAsHost = async (
  dispatch: React.Dispatch<Action>,
  sessionCode: string,
  hostSecret: string
) => {
  const completedSession = await endSession(sessionCode, hostSecret);
  dispatch({ type: "endSession", completedSession });
};

export const joinSessionAsParticipant = async (
  dispatch: React.Dispatch<Action>,
  sessionCode: string,
  name: string
) => {
  const participant = await joinSession(sessionCode, name, getId());
  addParticipantHandlers(dispatch);
  dispatch({ type: "joinSession", sessionCode, participant });
};

export const activateQuestionAsHost = async (
  dispatch: React.Dispatch<Action>,
  sessionCode: string,
  hostSecret: string,
  question: Question
) => {
  await activateQuestion(sessionCode, question, hostSecret);
  dispatch({ type: "activateQuestion", newQuestion: question });
};

export const closeQuestionAsHost = async (
  dispatch: React.Dispatch<Action>,
  sessionCode: string,
  hostSecret: string
) => {
  await closeQuestion(sessionCode, hostSecret);
  dispatch({ type: "closeQuestion" });
};

export const sendResponseAsParticipant = async (
  dispatch: React.Dispatch<Action>,
  sessionCode: string,
  participantSecret: string,
  questionResponse: QuestionResponseForParticipant
) => {
  await respondToQuestion(sessionCode, questionResponse, participantSecret);
  toast.success("Response submitted");
  dispatch({ type: "sentNewResponse", response: questionResponse });
};
