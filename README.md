# insight.

Insight is a lightweight, minimalist polling app for power users.

Insight is a work-in-progress app. There is full functionality, but it still needs some polishing :)

# Insight's Development Philosophy

The Unix philosophy advocates for creating small, focused tools that do one thing well and can be easily combined with other tools to create more complex functionality. Similarly, the KISS principle (Keep It Simple, Stupid) encourages developers to prioritize simplicity and clarity over complexity and feature bloat.

By choosing to focus on "power users" as our target audience, we can adhere to these principles and focus our development efforts in the most efficient manner.

# How to Run Locally

- You must run both the client and server apps at the same time:
  - Navigate to `../insight/client`
  - Run the command `npm start` to open the React app in a browser
  - Navigate to `../insight/server`
  - Run the command `npm start` to have the server listening locally

# How to Deploy Live

- (`deploy.yml` outlines all the steps with github actions syntax)
- install client and server dependencies
- `npm run build` both client and server
- place built apps on production server with the following structure:
  - `.../insight/client/build/`
  - `.../insight/server/build/`
- start the server app

# The "Question" Question

Insight decouples the polling problem from the question management problem. To use questions in a session, you simply upload them to the session. We believe existing external tools can easily work _with_ Insight to achieve any desired question management approach. For example, storing, sharing, organizing, and editing questions with permissions can be achieved easily through a git repository hosted on GitHub.
