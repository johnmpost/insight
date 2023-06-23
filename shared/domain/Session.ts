import { Option } from "../utils/Option";
import { Participant } from "./Participant";
import { Question } from "./Question";
import { QuestionResponse } from "./QuestionResponse";

export type Session = {
  code: string;
  hostSecret: string;
  hostSocketId: string;
  participants: Participant[];
  endedQuestions: Question[];
  activeQuestion: Option<Question>;
  responses: QuestionResponse[];
};
