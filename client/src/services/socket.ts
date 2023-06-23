import { io } from "socket.io-client";
import { config } from "../../../shared/config";
import { WSEvents } from "../../../shared/domain/WebsocketEvents";
import { Action } from "../types/FrontendDataModel";
import React from "react";
import { Question } from "../../../shared/domain/Question";
import { Participant } from "../../../shared/domain/Participant";
import { QuestionResponseForHost } from "../../../shared/dtos/QuestionResponseForHost";

const socket = io(config.serverHostname);

socket.on("connect", () => {
  console.log(`socket connected, id: ${socket.id}`);
});

export const getId = () => socket.id;

export const addHostHandlers = (dispatch: React.Dispatch<Action>) => {
  socket.on(WSEvents.newResponse, (response: QuestionResponseForHost) => {
    dispatch({ type: "newResponse", response });
  });
  socket.on(WSEvents.participantJoined, (participant: Participant) => {
    dispatch({ type: "participantJoined", participant });
  });
  socket.on(WSEvents.questionEnded, () => {
    dispatch({ type: "closeQuestion" });
  });
  socket.on(WSEvents.timerUpdate, (timeRemaining: number) => {
    dispatch({ type: "updateTimer", timeRemaining });
  });
};

export const addParticipantHandlers = (dispatch: React.Dispatch<Action>) => {
  socket.on(WSEvents.newQuestion, (question: Question) => {
    dispatch({ type: "newQuestion", question });
  });
  socket.on(WSEvents.questionEnded, (endedQuestion: Question) => {
    dispatch({ type: "questionClosed", endedQuestion });
  });
  socket.on(WSEvents.sessionEnded, () => {
    dispatch({ type: "sessionClosedByHost" });
  });
  socket.on(WSEvents.timerUpdate, (timeRemaining: number) => {
    dispatch({ type: "updateTimer", timeRemaining });
  });
};
