import { Option } from "../utils/Option";

export type QuestionResponseForHost = {
  questionId: string;
  participantId: Option<string>;
  id: string;
} & (
  | {
      questionType: "multipleChoice";
      selectedResponse: string;
    }
  | {
      questionType: "selectMany";
      selectedResponses: string[];
    }
  | {
      questionType: "freeResponse";
      responseText: string;
    }
);
