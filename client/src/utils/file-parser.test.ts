import { Question } from "../../../shared/domain/Question";
import { parser, reverseParser } from "./file-parser";

function testCreateId(): string {
  return "123456";
}

test("testFailureWhenInValidYamlPassedIn", () => {
  const res = parser(
    `- prompt: "What is your favorite color?"
  type: "multipleChoice"
  isAnonymous: false
  timeLimit: 60
  answers:
    isCorrect: false
    - text: "Orange"
      isCorrect: true
    - text: "Blue"
      isCorrect: false
    - text: "Green"
      isCorrect: false`,
    testCreateId
  );

  let expected = {
    kind: "failure",
    msg: "Error while parsing file, invalid syntax",
  };

  expect(res).toStrictEqual(expected);
});

test("testFailureWhenNoObjectPassedIn", () => {
  const res = parser("not-yaml", testCreateId);
  let expected = { kind: "failure", msg: "No object passed in to parser" };
  expect(res).toStrictEqual(expected);
});

test("testOneFreeResponseHappyPath", () => {
  const res = parser(
    `- prompt: "What is your favorite color?"
  type: "freeResponse"
  isAnonymous: true
  timeLimit: 60
  correctAnswers:
    - "Red"
    - "Orange"`,
    testCreateId
  );

  let expected = {
    kind: "success",
    value: [
      {
        correctAnswers: ["Red", "Orange"],
        id: "123456",
        isAnonymous: true,
        prompt: "What is your favorite color?",
        timeLimit: 60,
        type: "freeResponse",
      },
    ],
  };

  expect(res).toStrictEqual(expected);
});

test("testOneMultipleChoiceHappyPath", () => {
  const res = parser(
    `- prompt: "What is your favorite color?"
  type: "multipleChoice"
  isAnonymous: false
  timeLimit: 75
  answers:
    - text: "Red"
      isCorrect: false
    - text: "Orange"
      isCorrect: true
    - text: "Blue"
      isCorrect: false
    - text: "Green"
      isCorrect: false`,
    testCreateId
  );

  let expected = {
    kind: "success",
    value: [
      {
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
      },
    ],
  };

  expect(res).toStrictEqual(expected);
});

test("testOneMultipleSelectHappyPath", () => {
  const res = parser(
    `- prompt: "What is your favorite color?"
  type: "selectMany"
  isAnonymous: false
  timeLimit: 45
  answers:
    - text: "Red"
      isCorrect: false
    - text: "Orange"
      isCorrect: true
    - text: "Blue"
      isCorrect: false
    - text: "Green"
      isCorrect: true`,
    testCreateId
  );

  let expected = {
    kind: "success",
    value: [
      {
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
      },
    ],
  };
  expect(res).toStrictEqual(expected);
});

test("testOneOfEachQuestionTypeTogether", () => {
  const res = parser(
    `- prompt: "What is your favorite color?"
  type: "freeResponse"
  isAnonymous: true
  timeLimit: 60
  correctAnswers:
    - "Red"
    - "Orange"
- prompt: "What is your favorite color?"
  type: "multipleChoice"
  isAnonymous: false
  timeLimit: 75
  answers:
    - text: "Red"
      isCorrect: false
    - text: "Orange"
      isCorrect: true
    - text: "Blue"
      isCorrect: false
    - text: "Green"
      isCorrect: false
- prompt: "What is your favorite color?"
  type: "selectMany"
  isAnonymous: false
  timeLimit: 45
  answers:
    - text: "Red"
      isCorrect: false
    - text: "Orange"
      isCorrect: true
    - text: "Blue"
      isCorrect: false
    - text: "Green"
      isCorrect: true
`,
    testCreateId
  );

  let expected = {
    kind: "success",
    value: [
      {
        correctAnswers: ["Red", "Orange"],
        id: "123456",
        isAnonymous: true,
        prompt: "What is your favorite color?",
        timeLimit: 60,
        type: "freeResponse",
      },
      {
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
      },
      {
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
      },
    ],
  };

  expect(res).toStrictEqual(expected);
});

test("testOneFreeResponseTimeLimitUndefined", () => {
  const res = parser(
    `- prompt: "What is your favorite color?"
  type: "freeResponse"
  isAnonymous: true
  correctAnswers:
    - "Red"
    - "Orange"`,
    testCreateId
  );

  let expected = {
    kind: "success",
    value: [
      {
        correctAnswers: ["Red", "Orange"],
        id: "123456",
        isAnonymous: true,
        prompt: "What is your favorite color?",
        timeLimit: null,
        type: "freeResponse",
      },
    ],
  };

  expect(res).toStrictEqual(expected);
});

test("testOneMultipleChoiceTimeLimitUndefined", () => {
  const res = parser(
    `- prompt: "What is your favorite color?"
  type: "multipleChoice"
  isAnonymous: false
  answers:
    - text: "Red"
      isCorrect: false
    - text: "Orange"
      isCorrect: true
    - text: "Blue"
      isCorrect: false
    - text: "Green"
      isCorrect: false`,
    testCreateId
  );

  let expected = {
    kind: "success",
    value: [
      {
        id: "123456",
        isAnonymous: false,
        options: [
          { isCorrect: false, text: "Red" },
          { isCorrect: true, text: "Orange" },
          { isCorrect: false, text: "Blue" },
          { isCorrect: false, text: "Green" },
        ],
        prompt: "What is your favorite color?",
        timeLimit: null,
        type: "multipleChoice",
      },
    ],
  };

  expect(res).toStrictEqual(expected);
});

test("testOneMultipleSelectTimeLimitUndefined", () => {
  const res = parser(
    `- prompt: "What is your favorite color?"
  type: "selectMany"
  isAnonymous: false
  answers:
    - text: "Red"
      isCorrect: false
    - text: "Orange"
      isCorrect: true
    - text: "Blue"
      isCorrect: false
    - text: "Green"
      isCorrect: true`,
    testCreateId
  );

  let expected = {
    kind: "success",
    value: [
      {
        id: "123456",
        isAnonymous: false,
        options: [
          { isCorrect: false, text: "Red" },
          { isCorrect: true, text: "Orange" },
          { isCorrect: false, text: "Blue" },
          { isCorrect: true, text: "Green" },
        ],
        prompt: "What is your favorite color?",
        timeLimit: null,
        type: "selectMany",
      },
    ],
  };
  expect(res).toStrictEqual(expected);
});

test("testFreeResponseCorrectAnswersUndefined", () => {
  const res = parser(
    `- prompt: "What is your favorite color?"
  type: "freeResponse"
  isAnonymous: true
  timeLimit: 60`,
    testCreateId
  );

  let expected = {
    kind: "success",
    value: [
      {
        correctAnswers: null,
        id: "123456",
        isAnonymous: true,
        prompt: "What is your favorite color?",
        timeLimit: 60,
        type: "freeResponse",
      },
    ],
  };

  expect(res).toStrictEqual(expected);
});

test("testMultipleChoiceFailureIfNoAnswers", () => {
  const res = parser(
    `- prompt: "What is your favorite color?"
  type: "multipleChoice"
  isAnonymous: false
  timeLimit: 60`,
    testCreateId
  );

  let expected = { kind: "failure", msg: "No answers given to this question" };

  expect(res).toStrictEqual(expected);
});

test("testSelectManyFailureIfNoAnswers", () => {
  const res = parser(
    `- prompt: "What is your favorite color?"
  type: "selectMany"
  isAnonymous: false
  timeLimit: 60`,
    testCreateId
  );

  let expected = { kind: "failure", msg: "No answers given to this question" };

  expect(res).toStrictEqual(expected);
});

test("testMultipleChoiceFailureNoPrompt", () => {
  const res = parser(
    `- type: "multipleChoice"
  isAnonymous: false
  timeLimit: 60
  answers:
    - text: "Red"
      isCorrect: false
    - text: "Orange"
      isCorrect: true
    - text: "Blue"
      isCorrect: false
    - text: "Green"
      isCorrect: false`,
    testCreateId
  );

  let expected = { kind: "failure", msg: "Prompt not valid" };
  expect(res).toStrictEqual(expected);
});

test("testMultipleChoiceFailureNoType", () => {
  const res = parser(
    `- prompt: "What is your favorite color?"
  isAnonymous: false
  timeLimit: 60
  answers:
    - text: "Red"
      isCorrect: false
    - text: "Orange"
      isCorrect: true
    - text: "Blue"
      isCorrect: false
    - text: "Green"
      isCorrect: false`,
    testCreateId
  );

  let expected = { kind: "failure", msg: "Type not valid" };

  expect(res).toStrictEqual(expected);
});

test("testMultipleChoiceFailureNoIsAnon", () => {
  const res = parser(
    `- prompt: "What is your favorite color?"
  type: "multipleChoice"
  timeLimit: 60
  answers:
    - text: "Red"
      isCorrect: false
    - text: "Orange"
      isCorrect: true
    - text: "Blue"
      isCorrect: false
    - text: "Green"
      isCorrect: false`,
    testCreateId
  );

  let expected = {
    kind: "success",
    value: [
      {
        id: "123456",
        isAnonymous: false,
        options: [
          { isCorrect: false, text: "Red" },
          { isCorrect: true, text: "Orange" },
          { isCorrect: false, text: "Blue" },
          { isCorrect: false, text: "Green" },
        ],
        prompt: "What is your favorite color?",
        timeLimit: 60,
        type: "multipleChoice",
      },
    ],
  };

  expect(res).toStrictEqual(expected);
});

test("testMultipleChoiceFailureNoTextInAnswers", () => {
  const res = parser(
    `- prompt: "What is your favorite color?"
  type: "multipleChoice"
  isAnonymous: false
  timeLimit: 60
  answers:
    - isCorrect: false
    - text: "Orange"
      isCorrect: true
    - text: "Blue"
      isCorrect: false
    - text: "Green"
      isCorrect: false`,
    testCreateId
  );

  let expected = {
    kind: "failure",
    msg: "Text in answer options is not valid",
  };

  expect(res).toStrictEqual(expected);
});

test("testMultipleChoiceFailureNoIsCorrectInAnswers", () => {
  const res = parser(
    `- prompt: "What is your favorite color?"
  type: "multipleChoice"
  isAnonymous: false
  timeLimit: 60
  answers:
    - text: "Red"
    - text: "Orange"
    - text: "Blue"
    - text: "Green"`,
    testCreateId
  );

  let expected = {
    kind: "success",
    value: [
      {
        id: "123456",
        isAnonymous: false,
        options: [
          { isCorrect: false, text: "Red" },
          { isCorrect: false, text: "Orange" },
          { isCorrect: false, text: "Blue" },
          { isCorrect: false, text: "Green" },
        ],
        prompt: "What is your favorite color?",
        timeLimit: 60,
        type: "multipleChoice",
      },
    ],
  };

  expect(res).toStrictEqual(expected);
});

test("testFreeResponseFailureNoPrompt", () => {
  const res = parser(
    `- type: "freeResponse"
  isAnonymous: true
  timeLimit: 60
  correctAnswers:
    - "Red"
    - "Orange"`,
    testCreateId
  );

  let expected = {
    kind: "failure",
    msg: "Prompt not valid",
  };

  expect(res).toStrictEqual(expected);
});

test("testFreeResponseFailureNoType", () => {
  const res = parser(
    `- prompt: "What is your favorite color?"
  isAnonymous: true
  timeLimit: 60
  correctAnswers:
    - "Red"
    - "Orange"`,
    testCreateId
  );

  let expected = {
    kind: "failure",
    msg: "Type not valid",
  };

  expect(res).toStrictEqual(expected);
});

test("testFreeResponseFailureNoIsAnon", () => {
  const res = parser(
    `- prompt: "What is your favorite color?"
  type: "freeResponse"
  timeLimit: 60
  correctAnswers:
    - "Red"
    - "Orange"`,
    testCreateId
  );

  let expected = {
    kind: "success",
    value: [
      {
        correctAnswers: ["Red", "Orange"],
        id: "123456",
        isAnonymous: false,
        prompt: "What is your favorite color?",
        timeLimit: 60,
        type: "freeResponse",
      },
    ],
  };

  expect(res).toStrictEqual(expected);
});

test("testReverseParserFreeResponse", () => {
  let q: Question = {
    correctAnswers: ["Red", "Orange"],
    id: "123456",
    isAnonymous: false,
    prompt: "What is your favorite color?",
    timeLimit: 60,
    type: "freeResponse",
  };
  const res = reverseParser(q);

  let expected = {
    kind: "success",
    value:
      "- prompt: What is your favorite color?\n" +
      "  type: freeResponse\n" +
      "  isAnonymous: false\n" +
      "  timeLimit: 60\n" +
      "  correctAnswers:\n" +
      "    - Red\n" +
      "    - Orange",
  };

  expect(res).toStrictEqual(expected);
});

test("testReverseParserMultipleChoice", () => {
  let q: Question = {
    id: "123456",
    isAnonymous: false,
    options: [
      { isCorrect: false, text: "Red" },
      { isCorrect: true, text: "Orange" },
      { isCorrect: false, text: "Blue" },
      { isCorrect: false, text: "Green" },
    ],
    prompt: "What is your favorite color?",
    timeLimit: 60,
    type: "multipleChoice",
  };
  const res = reverseParser(q);

  let expected = {
    kind: "success",
    value:
      "- prompt: What is your favorite color?\n" +
      "  type: multipleChoice\n" +
      "  isAnonymous: false\n" +
      "  timeLimit: 60\n" +
      "  answers:\n" +
      "    - text: Red\n" +
      "      isCorrect: false\n" +
      "    - text: Orange\n" +
      "      isCorrect: true\n" +
      "    - text: Blue\n" +
      "      isCorrect: false\n" +
      "    - text: Green\n" +
      "      isCorrect: false",
  };

  expect(res).toStrictEqual(expected);
});

test("testReverseParserSelectMany", () => {
  let q: Question = {
    id: "123456",
    isAnonymous: false,
    options: [
      { isCorrect: false, text: "Red" },
      { isCorrect: true, text: "Orange" },
      { isCorrect: false, text: "Blue" },
      { isCorrect: true, text: "Green" },
    ],
    prompt: "What is your favorite color?",
    timeLimit: 60,
    type: "selectMany",
  };
  const res = reverseParser(q);

  let expected = {
    kind: "success",
    value:
      "- prompt: What is your favorite color?\n" +
      "  type: selectMany\n" +
      "  isAnonymous: false\n" +
      "  timeLimit: 60\n" +
      "  answers:\n" +
      "    - text: Red\n" +
      "      isCorrect: false\n" +
      "    - text: Orange\n" +
      "      isCorrect: true\n" +
      "    - text: Blue\n" +
      "      isCorrect: false\n" +
      "    - text: Green\n" +
      "      isCorrect: true",
  };

  expect(res).toStrictEqual(expected);
});

test("testReverseParserFreeResponseNoCorrectAnswers", () => {
  let q: Question = {
    correctAnswers: null,
    id: "123456",
    isAnonymous: false,
    prompt: "What is your favorite color?",
    timeLimit: 60,
    type: "freeResponse",
  };
  const res = reverseParser(q);

  let expected = {
    kind: "success",
    value:
      "- prompt: What is your favorite color?\n" +
      "  type: freeResponse\n" +
      "  isAnonymous: false\n" +
      "  timeLimit: 60",
  };

  expect(res).toStrictEqual(expected);
});

test("testReverseParserMultipleChoiceNoTimeLimit", () => {
  let q: Question = {
    id: "123456",
    isAnonymous: false,
    options: [
      { isCorrect: false, text: "Red" },
      { isCorrect: true, text: "Orange" },
      { isCorrect: false, text: "Blue" },
      { isCorrect: true, text: "Green" },
    ],
    prompt: "What is your favorite color?",
    timeLimit: null,
    type: "selectMany",
  };
  const res = reverseParser(q);

  let expected = {
    kind: "success",
    value:
      "- prompt: What is your favorite color?\n" +
      "  type: selectMany\n" +
      "  isAnonymous: false\n" +
      "  answers:\n" +
      "    - text: Red\n" +
      "      isCorrect: false\n" +
      "    - text: Orange\n" +
      "      isCorrect: true\n" +
      "    - text: Blue\n" +
      "      isCorrect: false\n" +
      "    - text: Green\n" +
      "      isCorrect: true",
  };

  expect(res).toStrictEqual(expected);
});

test("testReverseParserSelectManyNoTimeLimit", () => {
  let q: Question = {
    id: "123456",
    isAnonymous: false,
    options: [
      { isCorrect: false, text: "Red" },
      { isCorrect: true, text: "Orange" },
      { isCorrect: false, text: "Blue" },
      { isCorrect: true, text: "Green" },
    ],
    prompt: "What is your favorite color?",
    timeLimit: null,
    type: "selectMany",
  };
  const res = reverseParser(q);

  let expected = {
    kind: "success",
    value:
      "- prompt: What is your favorite color?\n" +
      "  type: selectMany\n" +
      "  isAnonymous: false\n" +
      "  answers:\n" +
      "    - text: Red\n" +
      "      isCorrect: false\n" +
      "    - text: Orange\n" +
      "      isCorrect: true\n" +
      "    - text: Blue\n" +
      "      isCorrect: false\n" +
      "    - text: Green\n" +
      "      isCorrect: true",
  };

  expect(res).toStrictEqual(expected);
});

test("testResultingStringParsesCorrectlyFreeResponse", () => {
  let q: Question = {
    correctAnswers: ["Red", "Orange"],
    id: "123456",
    isAnonymous: false,
    prompt: "What is your favorite color?",
    timeLimit: 60,
    type: "freeResponse",
  };
  const res = reverseParser(q);

  let result = null;
  if (res.kind === "success") {
    result = parser(res.value, testCreateId);
  }

  let expected = {
    kind: "success",
    value: [
      {
        correctAnswers: ["Red", "Orange"],
        id: "123456",
        isAnonymous: false,
        prompt: "What is your favorite color?",
        timeLimit: 60,
        type: "freeResponse",
      },
    ],
  };

  expect(result).toStrictEqual(expected);
});

test("testResultingStringParsesCorrectlyMultipleChoice", () => {
  let q: Question = {
    id: "123456",
    isAnonymous: false,
    options: [
      { isCorrect: false, text: "Red" },
      { isCorrect: false, text: "Orange" },
      { isCorrect: true, text: "Blue" },
      { isCorrect: false, text: "Green" },
    ],
    prompt: "What is your favorite color?",
    timeLimit: 60,
    type: "multipleChoice",
  };
  const res = reverseParser(q);

  let result = null;
  if (res.kind === "success") {
    result = parser(res.value, testCreateId);
  }

  let expected = {
    kind: "success",
    value: [
      {
        id: "123456",
        isAnonymous: false,
        options: [
          { isCorrect: false, text: "Red" },
          { isCorrect: false, text: "Orange" },
          { isCorrect: true, text: "Blue" },
          { isCorrect: false, text: "Green" },
        ],
        prompt: "What is your favorite color?",
        timeLimit: 60,
        type: "multipleChoice",
      },
    ],
  };

  expect(result).toStrictEqual(expected);
});

test("testResultingStringParsesCorrectlySelectMany", () => {
  let q: Question = {
    id: "123456",
    isAnonymous: false,
    options: [
      { isCorrect: true, text: "Red" },
      { isCorrect: false, text: "Orange" },
      { isCorrect: true, text: "Blue" },
      { isCorrect: false, text: "Green" },
    ],
    prompt: "What is your favorite color?",
    timeLimit: 60,
    type: "selectMany",
  };
  const res = reverseParser(q);

  let result = null;
  if (res.kind === "success") {
    result = parser(res.value, testCreateId);
  }

  let expected = {
    kind: "success",
    value: [
      {
        id: "123456",
        isAnonymous: false,
        options: [
          { isCorrect: true, text: "Red" },
          { isCorrect: false, text: "Orange" },
          { isCorrect: true, text: "Blue" },
          { isCorrect: false, text: "Green" },
        ],
        prompt: "What is your favorite color?",
        timeLimit: 60,
        type: "selectMany",
      },
    ],
  };

  expect(result).toStrictEqual(expected);
});
