import { useState } from "react";
import Button from "../button/Button";
import "./Form.css";

interface FormProps {
  label: string;
  buttonLabel?: string;
  handleSubmit?: () => void;
}

const Form = ({ label, buttonLabel, handleSubmit }: FormProps) => {
  const [input, setInput] = useState("");

  return (
    <div className="form">
      <input
        type="text"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        placeholder={label}
        className="form-input"
        maxLength={6}
        onSubmit={handleSubmit}
      />
      <Button
        text={buttonLabel ? buttonLabel : "next"}
        onClick={handleSubmit}
      />
    </div>
  );
};

export default Form;
