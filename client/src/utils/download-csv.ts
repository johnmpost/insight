import { SessionForHost } from "../../../shared/dtos/SessionForHost";
import { createCSV } from "./export_csv";

const months = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

export function downloadCSVToClient(session: SessionForHost): void {
  const csv = createCSV(session);
  const current = new Date();

  // handles csv for non anonymous questions
  if (csv[0] !== null) {
    const blob = new Blob([csv[0]], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.setAttribute("href", url);
    a.setAttribute(
      "download",
      `Session-${
        months[current.getMonth()]
      }-${current.getDate()}-${current.toLocaleTimeString("en-US")}.csv`
    );
    a.click();
  }

  // handles csv for anonymous questions
  if (csv[1] !== null) {
    const blob = new Blob([csv[1]], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.setAttribute("href", url);
    a.setAttribute(
      "download",
      `Session-AnonymousData-${
        months[current.getMonth()]
      }-${current.getDate()}-${current.toLocaleTimeString("en-US")}.csv`
    );
    a.click();
  }
}
