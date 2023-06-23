import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { TopBar } from "../../components/TopBar";
import "../../styles/Background.css";
import "../../styles/Title.css";
import { faDownload } from "@fortawesome/free-solid-svg-icons";
import { marked } from "marked";
import { helpManual } from "./helpMD";
import { downloadCSVToClient } from "../../utils/download-csv";

const renderer = new marked.Renderer();
renderer.code = (code, language, isEscaped) => {
  return `<pre style="max-width: 500px; overflow-x: auto; white-space: pre; background-color: #40454f;">
    <code>
      ${code}
    </code>
  </pre>
`;
};

function Help() {
  return (
    <div className="background">
      <TopBar />
      <div
        className="title"
        style={{
          paddingTop: "20px",
          fontSize: 60,
          textAlign: "center",
        }}
      >
        help.
      </div>
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "flex-start",
          paddingLeft: "20px",
          paddingBottom: "20px",
          color: "#ffffff",
        }}
      >
        <div
          dangerouslySetInnerHTML={{
            __html: marked.parse(helpManual, { renderer: renderer }),
          }}
        ></div>
        <div style={{ flexDirection: "row" }}>
          Download a Sample YAML File to Get Started!
          <a href={require("./Sample.yml")} download="Sample.yml">
            <FontAwesomeIcon
              icon={faDownload}
              style={{ color: "#4169E1", fontSize: 25, paddingLeft: "15px" }}
            />
          </a>
        </div>
      </div>
    </div>
  );
}

export default Help;
