export const QuestionTypes = {
  multipleChoice: "multipleChoice" as "multipleChoice",
  selectMany: "selectMany" as "selectMany",
  freeResponse: "freeResponse" as "freeResponse",
};

const questionTypes = [
  QuestionTypes.multipleChoice,
  QuestionTypes.selectMany,
  QuestionTypes.freeResponse,
] as const;

export type QuestionType = typeof questionTypes[number];
