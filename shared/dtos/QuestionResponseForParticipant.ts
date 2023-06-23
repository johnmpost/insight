export type QuestionResponseForParticipant = {
  questionId: string;
  participantId: string;
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
