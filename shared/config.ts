const configData = {
  prod: {
    serverHostname: "https://insight.johnpost.xyz",
    clientHostname: "https://insight.johnpost.xyz",
  },
  dev: {
    serverHostname: "http://localhost:4000",
    clientHostname: "http://localhost:3000",
  },
};

export const config =
  process.env.NODE_ENV === "development" ? configData.dev : configData.prod;
