# Insight User Guide

## YAML files for question sets

### General Info

- question sets are represented in YAML as a list of questions
- the fields on a question are explained in detail below
- the list of questions may only include one question
- files uploaded to insight must be of type .yml
- you must use valid YAML syntax, but you can use any valid YAML syntax

### Question Fields

- `type`

  - a string that can be any of the following:
    - `multipleChoice`
    - `selectMany`
    - `freeResponse`
  - this will dictate what type of question you are creating
  - this field is required

- `isAnonymous`

  - a boolean value that can be `true` or `false`
  - this dictates whether the question will be anonymous or not
  - responses to anonymous questions are not connected to a specific participant
  - this field is optional, and defaults to false if not provided

- `timeLimit`

  - an integer number of seconds
  - this dictates how long the question will be open for
  - once the time limit is reached, the question will close on its own, but the question can be closed manually before the time limit is reached
  - this field is optional, and defaults to no time limit if not provided

- `prompt`

  - any string
  - this dictates the prompt of the question, what the participants will see
  - this field is required

- `correctAnswers`

  - a list of strings
  - this field is used for free response questions, and determines which answers count as correct
  - this field is optional, and the question becomes ungraded if not provided (no correct or incorrect answers)

- `answers`

  - a list of `Answer` values
  - this field is used for multiple choice and select-many questions, and determines both the possible answer options and the correct answers
  - an `Answer` value has two fields:
    - `text`
      - any string
      - this field determines what the test of the answer option is
      - this field is required
    - `isCorrect`
      - a boolean value that can be `true` or `false`
      - this field is optional, and defaults to nothing if not provided
  - important: **all** or **none** of the `Answer`s must have `isCorrect` provided
  - if no `Answer`s have `isCorrect` provided, the question becomes ungraded (no correct or incorrect answers)

### Examples

```
- prompt: "Please list your favorite color."
  type: "freeResponse"
  isAnonymous: true
  timeLimit: 60
  correctAnswers:
    - "Red"
    - "Orange"
```

```
- prompt: "What is your favorite color?"
  type: "multipleChoice"
  answers:
    - text: "Red"
      isCorrect: false
    - text: "Orange"
      isCorrect: true
    - text: "Blue"
      isCorrect: false
    - text: "Green"
      isCorrect: true
```

```
- prompt: "Select your favorite color(s)."
  type: "selectMany"
  timeLimit: 45
  answers:
    - text: "Red"
    - text: "Orange"
    - text: "Blue"
    - text: "Green"
```
