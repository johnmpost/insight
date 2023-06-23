import { WSEvents } from "../../../shared/domain/WebsocketEvents";
import { v4 as uuidv4 } from "uuid";
import { Request, Response } from "express";
import { JoinSessionRequest } from "../../../shared/dtos/JoinSessionRequest";
import { Question } from "../../../shared/domain/Question";
import { QuestionResponse } from "../../../shared/domain/QuestionResponse";
import { Server, Socket } from "socket.io";
import { Session } from "../../../shared/domain/Session";
import {
  Result,
  bind,
  bindAsync,
  combine,
  combine3,
  failure,
  map,
  mapAsync,
  process,
  success,
} from "../../../shared/utils/Result";
import { Participant } from "../../../shared/domain/Participant";
import {
  createEmptySession,
  createParticipant,
  ensureNotAlreadyInRoom,
  getHeader,
  getSocket,
  questionResponseForParticipantToQuestionResponse,
  questionResponseToQuestionResponseForHost,
  removeAnswersFromQuestion,
  sessionToSessionForHost,
} from "../utils/route-utils";
import { QuestionResponseForParticipant } from "../../../shared/dtos/QuestionResponseForParticipant";
import {
  AsyncCrdAPI,
  AsyncCrudAPI,
  AsyncUniqueValueStoreAPI,
} from "../utils/storage-apis";
import { countdownTimer } from "../utils/countdownTimer";

type SessionCodeRouteParam = {
  sessionCode: string;
};

export const createSession =
  (
    crud: AsyncCrudAPI<Session>,
    io: Server,
    codesRepo: AsyncUniqueValueStoreAPI<string>
  ) =>
  async (req: Request, res: Response) => {
    const socketId = getHeader(req, "X-Socket-ID");

    const socket = bind(getSocket(io))(socketId);

    const socketNotInRoom = bind(ensureNotAlreadyInRoom)(socket);

    const newSession = bindAsync<Socket, Session>(async (socket: Socket) => {
      const newSession = await createEmptySession(codesRepo, socket.id);
      const created = await crud.create(newSession.code, newSession);
      return created;
    })(socketNotInRoom);

    const joinedSession = map(([socket, session]: [Socket, Session]) => {
      socket.join(session.code);
      return session;
    })(combine(socketNotInRoom, await newSession));

    return process(
      joinedSession,
      (newSession) => res.status(200).json(sessionToSessionForHost(newSession)),
      (errorMsg) => res.status(400).send(errorMsg)
    );
  };

export const checkSessionExists =
  (crud: AsyncCrdAPI<Session>) =>
  async (req: Request<SessionCodeRouteParam>, res: Response) => {
    const { sessionCode } = req.params;

    const session = await crud.read(sessionCode);

    return process(
      session,
      (exists) => res.status(200).json({ sessionExists: true }),
      (notExists) => res.status(200).json({ sessionExists: false })
    );
  };

export const endSession =
  (
    crud: AsyncCrudAPI<Session>,
    io: Server,
    codesRepo: AsyncUniqueValueStoreAPI<string>
  ) =>
  async (req: Request<SessionCodeRouteParam>, res: Response) => {
    const { sessionCode } = req.params;

    const hostSecret = getHeader(req, "X-Host-Secret");

    const session = await crud.read(sessionCode);

    const sessionMatchingSecret = bind(
      ([session, hostSecret]: [Session, string]) =>
        session.hostSecret === hostSecret
          ? success(session)
          : failure("Host secret does not match")
    )(combine(session, hostSecret));

    const sessionEndedQuestion = bind((session: Session) =>
      session.activeQuestion === null
        ? success(session)
        : failure("Session still has an active question")
    )(sessionMatchingSecret);

    const disconnectedSockets = map((session: Session) => {
      io.to(session.code).emit(WSEvents.sessionEnded);
      io.in(session.code).disconnectSockets(true);
      return session;
    })(sessionEndedQuestion);

    const endedSession = await bindAsync((session: Session) =>
      crud.deleteKey(session.code)
    )(disconnectedSockets);

    const releasedCode = await mapAsync(async (session: Session) => {
      await codesRepo.release(session.code);
      return session;
    })(endedSession);

    return process(
      releasedCode,
      (endedSession) =>
        res.status(200).json(sessionToSessionForHost(endedSession)),
      (errorMsg) => res.status(400).send(errorMsg)
    );
  };

export const joinSession =
  (crud: AsyncCrudAPI<Session>, io: Server) =>
  async (
    req: Request<SessionCodeRouteParam, {}, JoinSessionRequest>,
    res: Response
  ) => {
    const { sessionCode } = req.params;
    const { name } = req.body;

    const socketId = getHeader(req, "X-Socket-ID");

    const socket = bind(getSocket(io))(socketId);

    const socketInNoRooms = bind(ensureNotAlreadyInRoom)(socket);

    const session = await crud.read(sessionCode);

    const newParticipant = createParticipant(name);

    const addedParticipant = await bindAsync(async (session: Session) =>
      crud.update(session.code, (toUpdate) => {
        toUpdate.participants.push(newParticipant);
        return success(toUpdate);
      })
    )(session);

    const joinedSession = map(([socket, session]: [Socket, Session]) => {
      socket.join(session.code);
      return session;
    })(combine(socketInNoRooms, addedParticipant));

    const notifiedHost = map((session: Session) => {
      io.to(session.hostSocketId).emit(
        WSEvents.participantJoined,
        newParticipant
      );
      return undefined;
    })(joinedSession);

    return process(
      notifiedHost,
      (_) => res.status(200).json(newParticipant),
      (errorMsg) => res.status(400).send(errorMsg)
    );
  };

export const activateQuestion =
  (
    crud: AsyncCrudAPI<Session>,
    io: Server,
    timersRepo: AsyncCrdAPI<NodeJS.Timer>
  ) =>
  async (req: Request<SessionCodeRouteParam, {}, Question>, res: Response) => {
    const { sessionCode } = req.params;
    const newQuestion = req.body;

    const hostSecret = getHeader(req, "X-Host-Secret");

    const session = await crud.read(sessionCode);

    const sessionMatchingSecret = bind(
      ([session, hostSecret]: [Session, string]) =>
        session.hostSecret === hostSecret
          ? success(session)
          : failure("Host secret does not match")
    )(combine(session, hostSecret));

    const sessionNoActiveQuestion = bind((session: Session) =>
      session.activeQuestion === null
        ? success(session)
        : failure("Session already has an active question")
    )(sessionMatchingSecret);

    const sessionNewActiveQuestion = await bindAsync((session: Session) =>
      crud.update(session.code, (session) => {
        session.activeQuestion = newQuestion;
        return success(session);
      })
    )(sessionNoActiveQuestion);

    const questionSentToWS = map((session: Session) => {
      io.to(session.code).emit(
        WSEvents.newQuestion,
        removeAnswersFromQuestion(session.activeQuestion as Question)
      );
      return undefined;
    })(sessionNewActiveQuestion);

    const createdTimerIfRequired = await mapAsync(async (session: Session) => {
      if (session.activeQuestion?.timeLimit) {
        const oneSecond = 1000;
        const notifyWS = (countRemaining: number) =>
          io.to(session.code).emit(WSEvents.timerUpdate, countRemaining);
        const closeQuestion = async () => {
          await timersRepo.deleteKey(session.code);

          await crud.update(session.code, (session) => {
            session.endedQuestions.push(session.activeQuestion as Question);
            session.activeQuestion = null;
            return success(session);
          });

          io.to(session.code).emit(
            WSEvents.questionEnded,
            session.activeQuestion
          );
        };

        const timer = countdownTimer(
          oneSecond,
          session.activeQuestion.timeLimit,
          notifyWS,
          closeQuestion
        );
        await timersRepo.create(session.code, timer);
      }
    })(sessionNewActiveQuestion);

    return process(
      questionSentToWS,
      (_) => res.status(200).send(),
      (errorMsg) => res.status(400).send(errorMsg)
    );
  };

export const closeQuestion =
  (
    crud: AsyncCrudAPI<Session>,
    io: Server,
    timersRepo: AsyncCrdAPI<NodeJS.Timer>
  ) =>
  async (req: Request<SessionCodeRouteParam>, res: Response) => {
    const { sessionCode } = req.params;

    const hostSecret = getHeader(req, "X-Host-Secret");

    const session = await crud.read(sessionCode);

    const sessionMatchingSecret = bind(
      ([session, hostSecret]: [Session, string]) =>
        session.hostSecret === hostSecret
          ? success(session)
          : failure("Host secret does not match")
    )(combine(session, hostSecret));

    const sessionWithActiveQuestion = bind((session: Session) =>
      session.activeQuestion !== null
        ? success(session)
        : failure("Session does not have an active question")
    )(sessionMatchingSecret);

    const closedQuestion = map(
      (session: Session) => session.activeQuestion as Question
    )(sessionWithActiveQuestion);

    const sessionNoActiveQuestion = await bindAsync((session: Session) =>
      crud.update(session.code, (session) => {
        session.endedQuestions.push(session.activeQuestion as Question);
        session.activeQuestion = null;
        return success(session);
      })
    )(sessionWithActiveQuestion);

    const endedTimer = await mapAsync(async (session: Session) => {
      const timer = await timersRepo.deleteKey(session.code);
      map(clearInterval)(timer);
      return undefined;
    })(sessionNoActiveQuestion);

    const wsInformedEnded = map(
      ([session, closedQuestion, _]: [Session, Question, undefined]) => {
        io.to(session.code).emit(WSEvents.questionEnded, closedQuestion);
        return undefined;
      }
    )(combine3(sessionNoActiveQuestion, closedQuestion, endedTimer));

    return process(
      wsInformedEnded,
      (_) => res.status(200).send(),
      (errorMsg) => res.status(400).send(errorMsg)
    );
  };

export const respondToQuestion =
  (crud: AsyncCrudAPI<Session>, io: Server) =>
  async (
    req: Request<SessionCodeRouteParam, {}, QuestionResponseForParticipant>,
    res: Response
  ) => {
    const { sessionCode } = req.params;
    const newResponse = req.body;

    const participantSecret = getHeader(req, "X-Participant-Secret");

    const session = await crud.read(sessionCode);

    const participant = bind((session: Session) => {
      const participant = session.participants.find(
        (participant) => participant.id === newResponse.participantId
      );
      return participant === undefined
        ? failure("No participant exists with that id")
        : success(participant);
    })(session);

    const participantSecretMatches = bind(
      ([participant, participantSecret]: [Readonly<Participant>, string]) =>
        participant.secret === participantSecret
          ? success(undefined)
          : failure("participant secret does not match")
    )(combine(participant, participantSecret));

    // we do not ensure that the type or responses match with the referenced question
    // this is okay for now, may change later depending on implementation

    const activeQuestionMatches = bind((session: Session) =>
      session.activeQuestion === null
        ? failure("cannot respond when there is no active question")
        : session.activeQuestion.id === newResponse.questionId
        ? success(session.activeQuestion)
        : failure("questionId does not match activeQuestion id")
    )(session);

    const addedResponse: Result<QuestionResponse> = await mapAsync(
      async ([session, _, question]: [Session, undefined, Question]) => {
        const indexToUpdate = session.responses.findIndex(
          (response) =>
            response.participantId === newResponse.participantId &&
            response.questionId === newResponse.questionId
        );
        const responseType = indexToUpdate === -1 ? "new" : "updated";
        const newOrUpdatedResponse =
          questionResponseForParticipantToQuestionResponse(
            question.isAnonymous,
            newResponse,
            responseType === "new"
              ? uuidv4()
              : session.responses[indexToUpdate].id
          );

        const updatedResponses =
          responseType === "new"
            ? (session.responses.push(newOrUpdatedResponse), session.responses)
            : ((session.responses[indexToUpdate] = newOrUpdatedResponse),
              session.responses);

        await crud.update(session.code, (session) =>
          success({ ...session, responses: updatedResponses })
        );
        return newOrUpdatedResponse;
      }
    )(combine3(session, participantSecretMatches, activeQuestionMatches));

    const wsInformedResponded = map(
      ([session, newResponse]: [Session, QuestionResponse]) =>
        io
          .to(session.hostSocketId)
          .emit(
            WSEvents.newResponse,
            questionResponseToQuestionResponseForHost(newResponse)
          )
    )(combine(session, addedResponse));

    return process(
      wsInformedResponded,
      (_) => res.status(200).send(),
      (errorMsg) => res.status(400).send(errorMsg)
    );
  };

export const checkActiveQuestion =
  (crud: AsyncCrudAPI<Session>, io: Server) =>
  async (req: Request<SessionCodeRouteParam>, res: Response) => {
    const { sessionCode } = req.params;

    const socketId = getHeader(req, "X-Socket-ID");

    const socket = bind(getSocket(io))(socketId);

    const session = await crud.read(sessionCode);

    const notifiedParticipant = map(([socket, session]: [Socket, Session]) => {
      const sessionHasActiveQuestion = session.activeQuestion !== null;
      if (sessionHasActiveQuestion) {
        io.to(socket.id).emit(
          WSEvents.newQuestion,
          removeAnswersFromQuestion(session.activeQuestion as Question)
        );
      }
      return undefined;
    })(combine(socket, session));

    return process(
      notifiedParticipant,
      (_) => res.status(200).send(),
      (errorMsg) => res.status(400).send(errorMsg)
    );
  };
