import { Option } from "../utils/Option";

export type AnswerChoice = {
  text: string;
  isCorrect: Option<boolean>;
};
