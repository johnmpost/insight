import { Question } from "../../../shared/domain/Question";
import { QuestionResponse } from "../../../shared/domain/QuestionResponse";
import { QuestionResponseForHost } from "../../../shared/dtos/QuestionResponseForHost";
import { QuestionResponseForParticipant } from "../../../shared/dtos/QuestionResponseForParticipant";
import {
  createEmptySession,
  createParticipant,
  generateSessionCode,
  generateUserSecret,
  questionResponseForParticipantToQuestionResponse,
  questionResponseToQuestionResponseForHost,
  removeAnswersFromQuestion,
} from "../utils/route-utils";

test("testRemoveAnswersFreeResponse", () => {
  const q: Question = {
    correctAnswers: ["Red", "Orange"],
    id: "123456",
    isAnonymous: true,
    prompt: "What is your favorite color?",
    timeLimit: 60,
    type: "freeResponse",
  };

  const res = removeAnswersFromQuestion(q);
  const expected = {
    correctAnswers: null,
    id: "123456",
    isAnonymous: true,
    prompt: "What is your favorite color?",
    timeLimit: 60,
    type: "freeResponse",
  };

  expect(res).toStrictEqual(expected);
});

test("testRemoveAnswersMultipleChoice", () => {
  const q: Question = {
    id: "123456",
    isAnonymous: false,
    options: [
      { isCorrect: false, text: "Red" },
      { isCorrect: true, text: "Orange" },
      { isCorrect: false, text: "Blue" },
      { isCorrect: false, text: "Green" },
    ],
    prompt: "What is your favorite color?",
    timeLimit: 75,
    type: "multipleChoice",
  };

  const res = removeAnswersFromQuestion(q);
  const expected = {
    id: "123456",
    isAnonymous: false,
    options: [
      { isCorrect: null, text: "Red" },
      { isCorrect: null, text: "Orange" },
      { isCorrect: null, text: "Blue" },
      { isCorrect: null, text: "Green" },
    ],
    prompt: "What is your favorite color?",
    timeLimit: 75,
    type: "multipleChoice",
  };

  expect(res).toStrictEqual(expected);
});

test("testRemoveAnswersMultipleSelect", () => {
  const q: Question = {
    id: "123456",
    isAnonymous: false,
    options: [
      { isCorrect: false, text: "Red" },
      { isCorrect: true, text: "Orange" },
      { isCorrect: false, text: "Blue" },
      { isCorrect: true, text: "Green" },
    ],
    prompt: "What is your favorite color?",
    timeLimit: 45,
    type: "selectMany",
  };

  const res = removeAnswersFromQuestion(q);
  const expected = {
    id: "123456",
    isAnonymous: false,
    options: [
      { isCorrect: null, text: "Red" },
      { isCorrect: null, text: "Orange" },
      { isCorrect: null, text: "Blue" },
      { isCorrect: null, text: "Green" },
    ],
    prompt: "What is your favorite color?",
    timeLimit: 45,
    type: "selectMany",
  };

  expect(res).toStrictEqual(expected);
});

test("testGenerateSessionCode", () => {
  const res = generateSessionCode();
  const expected = 6;

  expect(res.length).toStrictEqual(expected);
});

test("testGenerateSessionCodeCorrect", () => {
  const str = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  const res = [...generateSessionCode()];
  expect(res.every((char) => str.includes(char))).toStrictEqual(true);
});

test("testGenerateUserSecret", () => {
  const res = generateUserSecret();
  const expected = 128;

  expect(res.length).toStrictEqual(expected);
});

test("testGenerateUserSecretCorrect", () => {
  const str = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  const res = [...generateUserSecret()];
  for (let i = 0; i < res.length; i++) {
    expect(str.includes(res[i])).toStrictEqual(true);
  }
});

test("testQuestionResponseForParticipantToQuestionResponseMC", () => {
  const qr: QuestionResponseForParticipant = {
    questionId: "4",
    questionType: "multipleChoice",
    participantId: "5",
    selectedResponse: "B",
  };

  const res = questionResponseForParticipantToQuestionResponse(true, qr, "0");
  const expected = {
    questionId: "4",
    questionType: "multipleChoice",
    participantId: "5",
    selectedResponse: "B",
    id: "0",
    isAnonymous: true,
  };

  expect(res).toStrictEqual(expected);
});

test("testQuestionResponseForParticipantToQuestionResponseMS", () => {
  const qr: QuestionResponseForParticipant = {
    questionId: "4",
    questionType: "selectMany",
    participantId: "5",
    selectedResponses: ["B", "C"],
  };

  const res = questionResponseForParticipantToQuestionResponse(true, qr, "0");

  const expected = {
    questionId: "4",
    questionType: "selectMany",
    participantId: "5",
    selectedResponses: ["B", "C"],
    id: "0",
    isAnonymous: true,
  };

  expect(res).toStrictEqual(expected);
});

test("testQuestionResponseForParticipantToQuestionResponseFR", () => {
  const qr: QuestionResponseForParticipant = {
    questionId: "4",
    questionType: "freeResponse",
    participantId: "5",
    responseText: "Red and blue",
  };

  const res = questionResponseForParticipantToQuestionResponse(true, qr, "0");

  const expected = {
    questionId: "4",
    questionType: "freeResponse",
    participantId: "5",
    responseText: "Red and blue",
    id: "0",
    isAnonymous: true,
  };

  expect(res).toStrictEqual(expected);
});

test("testQuestionResponseToQuestionResponseForHostMC", () => {
  const qr: QuestionResponse = {
    id: "0",
    isAnonymous: true,
    questionId: "4",
    questionType: "multipleChoice",
    participantId: "5",
    selectedResponse: "B",
  };

  const res = questionResponseToQuestionResponseForHost(qr);
  const expected = {
    id: "0",
    isAnonymous: true,
    questionId: "4",
    questionType: "multipleChoice",
    participantId: null,
    selectedResponse: "B",
  };

  expect(res).toStrictEqual(expected);
});

test("testQuestionResponseToQuestionResponseForHostMS", () => {
  const qr: QuestionResponse = {
    id: "0",
    isAnonymous: true,
    questionId: "4",
    questionType: "selectMany",
    participantId: "5",
    selectedResponses: ["Red", "Blue"],
  };

  const res = questionResponseToQuestionResponseForHost(qr);
  const expected = {
    id: "0",
    isAnonymous: true,
    questionId: "4",
    questionType: "selectMany",
    participantId: null,
    selectedResponses: ["Red", "Blue"],
  };

  expect(res).toStrictEqual(expected);
});

test("testQuestionResponseToQuestionResponseForHostFR", () => {
  const qr: QuestionResponse = {
    id: "0",
    isAnonymous: true,
    questionId: "4",
    questionType: "freeResponse",
    participantId: "5",
    responseText: "Red, blue, and yellow",
  };

  const res = questionResponseToQuestionResponseForHost(qr);
  const expected = {
    id: "0",
    isAnonymous: true,
    questionId: "4",
    questionType: "freeResponse",
    participantId: null,
    responseText: "Red, blue, and yellow",
  };

  expect(res).toStrictEqual(expected);
});
