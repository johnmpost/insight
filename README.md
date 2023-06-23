# insight.

Insight is a lightweight, minimalist polling app for power users.

# Insight's Development Philosophy

The Unix philosophy advocates for creating small, focused tools that do one thing well and can be easily combined with other tools to create more complex functionality. Similarly, the KISS principle (Keep It Simple, Stupid) encourages developers to prioritize simplicity and clarity over complexity and feature bloat.

Insight doesn't require user registration, passwords, or specific user roles, as these add unnecessary complexity to the app. Instead, it uses short-lived secrets to authenticate requests and allows any user to host or participate in a session. This approach greatly simplifies the codebase and makes it easier to maintain and update.

# Insight Code Structure

Client Folder

- Contains all front end
- Client -> src:
  - Assets
  - Components
  - Context
  - Screens
  - Services
  - Styles
  - Types
  - Utils
  - App.tsx

Server Folder

- Contains all back end
- Server -> src:
  - Tests: contains unit test files
  - Controllers : contains route-handlers
  - Utils : contains utility functions used in the back end

Shared Folder

- Contains all data that is shared between the back end and front end:
  - Types
  - DTOs
  - Utility functions

# How to Run Locally

- Have two terminals open
- Terminal One:
  - Navigate to ../insight/client
  - Run the command npm start to open the React App in a browser
- Terminal Two:
  - Navigate to ../insight/server
  - Run the command npm start to have the server listening locally

# How to Deploy Live

- (deploy.yml outlines all the steps with github actions syntax)
- install client and server dependencies
- `npm run build` both client and server
- place built apps on production server with the following structure:
  - `.../insight/client/build/`
  - `.../insight/server/build/`
- start the server app

# Why Insight? - Initial Requirements

- user registration
  - All the data we need is transitory. Since we don't need to store anything related to particular users, there is no need for them to make accounts.
- encrypted passwords
  - Since we don't have user registration, we don't have a need for passwords.
- authentication
  - Since we don't have user accounts, we don't have authorization specific to particular users. However, we do properly authenticate requests that need to be - such as actions that should only be taken by a host and actions that require a participant to prove their identity. We do this by using short-lived secrets that only persist for the duration of one session.
- user roles (instructor, student, teaching assistant)
  - Due to the nature of our app, there is no need for user accounts to be assigned to a particular role. Any user can do what any other user can do: host or participate in sessions. During a session, "host" and "participant" are the two "user roles", which could reflect "instructor" and "student" roles.
- teaching assistant role
  - There is no concept of a TA role in our app. The only things the TA role should do according to the initial requirements document are things that happen **before** or **after** a session. Since our app is based on transitory sessions, this role does not make sense. However, the actions that the TA role would do are still supported and are explained below.
- creating questions
  - Insight supports creating question sets via a structured plaintext format that uses YAML.
- template for each type of question
  - Insight's help screen has templates for creating questions of different types.
- storing and editing questions, with permissions
  - Insight decouples the polling problem from the question management problem. To use questions in a session, you simply upload them to the session. We believe existing external tools can easily work _with_ Insight to achieve any desired question management approach. For example, storing, sharing, and editing questions with permissions can be achieved easily through a git repository hosted on GitHub.
- timed questions
  - When you create questions, you can specify an optional time limit.
- see real-time responses
  - Insight supports this as you would expect.
- attendance check-in
  - Insight supports this as you would expect.
- auto-grade questions
  - Insight supports this as you would expect. You can specify correct answers to questions.
- export answers, scores, and attendance to csv
  - Insight supports this. You can export a session's data when you are done.
- anonymous polling
  - Insight supports this. Questions may be marked as anonymous, and will then not track any associated participant data.
- support up to 40 students per session
  - Insight supports theoretically unlimited participants per session, but realistically could support at least 40.
