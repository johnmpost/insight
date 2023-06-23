import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCheck, faTimes } from "@fortawesome/free-solid-svg-icons";

const SECONDARY_COLOR = "#f5f5f5";
const HIGHLIGHT_COLOR = "#e0e0e0";
const TEXT_COLOR = "#000000";
const BORDER_COLOR = "#4169E1";
const BORDER_RADIUS = "14px";
const OPTION_SPACING = "10px";
const RADIO_CIRCLE_SIZE = 24;
const RADIO_CIRCLE_THICKNESS = 3;
const RADIO_CIRCLE_FILL_COLOR = "#4169E1";
const RADIO_CIRCLE_FILL_SIZE = 18;
const OPTION_HEIGHT: string | number = "auto";
const OPTION_WIDTH: string | number = "35vw";
const CHECKBOX_FILL_COLOR = RADIO_CIRCLE_FILL_COLOR;
const CHECKBOX_FILL_SIZE = RADIO_CIRCLE_FILL_SIZE;
const SHOW_CORRECT_WIDTH = "48px";

type Props = {
  index: number;
  onClick: () => void;
  selected: boolean;
  type: "radio" | "checkbox";
  text: string;
  isCorrect?: boolean;
};

export const AnswerOption = ({
  index,
  onClick,
  selected,
  type,
  text,
  isCorrect,
}: Props) => {
  const isShowingCorrect = isCorrect !== undefined;

  return (
    <>
      <div
        style={{
          display: "flex",
          flexDirection: "row",
          alignItems: "center",
        }}
      >
        <div style={{ width: SHOW_CORRECT_WIDTH, textAlign: "center" }}>
          {isCorrect !== undefined && (
            <FontAwesomeIcon
              icon={isCorrect ? faCheck : faTimes}
              color={isCorrect ? "#32cd32" : "red"}
              fontSize={36}
            />
          )}
        </div>
        <div
          key={index}
          onClick={onClick}
          style={{
            display: "flex",
            alignItems: "center",
            backgroundColor: selected ? HIGHLIGHT_COLOR : SECONDARY_COLOR,
            borderRadius: BORDER_RADIUS,
            padding: `8px 16px`,
            cursor: isShowingCorrect ? "default" : "pointer",
            height: OPTION_HEIGHT,
            width: OPTION_WIDTH,
          }}
        >
          <div
            style={{
              flexShrink: 0,
              width: `${RADIO_CIRCLE_SIZE}px`,
              height: `${RADIO_CIRCLE_SIZE}px`,
              borderRadius: type === "radio" ? "50%" : "20%",
              border: `${RADIO_CIRCLE_THICKNESS}px solid ${BORDER_COLOR}`,
              marginRight: `16px`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            {selected && (
              <div
                style={{
                  width:
                    type === "radio"
                      ? `${RADIO_CIRCLE_FILL_SIZE}px`
                      : `${CHECKBOX_FILL_SIZE}px`,
                  height:
                    type === "radio"
                      ? `${RADIO_CIRCLE_FILL_SIZE}px`
                      : `${CHECKBOX_FILL_SIZE}px`,
                  borderRadius: type === "radio" ? "50%" : "20%",
                  backgroundColor:
                    type === "radio"
                      ? RADIO_CIRCLE_FILL_COLOR
                      : CHECKBOX_FILL_COLOR,
                }}
              />
            )}
          </div>
          <span
            style={{
              color: TEXT_COLOR,
              fontSize: "24px",
              paddingTop: "8px",
              paddingBottom: "8px",
            }}
          >
            {text}
          </span>
        </div>
        <div style={{ width: SHOW_CORRECT_WIDTH }}></div>
      </div>
      <div style={{ padding: OPTION_SPACING }} />
    </>
  );
};
