import axios from "axios";
import { Question } from "../../../shared/domain/Question";
import { Participant } from "../../../shared/domain/Participant";
import { config } from "../../../shared/config";
import { QuestionResponseForParticipant } from "../../../shared/dtos/QuestionResponseForParticipant";
import { SessionForHost } from "../../../shared/dtos/SessionForHost";
import { CheckSessionExistsResponse } from "../../../shared/dtos/CheckSessionExistsResponse";

const API_URL = config.serverHostname;

export const createSession = async (
  socketId: string
): Promise<SessionForHost> => {
  const response = await axios.post(`${API_URL}/api/session`, null, {
    headers: { "X-Socket-ID": socketId },
  });
  return response.data;
};

export const endSession = async (
  sessionCode: string,
  hostSecret: string
): Promise<SessionForHost> => {
  const response = await axios.delete(`${API_URL}/api/session/${sessionCode}`, {
    headers: { "X-Host-Secret": hostSecret },
  });
  return response.data;
};

export const joinSession = async (
  sessionCode: string,
  name: string,
  socketId: string
): Promise<Participant> => {
  const response = await axios.post(
    `${API_URL}/api/session/${sessionCode}/participants`,
    { name },
    { headers: { "X-Socket-ID": socketId } }
  );
  return response.data;
};

export const activateQuestion = async (
  sessionCode: string,
  newQuestion: Question,
  hostSecret: string
): Promise<void> => {
  await axios.post(
    `${API_URL}/api/session/${sessionCode}/activeQuestion`,
    newQuestion,
    { headers: { "X-Host-Secret": hostSecret } }
  );
};

export const closeQuestion = async (
  sessionCode: string,
  hostSecret: string
): Promise<void> => {
  await axios.delete(`${API_URL}/api/session/${sessionCode}/activeQuestion`, {
    headers: { "X-Host-Secret": hostSecret },
  });
};

export const respondToQuestion = async (
  sessionCode: string,
  newResponse: QuestionResponseForParticipant,
  participantSecret: string
): Promise<void> => {
  await axios.put(
    `${API_URL}/api/session/${sessionCode}/responses`,
    newResponse,
    { headers: { "X-Participant-Secret": participantSecret } }
  );
};

export const checkActiveQuestion = async (
  sessionCode: string,
  socketId: string
): Promise<void> => {
  await axios.get(`${API_URL}/api/session/${sessionCode}/checkActiveQuestion`, {
    headers: { "X-Socket-ID": socketId },
  });
};

export const checkSessionExists = async (
  sessionCode: string
): Promise<boolean> => {
  const response = await axios.get(
    `${API_URL}/api/sessionExists/${sessionCode}`
  );
  return response.data.sessionExists;
};
