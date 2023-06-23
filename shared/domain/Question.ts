import { Option } from "../utils/Option";
import { AnswerChoice } from "./AnswerChoice";

export type Question = {
  id: string;
  isAnonymous: boolean;
  timeLimit: Option<number>;
} & (
  | {
      type: "multipleChoice";
      prompt: string;
      options: AnswerChoice[];
    }
  | {
      type: "selectMany";
      prompt: string;
      options: AnswerChoice[];
    }
  | {
      type: "freeResponse";
      prompt: string;
      correctAnswers: Option<string[]>;
    }
);
