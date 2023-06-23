import "./Button.css";
import upload from "../../assets/upload.png";
import check from "../../assets/check.png";

interface ButtonProps {
  onClick?: () => void;
  text: string;
  textColor?: string;
  color?: string;
  width?: number;
  height?: number;
  fontSize?: number;
  border?: string;
  curve?: number;
  isUpload?: boolean;
  hasFile?: boolean;
}

const Button = ({
  onClick,
  text,
  textColor = "#FFFFFF",
  color = "#4169E1",
  width = 512,
  height = 120,
  fontSize = 64,
  border = "none",
  curve = 25,
  isUpload = false,
  hasFile = false,
}: ButtonProps) => {
  return (
    <button
      className="click"
      onClick={onClick}
      style={{
        color: textColor,
        backgroundColor: color,
        height,
        width,
        fontSize,
        border,
        borderRadius: curve,
        margin: 20,
      }}
    >
      <body>{text}</body>
      {/* TODO You can't have a <body> as a child of a <button>*/}
      {isUpload ? (
        <img
          src={upload}
          alt="ERROR"
          style={{ width: 30, height: 30, marginLeft: 20 }}
        ></img>
      ) : (
        ""
      )}
    </button>
  );
};

export default Button;
