import { Participant } from "../../../shared/domain/Participant";
import { Question } from "../../../shared/domain/Question";
import { QuestionResponseForHost } from "../../../shared/dtos/QuestionResponseForHost";
import { QuestionResponseForParticipant } from "../../../shared/dtos/QuestionResponseForParticipant";
import { SessionForHost } from "../../../shared/dtos/SessionForHost";
import { deepCopy } from "../../../shared/utils/deepcopy";
import { logError, logWarning } from "../../../shared/utils/log";
import { Option } from "../../../shared/utils/Option";
import { questionHasCorrectAnswer } from "../../../shared/utils/utils";

export type FrontendDataModel =
  | {
      type: "host";
      session: SessionForHost;
      sessionStatus: "inProgress" | "ended";
      timeRemaining: Option<number>;
      questionQueue: Question[];
    }
  | {
      type: "participant";
      participant: Participant;
      sessionCode: string;
      participantState:
        | {
            type: "waitingForHost";
          }
        | {
            type: "acceptingResponses";
            question: Question;
            latestResponse: Option<QuestionResponseForParticipant>;
            timeRemaining: Option<number>;
          }
        | {
            type: "showingCorrect";
            question: Question;
            latestResponse: Option<QuestionResponseForParticipant>;
          }
        | {
            type: "sessionEnded";
          };
    }
  | {
      type: "noneSelected";
    };

export type Action =
  | {
      type: "createSession";
      newSession: SessionForHost;
    }
  | {
      type: "endSession";
      completedSession: SessionForHost;
    }
  | {
      type: "newResponse";
      response: QuestionResponseForHost;
    }
  | {
      type: "newQuestion";
      question: Question;
    }
  | {
      type: "sentNewResponse";
      response: QuestionResponseForParticipant;
    }
  | {
      type: "questionClosed";
      endedQuestion: Question;
    }
  | {
      type: "doneViewingCorrect";
    }
  | {
      type: "activateQuestion";
      newQuestion: Question;
    }
  | {
      type: "closeQuestion";
    }
  | {
      type: "joinSession";
      sessionCode: string;
      participant: Participant;
    }
  | {
      type: "participantJoined";
      participant: Participant;
    }
  | {
      type: "sessionClosedByHost";
    }
  | {
      type: "updateTimer";
      timeRemaining: number;
    }
  | {
      type: "addQuestionsToQueue";
      questionsToAdd: Question[];
      insertIndex: number;
    }
  | {
      type: "removeQuestionFromQueue";
      removeIndex: number;
    }
  | {
      type: "moveQuestionUpInQueue";
      moveIndex: number;
    }
  | {
      type: "moveQuestionDownInQueue";
      moveIndex: number;
    }
  | {
      type: "editQuestionInQueue";
      updateIndex: number;
      updatedQuestion: Question;
    }
  | {
      type: "reorderQuestionQueue";
      newOrder: Question[];
    };

export const reducer = (
  state: FrontendDataModel,
  action: Action
): FrontendDataModel => {
  switch (action.type) {
    case "createSession":
      if (state.type !== "noneSelected") {
        logError("cannot create a session if in one already");
        return state;
      }
      return {
        type: "host",
        timeRemaining: null,
        session: action.newSession,
        sessionStatus: "inProgress",
        questionQueue: [],
      };

    case "endSession":
      if (state.type !== "host") {
        logError("cannot end a session if not the host");
        return state;
      }
      if (state.session.activeQuestion !== null) {
        logError("cannot end session if there is an active question");
        return state;
      }
      return {
        ...state,
        session: action.completedSession,
        sessionStatus: "ended",
      };

    case "newResponse":
      if (state.type !== "host") {
        logError("cannot receive a new response if not the host");
        return state;
      }

      const addOrUpdateResponse = (
        responses: QuestionResponseForHost[],
        newResponse: QuestionResponseForHost
      ) => {
        const indexToUpdate = responses.findIndex(
          (response) => response.id === action.response.id
        );
        if (indexToUpdate === -1) {
          return [...responses, newResponse];
        } else {
          const newResponses = deepCopy(responses);
          newResponses[indexToUpdate] = newResponse;
          return newResponses;
        }
      };

      const newResponses = addOrUpdateResponse(
        state.session.responses,
        action.response
      );

      return {
        ...state,
        session: {
          ...state.session,
          responses: newResponses,
        },
      };

    case "newQuestion":
      if (state.type !== "participant") {
        logError("cannot receive a new question if not the participant");
        return state;
      }
      if (state.participantState.type === "acceptingResponses") {
        logWarning(
          "should not have had a new question while there was still an active question"
        );
      }
      return {
        ...state,
        participantState: {
          type: "acceptingResponses",
          question: action.question,
          latestResponse: null,
          timeRemaining: null,
        },
      };

    case "sentNewResponse":
      if (state.type !== "participant") {
        logError("cannot send a new response if not a participant");
        return state;
      }
      if (state.participantState.type !== "acceptingResponses") {
        logError("cannot send a new response if not accepting responses");
        return state;
      }

      return {
        ...state,
        participantState: {
          ...state.participantState,
          latestResponse: action.response,
        },
      };

    case "questionClosed":
      if (state.type !== "participant") {
        logError(
          "cannot have a question close on a user that is not a participant"
        );
        return state;
      }
      if (state.participantState.type !== "acceptingResponses") {
        logError(
          "cannot have closed a question when there wasn't an active question"
        );
        return state;
      }

      const hasCorrect = questionHasCorrectAnswer(action.endedQuestion);
      return hasCorrect
        ? {
            ...state,
            participantState: {
              type: "showingCorrect",
              question: action.endedQuestion,
              latestResponse: state.participantState.latestResponse,
            },
          }
        : { ...state, participantState: { type: "waitingForHost" } };

    case "doneViewingCorrect":
      if (state.type !== "participant") {
        logError("cannot stop viewing correct if not a participant");
        return state;
      }
      return {
        ...state,
        participantState: {
          type: "waitingForHost",
        },
      };

    case "closeQuestion":
      if (state.type !== "host") {
        logError("cannot close a question if not the host");
        return state;
      }
      if (state.session.activeQuestion === null) {
        logError("cannot close a question if there is no active question");
        return state;
      }
      return {
        ...state,
        timeRemaining: null,
        session: {
          ...state.session,
          activeQuestion: null,
          endedQuestions: [
            ...state.session.endedQuestions,
            state.session.activeQuestion,
          ],
        },
      };

    case "activateQuestion":
      if (state.type !== "host") {
        logError("cannot activate a question if not the host");
        return state;
      }
      if (state.session.activeQuestion !== null) {
        logError(
          "cannot activate a question if there is already an active question"
        );
        return state;
      }
      return {
        ...state,
        session: {
          ...state.session,
          activeQuestion: action.newQuestion,
        },
      };

    case "joinSession":
      if (state.type !== "noneSelected") {
        logError("cannot join a session if already in one");
        return state;
      }
      return {
        type: "participant",
        participantState: {
          type: "waitingForHost",
        },
        sessionCode: action.sessionCode,
        participant: action.participant,
      };

    case "participantJoined":
      if (state.type !== "host") {
        logError("cannot receive a participant join msg if not the host");
        return state;
      }
      return {
        ...state,
        session: {
          ...state.session,
          participants: [...state.session.participants, action.participant],
        },
      };

    case "sessionClosedByHost":
      if (state.type !== "participant") {
        logError(
          "cannot receive a session ended by host msg if not a participant"
        );
        return state;
      }
      return {
        ...state,
        participantState: {
          type: "sessionEnded",
        },
      };

    case "updateTimer":
      return state.type === "noneSelected"
        ? (logError("cannot update timer if not in a session"), state)
        : state.type === "host"
        ? { ...state, timeRemaining: action.timeRemaining }
        : state.participantState.type === "acceptingResponses"
        ? {
            ...state,
            participantState: {
              ...state.participantState,
              timeRemaining: action.timeRemaining,
            },
          }
        : (logError("cannot update timer if not accepting responses"), state);

    case "addQuestionsToQueue":
      return state.type !== "host"
        ? (logError("cannot add to queue if not the host"), state)
        : {
            ...state,
            questionQueue: [
              ...state.questionQueue.slice(0, action.insertIndex),
              ...action.questionsToAdd,
              ...state.questionQueue.slice(action.insertIndex),
            ],
          };

    case "removeQuestionFromQueue":
      return state.type !== "host"
        ? (logError("cannot remove from queue if not the host"), state)
        : {
            ...state,
            questionQueue: [
              ...state.questionQueue.slice(0, action.removeIndex),
              ...state.questionQueue.slice(action.removeIndex + 1),
            ],
          };

    case "editQuestionInQueue":
      return state.type !== "host"
        ? (logError("cannot edit queue if not the host"), state)
        : {
            ...state,
            questionQueue: [
              ...state.questionQueue.slice(0, action.updateIndex),
              action.updatedQuestion,
              ...state.questionQueue.slice(action.updateIndex + 1),
            ],
          };

    case "moveQuestionUpInQueue":
      return state.type !== "host"
        ? (logError("cannot move question up in queue if not the host"), state)
        : action.moveIndex === 0
        ? (logError("cannot move first question up in queue"), state)
        : {
            ...state,
            questionQueue: [
              ...state.questionQueue.slice(0, action.moveIndex - 1),
              state.questionQueue[action.moveIndex],
              state.questionQueue[action.moveIndex - 1],
              ...state.questionQueue.slice(action.moveIndex + 1),
            ],
          };

    case "moveQuestionDownInQueue":
      return state.type !== "host"
        ? (logError("cannot move question down in queue if not the host"),
          state)
        : action.moveIndex === state.questionQueue.length - 1
        ? (logError("cannot move last question down in queue"), state)
        : {
            ...state,
            questionQueue: [
              ...state.questionQueue.slice(0, action.moveIndex),
              state.questionQueue[action.moveIndex + 1],
              state.questionQueue[action.moveIndex],
              ...state.questionQueue.slice(action.moveIndex + 2),
            ],
          };

    case "reorderQuestionQueue":
      return state.type !== "host"
        ? (logError("cannot reorder queue if not the host"), state)
        : {
            ...state,
            questionQueue: action.newOrder,
          };
  }
};
