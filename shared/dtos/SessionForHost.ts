import { Session } from "../domain/Session";
import { QuestionResponseForHost } from "./QuestionResponseForHost";

export type SessionForHost = Omit<Session, "responses"> & {
  responses: QuestionResponseForHost[];
};
