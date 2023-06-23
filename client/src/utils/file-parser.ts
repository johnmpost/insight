import YAML from "yaml";
import { Question } from "../../../shared/domain/Question";
import { AnswerChoice } from "../../../shared/domain/AnswerChoice";
import { failure, Result, success } from "../../../shared/utils/Result";

export function parser(
  file: string,
  createId: () => string
): Result<Question[]> {
  try {
    const data = YAML.parse(file);
    return parse(data, createId);
  } catch (e: any) {
    return failure("Error while parsing file, invalid syntax");
  }
}

export function parse(data: any, createId: () => string): Result<Question[]> {
  const questions: Question[] = [];

  if (typeof data !== "object") {
    return failure("No object passed in to parser");
  }

  // iterate over data and parse it into question format
  for (let i = 0; i < data.length; i++) {
    const prompt = data[i].prompt ?? null;
    const type = data[i].type ?? null;
    const isAnon = data[i].isAnonymous ?? false;
    const time = data[i].timeLimit ?? null;
    let question: Question;

    if (type === null) {
      return failure("Type not valid");
    }

    // parse for free response question
    if (type === "freeResponse") {
      const answers = data[i].correctAnswers ?? null;

      question = {
        id: createId(),
        isAnonymous: isAnon,
        timeLimit: time,
        type: type,
        prompt: prompt,
        correctAnswers: answers,
      };
    } else {
      // parse for any other question type
      const answers: AnswerChoice[] = [];
      // checks that answers exists in the parsed data
      if (data[i].answers !== undefined) {
        for (let j = 0; j < data[i].answers.length; j++) {
          answers.push({
            text: data[i].answers[j].text ?? null,
            isCorrect: data[i].answers[j].isCorrect ?? false,
          });
        }
      } else {
        return failure("No answers given to this question");
      }

      question = {
        id: createId(),
        isAnonymous: isAnon,
        timeLimit: time,
        type: type,
        prompt: prompt,
        options: answers,
      };
    }

    // validate question
    const isValid = validateQuestion(question);

    if (isValid.kind === "success") {
      questions.push(question);
    } else {
      return isValid;
    }
  }

  return success(questions);
}

function validateQuestion(q: Question): Result<Question> {
  if (q.prompt === null) {
    return failure("Prompt not valid");
  }

  if (q.type !== "freeResponse") {
    for (let i = 0; i < q.options.length; i++) {
      if (q.options[i].text === null) {
        return failure("Text in answer options is not valid");
      }
    }
  }

  return success(q);
}

export function reverseParser(q: Question): Result<string> {
  try {
    return success(questionToYAML(q));
  } catch (e: any) {
    return failure("Error while turning question into YAML");
  }
}

export function questionToYAML(q: Question): string {
  let resultString: string = `- prompt: ${q.prompt}
  type: ${q.type}
  isAnonymous: ${q.isAnonymous}`;

  if (q.timeLimit !== null) {
    resultString = `${resultString}${"\n"}  timeLimit: ${q.timeLimit}`;
  }

  if (q.type === "freeResponse" && q.correctAnswers !== null) {
    resultString = `${resultString}${"\n"}  correctAnswers:`;
    for (const e of q.correctAnswers) {
      resultString = `${resultString}${"\n"}    - ${e}`;
    }
  } else if (q.type === "multipleChoice" || q.type === "selectMany") {
    resultString = `${resultString}${"\n"}  answers:`;
    for (const e of q.options) {
      resultString =
        `${resultString}${"\n"}    - text: ${e.text}${"\n"}      isCorrect: ${e.isCorrect}`;
    }
  }
  return resultString;
}
