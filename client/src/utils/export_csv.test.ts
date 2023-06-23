import { Session } from "../../../shared/domain/Session";
import { Participant } from "../../../shared/domain/Participant";
import { Question } from "../../../shared/domain/Question";
import { QuestionResponse } from "../../../shared/domain/QuestionResponse";
import { createCSV } from "./export_csv";
import { AnswerChoice } from "../../../shared/domain/AnswerChoice";

const part: Participant = {
  id: "1234",
  secret: "secret",
  name: "Emma",
};

const opt: AnswerChoice[] = [
  { text: "2", isCorrect: false },
  { text: "3", isCorrect: false },
  { text: "5", isCorrect: false },
  { text: "6", isCorrect: true },
];

const past: Question = {
  id: "5678",
  isAnonymous: false,
  timeLimit: null,
  type: "multipleChoice",
  prompt: "What is 3+3?",
  options: opt,
};

const resp: QuestionResponse = {
  questionId: "5678",
  participantId: "1234",
  isAnonymous: false,
  id: "91011",
  questionType: "multipleChoice",
  selectedResponse: "6",
};

test("all information is present when participants are known.", () => {
  const sess: Session = {
    code: "ABCDE",
    hostSecret: "secret",
    hostSocketId: "121314",
    participants: [part],
    endedQuestions: [past],
    activeQuestion: null,
    responses: [resp],
  };

  let result = createCSV(sess);

  let expected = "Participant,What is 3+3?\nCorrect Answers,6\nEmma,6";

  expect(result[0]).toStrictEqual(expected);
});

test("answers correctly assigned with multiple questions and participants", () => {
  const part2: Participant = {
    id: "abcd",
    secret: "secret2",
    name: "Sierra",
  };

  const opt2: AnswerChoice[] = [
    { text: "yellow", isCorrect: false },
    { text: "neon pink", isCorrect: false },
    { text: "vomit green", isCorrect: false },
    { text: "blue", isCorrect: true },
  ];

  const past2: Question = {
    id: "899091",
    isAnonymous: false,
    timeLimit: null,
    type: "multipleChoice",
    prompt: "What is the best color?",
    options: opt2,
  };

  const resp1b: QuestionResponse = {
    questionId: "899091",
    participantId: "1234",
    isAnonymous: false,
    id: "91011",
    questionType: "multipleChoice",
    selectedResponse: "blue",
  };

  const resp2a: QuestionResponse = {
    questionId: "5678",
    participantId: "abcd",
    isAnonymous: false,
    id: "91011",
    questionType: "multipleChoice",
    selectedResponse: "3",
  };

  const resp2b: QuestionResponse = {
    questionId: "899091",
    participantId: "abcd",
    isAnonymous: false,
    id: "91011",
    questionType: "multipleChoice",
    selectedResponse: "yellow",
  };

  const sess: Session = {
    code: "ABCDE",
    hostSecret: "secret",
    hostSocketId: "121314",
    participants: [part, part2],
    endedQuestions: [past, past2],
    activeQuestion: null,
    responses: [resp, resp1b, resp2a, resp2b],
  };

  let result = createCSV(sess);

  let expected =
    "Participant,What is 3+3?,What is the best color?\nCorrect Answers,6,blue\nEmma,6,blue\nSierra,3,yellow";

  expect(result[0]).toStrictEqual(expected);
});

test("unanswered questions left blank.", () => {
  const sess: Session = {
    code: "ABCDE",
    hostSecret: "secret",
    hostSocketId: "121314",
    participants: [part],
    endedQuestions: [past],
    activeQuestion: null,
    responses: [],
  };

  let result = createCSV(sess);

  let expected = "Participant,What is 3+3?\nCorrect Answers,6\nEmma,";

  expect(result[0]).toStrictEqual(expected);
});

test("multipe select choice answer correctly joined", () => {
  const opt: AnswerChoice[] = [
    { text: "2", isCorrect: true },
    { text: "3.5", isCorrect: false },
    { text: "5.24", isCorrect: false },
    { text: "6", isCorrect: true },
  ];

  const past: Question = {
    id: "5678",
    isAnonymous: false,
    timeLimit: null,
    type: "selectMany",
    prompt: "Which of the following are integers?",
    options: opt,
  };

  const resp: QuestionResponse = {
    questionId: "5678",
    participantId: "1234",
    isAnonymous: false,
    id: "91011",
    questionType: "selectMany",
    selectedResponses: ["2", "6"],
  };

  const sess: Session = {
    code: "ABCDE",
    hostSecret: "secret",
    hostSocketId: "121314",
    participants: [part],
    endedQuestions: [past],
    activeQuestion: null,
    responses: [resp],
  };

  let result = createCSV(sess);

  let expected =
    "Participant,Which of the following are integers?\nCorrect Answers,2 & 6\nEmma,2 & 6";

  expect(result[0]).toStrictEqual(expected);
});

test("returns null for known csv string if all questions are anonymous", () => {
  const past: Question = {
    id: "5678",
    isAnonymous: true,
    timeLimit: null,
    type: "multipleChoice",
    prompt: "What is 3+3?",
    options: opt,
  };

  const resp: QuestionResponse = {
    questionId: "5678",
    participantId: "1234",
    isAnonymous: true,
    id: "91011",
    questionType: "multipleChoice",
    selectedResponse: "6",
  };

  const sess: Session = {
    code: "ABCDE",
    hostSecret: "secret",
    hostSocketId: "121314",
    participants: [part],
    endedQuestions: [past],
    activeQuestion: null,
    responses: [resp],
  };

  let result = createCSV(sess);

  let expected = null;

  expect(result[0]).toStrictEqual(expected);
});

test("returns null for anonymous csv string if all questions are not anonymous", () => {
  const sess: Session = {
    code: "ABCDE",
    hostSecret: "secret",
    hostSocketId: "121314",
    participants: [part],
    endedQuestions: [past],
    activeQuestion: null,
    responses: [resp],
  };

  let result = createCSV(sess);

  let expected = null;

  expect(result[1]).toStrictEqual(expected);
});

test("Anonymous string properly formatted for anonymous questions", () => {
  const past: Question = {
    id: "5678",
    isAnonymous: true,
    timeLimit: null,
    type: "multipleChoice",
    prompt: "What is 3+3?",
    options: opt,
  };

  const resp: QuestionResponse = {
    questionId: "5678",
    participantId: "1234",
    isAnonymous: true,
    id: "91011",
    questionType: "multipleChoice",
    selectedResponse: "6",
  };

  const sess: Session = {
    code: "ABCDE",
    hostSecret: "secret",
    hostSocketId: "121314",
    participants: [part],
    endedQuestions: [past],
    activeQuestion: null,
    responses: [resp],
  };

  let result = createCSV(sess);

  let expected = "ID,What is 3+3?\nCorrect Answers,6\n1234,6";

  expect(result[1]).toStrictEqual(expected);
});

test("Anonymous string properly formatted for anonymous questions with multiple participants and questions.", () => {
  const past: Question = {
    id: "5678",
    isAnonymous: true,
    timeLimit: null,
    type: "multipleChoice",
    prompt: "What is 3+3?",
    options: opt,
  };

  const resp: QuestionResponse = {
    questionId: "5678",
    participantId: "1234",
    isAnonymous: true,
    id: "91011",
    questionType: "multipleChoice",
    selectedResponse: "6",
  };

  const part2: Participant = {
    id: "abcd",
    secret: "secret2",
    name: "Sierra",
  };

  const opt2: AnswerChoice[] = [
    { text: "yellow", isCorrect: false },
    { text: "neon pink", isCorrect: false },
    { text: "vomit green", isCorrect: false },
    { text: "blue", isCorrect: true },
  ];

  const past2: Question = {
    id: "899091",
    isAnonymous: true,
    timeLimit: null,
    type: "multipleChoice",
    prompt: "What is the best color?",
    options: opt2,
  };

  const resp1b: QuestionResponse = {
    questionId: "899091",
    participantId: "1234",
    isAnonymous: true,
    id: "91011",
    questionType: "multipleChoice",
    selectedResponse: "blue",
  };

  const resp2a: QuestionResponse = {
    questionId: "5678",
    participantId: "abcd",
    isAnonymous: true,
    id: "91011",
    questionType: "multipleChoice",
    selectedResponse: "3",
  };

  const resp2b: QuestionResponse = {
    questionId: "899091",
    participantId: "abcd",
    isAnonymous: true,
    id: "91011",
    questionType: "multipleChoice",
    selectedResponse: "yellow",
  };

  const sess: Session = {
    code: "ABCDE",
    hostSecret: "secret",
    hostSocketId: "121314",
    participants: [part, part2],
    endedQuestions: [past, past2],
    activeQuestion: null,
    responses: [resp, resp1b, resp2a, resp2b],
  };

  let result = createCSV(sess);

  let expected =
    "ID,What is 3+3?,What is the best color?\nCorrect Answers,6,blue\n1234,6,blue\nabcd,3,yellow";

  expect(result[1]).toStrictEqual(expected);
});

test("unanswered questions left blank.", () => {
  const past: Question = {
    id: "5678",
    isAnonymous: true,
    timeLimit: null,
    type: "multipleChoice",
    prompt: "What is 3+3?",
    options: opt,
  };

  const sess: Session = {
    code: "ABCDE",
    hostSecret: "secret",
    hostSocketId: "121314",
    participants: [part],
    endedQuestions: [past],
    activeQuestion: null,
    responses: [],
  };

  let result = createCSV(sess);

  let expected = "ID,What is 3+3?\nCorrect Answers,6\n1234,";

  expect(result[1]).toStrictEqual(expected);
});

test("multipe select choice answer correctly joined in anonymous question", () => {
  const opt: AnswerChoice[] = [
    { text: "2", isCorrect: true },
    { text: "3.5", isCorrect: false },
    { text: "5.24", isCorrect: false },
    { text: "6", isCorrect: true },
  ];

  const past: Question = {
    id: "5678",
    isAnonymous: true,
    timeLimit: null,
    type: "selectMany",
    prompt: "Which of the following are integers?",
    options: opt,
  };

  const resp: QuestionResponse = {
    questionId: "5678",
    participantId: "1234",
    isAnonymous: true,
    id: "91011",
    questionType: "selectMany",
    selectedResponses: ["2", "6"],
  };

  const sess: Session = {
    code: "ABCDE",
    hostSecret: "secret",
    hostSocketId: "121314",
    participants: [part],
    endedQuestions: [past],
    activeQuestion: null,
    responses: [resp],
  };

  let result = createCSV(sess);

  let expected =
    "ID,Which of the following are integers?\nCorrect Answers,2 & 6\n1234,2 & 6";

  expect(result[1]).toStrictEqual(expected);
});

test("answers correctly assigned to non-anonymous string with multiple questions and participants", () => {
  const part2: Participant = {
    id: "abcd",
    secret: "secret2",
    name: "Sierra",
  };

  const opt2: AnswerChoice[] = [
    { text: "yellow", isCorrect: false },
    { text: "neon pink", isCorrect: false },
    { text: "vomit green", isCorrect: false },
    { text: "blue", isCorrect: true },
  ];

  const past2: Question = {
    id: "899091",
    isAnonymous: true,
    timeLimit: null,
    type: "multipleChoice",
    prompt: "What is the best color?",
    options: opt2,
  };

  const resp1b: QuestionResponse = {
    questionId: "899091",
    participantId: "1234",
    isAnonymous: true,
    id: "91011",
    questionType: "multipleChoice",
    selectedResponse: "blue",
  };

  const resp2a: QuestionResponse = {
    questionId: "5678",
    participantId: "abcd",
    isAnonymous: false,
    id: "91011",
    questionType: "multipleChoice",
    selectedResponse: "3",
  };

  const resp2b: QuestionResponse = {
    questionId: "899091",
    participantId: "abcd",
    isAnonymous: true,
    id: "91011",
    questionType: "multipleChoice",
    selectedResponse: "yellow",
  };

  const sess: Session = {
    code: "ABCDE",
    hostSecret: "secret",
    hostSocketId: "121314",
    participants: [part, part2],
    endedQuestions: [past, past2],
    activeQuestion: null,
    responses: [resp, resp1b, resp2a, resp2b],
  };

  let result = createCSV(sess);

  let expected =
    "Participant,What is 3+3?\nCorrect Answers,6\nEmma,6\nSierra,3";

  expect(result[0]).toStrictEqual(expected);
});

test("answers correctly assigned to non-anonymous string with multiple questions and participants", () => {
  const part2: Participant = {
    id: "abcd",
    secret: "secret2",
    name: "Sierra",
  };

  const opt2: AnswerChoice[] = [
    { text: "yellow", isCorrect: false },
    { text: "neon pink", isCorrect: false },
    { text: "vomit green", isCorrect: false },
    { text: "blue", isCorrect: true },
  ];

  const past2: Question = {
    id: "899091",
    isAnonymous: true,
    timeLimit: null,
    type: "multipleChoice",
    prompt: "What is the best color?",
    options: opt2,
  };

  const resp1b: QuestionResponse = {
    questionId: "899091",
    participantId: "1234",
    isAnonymous: true,
    id: "91011",
    questionType: "multipleChoice",
    selectedResponse: "blue",
  };

  const resp2a: QuestionResponse = {
    questionId: "5678",
    participantId: "abcd",
    isAnonymous: false,
    id: "91011",
    questionType: "multipleChoice",
    selectedResponse: "3",
  };

  const resp2b: QuestionResponse = {
    questionId: "899091",
    participantId: "abcd",
    isAnonymous: true,
    id: "91011",
    questionType: "multipleChoice",
    selectedResponse: "yellow",
  };

  const sess: Session = {
    code: "ABCDE",
    hostSecret: "secret",
    hostSocketId: "121314",
    participants: [part, part2],
    endedQuestions: [past, past2],
    activeQuestion: null,
    responses: [resp, resp1b, resp2a, resp2b],
  };

  let result = createCSV(sess);

  let expected =
    "ID,What is the best color?\nCorrect Answers,blue\n1234,blue\nabcd,yellow";

  expect(result[1]).toStrictEqual(expected);
});

test("all correct choices for free response questions correctly displayed when question is not anonymous.", () => {
  const past: Question = {
    id: "5678",
    isAnonymous: false,
    timeLimit: null,
    type: "freeResponse",
    prompt: "What is 3+3?",
    correctAnswers: ["6", "six", "Six"],
  };

  const resp: QuestionResponse = {
    questionId: "5678",
    participantId: "1234",
    isAnonymous: false,
    id: "91011",
    questionType: "freeResponse",
    responseText: "6",
  };

  const sess: Session = {
    code: "ABCDE",
    hostSecret: "secret",
    hostSocketId: "121314",
    participants: [part],
    endedQuestions: [past],
    activeQuestion: null,
    responses: [resp],
  };

  let result = createCSV(sess);

  let expected = "Participant,What is 3+3?\nCorrect Answers,6/six/Six\nEmma,6";

  expect(result[0]).toStrictEqual(expected);
});

test("all correct choices for free response questions correctly displayed when question is anonymous.", () => {
  const past: Question = {
    id: "5678",
    isAnonymous: true,
    timeLimit: null,
    type: "freeResponse",
    prompt: "What is 3+3?",
    correctAnswers: ["6", "six", "Six"],
  };

  const resp: QuestionResponse = {
    questionId: "5678",
    participantId: "1234",
    isAnonymous: true,
    id: "91011",
    questionType: "freeResponse",
    responseText: "6",
  };

  const sess: Session = {
    code: "ABCDE",
    hostSecret: "secret",
    hostSocketId: "121314",
    participants: [part],
    endedQuestions: [past],
    activeQuestion: null,
    responses: [resp],
  };

  let result = createCSV(sess);

  let expected = "ID,What is 3+3?\nCorrect Answers,6/six/Six\n1234,6";

  expect(result[1]).toStrictEqual(expected);
});
