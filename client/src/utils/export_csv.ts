import { Session } from "../../../shared/domain/Session";
import { Option } from "../../../shared/utils/Option";
import { Participant } from "../../../shared/domain/Participant";
import { Question } from "../../../shared/domain/Question";
import { QuestionResponse } from "../../../shared/domain/QuestionResponse";
import { match } from "assert";
import { SessionForHost } from "../../../shared/dtos/SessionForHost";
import { QuestionResponseForHost } from "../../../shared/dtos/QuestionResponseForHost";

export function createCSV(
  session: SessionForHost
): [string | null, string | null] {
  let headers: string[] = [];
  headers.push("Participant");
  let anonheaders: string[] = [];
  anonheaders.push("ID");

  let correct: string[] = [];
  correct.push("Correct Answers");
  let anonCorrect: string[] = [];
  anonCorrect.push("Correct Answers");

  for (let i = 0; i < session.endedQuestions.length; i++) {
    const question = session.endedQuestions[i];
    if (question.isAnonymous) {
      anonheaders.push(question.prompt);
      if (question.type === "freeResponse") {
        if (question.correctAnswers?.length !== undefined) {
          anonCorrect.push(question.correctAnswers.join("/"));
        } else {
          anonCorrect.push("");
        }
      } else if (question.type === "multipleChoice") {
        for (let j = 0; j < question.options.length; j++) {
          if (question.options[j].isCorrect) {
            anonCorrect.push(question.options[j].text);
          }
        }
      } else {
        let actual: string[] = [];
        for (let j = 0; j < question.options.length; j++) {
          if (question.options[j].isCorrect) {
            actual.push(question.options[j].text);
          }
        }
        anonCorrect.push(actual.join(" & "));
      }
    } else {
      headers.push(question.prompt);
      if (question.type === "freeResponse") {
        if (question.correctAnswers?.length !== undefined) {
          correct.push(question.correctAnswers.join("/"));
        } else {
          correct.push("");
        }
      } else if (question.type === "multipleChoice") {
        for (let j = 0; j < question.options.length; j++) {
          if (question.options[j].isCorrect) {
            correct.push(question.options[j].text);
          }
        }
      } else {
        let actual: string[] = [];
        for (let j = 0; j < question.options.length; j++) {
          if (question.options[j].isCorrect) {
            actual.push(question.options[j].text);
          }
        }
        correct.push(actual.join(" & "));
      }
    }
  }

  let rows: string[][] = [];
  rows.push(headers);
  rows.push(correct);

  let anonrows: string[][] = [];
  anonrows.push(anonheaders);
  anonrows.push(anonCorrect);

  for (let i = 0; i < session.participants.length; i++) {
    const answers: string[] = [];
    answers.push(session.participants[i].name);

    const anonAnswers: string[] = [];
    anonAnswers.push(session.participants[i].id);

    for (let j = 0; j < session.endedQuestions.length; j++) {
      let matchAns: QuestionResponseForHost | undefined =
        session.responses.find(callback_func);

      function callback_func(answer: QuestionResponseForHost): boolean {
        if (
          answer.participantId === session.participants[i].id &&
          answer.questionId === session.endedQuestions[j].id
        ) {
          return true;
        }
        return false;
      }

      if (matchAns === undefined) {
        if (session.endedQuestions[j].isAnonymous) {
          anonAnswers.push("");
        } else {
          answers.push("");
        }
      } else if (matchAns.questionType === "freeResponse") {
        if (session.endedQuestions[j].isAnonymous) {
          anonAnswers.push(matchAns.responseText);
        } else {
          answers.push(matchAns.responseText);
        }
      } else if (matchAns.questionType === "multipleChoice") {
        if (session.endedQuestions[j].isAnonymous) {
          anonAnswers.push(matchAns.selectedResponse);
        } else {
          answers.push(matchAns.selectedResponse);
        }
      } else {
        if (session.endedQuestions[j].isAnonymous) {
          anonAnswers.push(matchAns.selectedResponses.join(" & "));
        } else {
          answers.push(matchAns.selectedResponses.join(" & "));
        }
      }
    }

    rows.push(answers);
    anonrows.push(anonAnswers);
  }

  let csvContent: string | null = null;

  if (rows[0].length > 1) {
    csvContent = rows.map((e) => e.join(",")).join("\n");
  }

  let anonCSVContent: string | null = null;

  if (anonrows[0].length > 1) {
    anonCSVContent = anonrows.map((e) => e.join(",")).join("\n");
  }

  return [csvContent, anonCSVContent];
}
