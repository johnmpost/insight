export const helpManual = `## join a poll

- users will be prompted to enter in a code when then their name
- users will then get to answer questions when the host activates a question
- users will also see the correct answers after time is up or hosts end questions
- if a question is timed, users will have until the timer is ended or until the host ends the question to edit their responses
- users will be notified when their answers have been successfully submitted

## host a poll

- starting a session
  - a session is automatically generated when you click on 'host a poll'
  - in order for questions to appear, they need to be uploaded
  - when you press 'upload', you will be prompted to choose a file
    - the only file type accepted is YAML (see YAML section for more details)
  - questions will appear in the queue on the left side of the screen within cards
  - hosts may continually upload questions throughout the session and they will be added on the queue
- operating a session
  - the order of the questions can be edited by clicking and holding on one of the cards then dragging it to a new position
    - hosts can also view information about each question by clicking on the 'i' in the upper right corner of the question card in the question queue
  - to end a question, the host will click 'end question'
  - the host can then click 'next' above the question queue to activate another question
  - the active question will be displayed under the 'question' tab
  - during the sessions, the host can monitor the participant responses to the active question under the tab 'responses'
- ending a session
  - hosts can click 'end session' to end the current session
  - they can then download the content of that session in form of a CSV file

## YAML files for question sets

- files uploaded to insight will be of type .yml
- proper YAML syntax needs to be used, or there will be an error and you will be asked to resubmit
- basic YAML question template:

  \`\`\`
  - prompt: "ENTER YOUR PROMPT HERE"
          type: "QUESTION TYPE"
          isAnonymous: WHETHER QUESTION IS ANONYMOUS OR NOT
          timeLimit: HOW LONG USERS WILL HAVE TO ANSWER A QUESTIONS
          correctAnswers or answers (depending on question type):
            - LIST CORRECT ANSWERS (see below for examples)
  \`\`\`

- explanation of appropriate inputs for fields in basic template
  - prompt: enter any text here and put it in quotes
  - type: "freeResponse" or "multipleChoice" or "selectMany"
  - isAnonymous: true or false
  - timeLimit: integer value in seconds (e.g. enter 60 if users have one minute to answer question)
  - correctAnswers: enter correct answers in a list formatt (this field is for freeResponse type questions only)
  - answers: enter choice text and if its correct (this field is for multipleChoice or selectMany type questions only)
- required fields to have values for:
  - prompt
  - type
  - answers (if question type is multipleChoice or selectMany)
- optional fields to include:
  - isAnonymous
  - timeLimit
  - correctAnswers (if question type is freeResponse)
- free response question example:

  \`\`\`
  - prompt: "Please list your favorite color"
          type: "freeResponse"
          isAnonymous: true
          timeLimit: 60
          correctAnswers:
            - "Red"
            - "Orange"
  \`\`\`

- multiple choice question example:

  \`\`\`
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
  \`\`\`

- select many question example:

  \`\`\`
  - prompt: "Select your favorite color(s)?"
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
  \`\`\`
`;
