import { Question } from "../domain/Question";

export const questionHasCorrectAnswer = (question: Question) => {
  return question.type === "freeResponse"
    ? question.correctAnswers !== null
    : question.type === "multipleChoice"
    ? question.options.every((answerChoice) => answerChoice.isCorrect !== null)
    : question.options.every((answerChoice) => answerChoice.isCorrect !== null);
};
