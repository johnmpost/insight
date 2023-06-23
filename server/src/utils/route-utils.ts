import { randomBytes } from "crypto";
import { Session } from "../../../shared/domain/Session";
import { Request } from "express";
import { failure, success } from "../../../shared/utils/Result";
import { Server, Socket } from "socket.io";
import { Participant } from "../../../shared/domain/Participant";
import { v4 as uuidv4 } from "uuid";
import { Question } from "../../../shared/domain/Question";
import { deepCopy } from "../../../shared/utils/deepcopy";
import { QuestionResponseForParticipant } from "../../../shared/dtos/QuestionResponseForParticipant";
import { QuestionResponse } from "../../../shared/domain/QuestionResponse";
import { QuestionResponseForHost } from "../../../shared/dtos/QuestionResponseForHost";
import { SessionForHost } from "../../../shared/dtos/SessionForHost";
import { AsyncUniqueValueStoreAPI } from "./storage-apis";

export const removeAnswersFromQuestion = (question: Question) => {
  const newQuestion = deepCopy(question);
  if (newQuestion.type === "freeResponse") {
    newQuestion.correctAnswers = null;
  } else {
    newQuestion.options = newQuestion.options.map((choice) => ({
      isCorrect: null,
      text: choice.text,
    }));
  }
  return newQuestion;
};

export const generateSessionCode = () => {
  const alphanumeric = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  const getRandomChar = () =>
    alphanumeric.charAt(Math.floor(Math.random() * alphanumeric.length));
  return Array.from({ length: 6 }, getRandomChar).join("");
};

export const generateUserSecret = () => {
  const length = 128;
  const charset =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  const keyBuffer = randomBytes(length);
  return Array.from(keyBuffer)
    .map((byte) => charset[byte % charset.length])
    .join("");
};

export const createEmptySession = async (
  codesRepo: AsyncUniqueValueStoreAPI<string>,
  hostSocketId: string
): Promise<Session> => ({
  code: await codesRepo.create(),
  hostSecret: generateUserSecret(),
  hostSocketId: hostSocketId,
  participants: [],
  endedQuestions: [],
  activeQuestion: null,
  responses: [],
});

export const createParticipant = (name: string): Participant => ({
  id: uuidv4(),
  secret: generateUserSecret(),
  name: name,
});

export const customHeaders = [
  "X-Host-Secret",
  "X-Participant-Secret",
  "X-Socket-ID",
] as const;
export type CustomHeaders = typeof customHeaders[number];

export const getHeader = (req: Request, headerName: CustomHeaders) => {
  const headerValue = req.header(headerName);
  return headerValue === undefined
    ? failure(`header ${headerName} is not present`)
    : success(headerValue);
};

export const getSocket = (io: Server) => (socketId: string) => {
  const socket = io.sockets.sockets.get(socketId);
  return socket === undefined
    ? failure("no socket exists with that id")
    : success(socket);
};

export const ensureNotAlreadyInRoom = (socket: Socket) => {
  const socketInDefaultRoom =
    Object.keys(socket.rooms).length === 1 && socket.rooms.has(socket.id);
  const socketInARoom = !(Object.keys(socket.rooms).length === 0);
  const socketAlreadyInRoom = !socketInDefaultRoom && socketInARoom;
  return socketAlreadyInRoom
    ? failure("socket already in a room")
    : success(socket);
};

export const questionResponseForParticipantToQuestionResponse = (
  isAnonymous: boolean,
  response: QuestionResponseForParticipant,
  newOrExistingId: string
): QuestionResponse => ({
  ...response,
  id: newOrExistingId,
  isAnonymous,
});

export const questionResponseToQuestionResponseForHost = (
  response: QuestionResponse
): QuestionResponseForHost => ({
  ...response,
  participantId: response.isAnonymous ? null : response.participantId,
});

export const sessionToSessionForHost = (session: Session): SessionForHost => ({
  ...session,
  responses: session.responses.map(questionResponseToQuestionResponseForHost),
});
