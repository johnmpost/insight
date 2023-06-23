export type QuestionResponse = {
  questionId: string;
  participantId: string;
  isAnonymous: boolean;
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
