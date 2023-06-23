import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faClock } from "@fortawesome/free-regular-svg-icons";
import { useNavigate } from "react-router-dom";

const TOP_BAR_HEIGHT = 90;
const TOP_BAR_COLOR = "#4169E1";
const LOGO_PADDING_LEFT = 20;
const LOGO_PADDING_RIGHT = LOGO_PADDING_LEFT;
const CODE_PADDING_RIGHT = LOGO_PADDING_LEFT;
const CODE_PADDING_LEFT = LOGO_PADDING_LEFT;
const CLOCK_SPACE_PADDING = 15;
const FONT_SIZE = 55;

type Props = {
  sessionCode?: string;
  secondsLeft?: number;
};

export const TopBar = ({ sessionCode, secondsLeft }: Props) => {
  const navigate = useNavigate();

  function handleOnClick() {
    navigate("/");
  }

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
  };

  return (
    <>
      <div
        style={{
          position: "fixed",
          width: "100%",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          height: TOP_BAR_HEIGHT,
          backgroundColor: TOP_BAR_COLOR,
        }}
      >
        <div style={{ flex: 1 }}>
          <div
            style={{
              textAlign: "left",
              fontWeight: "bold",
              color: "#ffffff",
              fontSize: FONT_SIZE,
              paddingLeft: LOGO_PADDING_LEFT,
              paddingRight: LOGO_PADDING_RIGHT,
              cursor: "pointer",
              display: "inline-block",
            }}
            onClick={handleOnClick}
          >
            insight.
          </div>
        </div>
        <div style={{ flex: 1, textAlign: "center" }}>
          {secondsLeft && (
            <div
              style={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                fontWeight: "bold",
                color: "#ffffff",
                fontSize: FONT_SIZE,
              }}
            >
              <FontAwesomeIcon icon={faClock} style={{ fontSize: 45 }} />
              <span style={{ paddingLeft: CLOCK_SPACE_PADDING }}>
                {formatTime(secondsLeft)}
              </span>
            </div>
          )}
        </div>
        <div style={{ flex: 1 }}>
          {sessionCode && (
            <div
              style={{
                textAlign: "right",
                fontWeight: "bold",
                color: "#ffffff",
                fontSize: FONT_SIZE,
                paddingRight: CODE_PADDING_RIGHT,
                paddingLeft: CODE_PADDING_LEFT,
              }}
            >
              {sessionCode}
            </div>
          )}
        </div>
      </div>
      <div style={{ paddingTop: TOP_BAR_HEIGHT }}></div>
    </>
  );
};
