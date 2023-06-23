import "./Modal.css";
import close from "../../assets/close.png";
import { useEffect, useState } from "react";
import { reverseParser, parse } from "../../utils/file-parser";
import { Question } from "../../../../shared/domain/Question";

interface ModalProps {
  question: Question;
  handleClose: any;
  show: any;
  handleQuestion: any;
}

const Modal = ({ question, handleClose, show, handleQuestion }: ModalProps) => {
  const showHideClassName = show ? "modal display-block" : "modal display-none";
  const parsed = reverseParser(question);
  const parsedValue = parsed.kind === "success" ? parsed.value : parsed.msg;
  const [textValue, setTextValue] = useState(parsedValue);

  useEffect(() => {
    const parsed = reverseParser(question);
    const parsedValue = parsed.kind === "success" ? parsed.value : parsed.msg;
    setTextValue(parsedValue);
  }, [question]);

  const handleChange = (event: any) => {
    setTextValue(event.target.value);
  };

  return (
    <div className={showHideClassName}>
      <section className="modal-main">
        <div className="left-modal">
          <textarea
            value={textValue}
            onChange={handleChange}
            className="yaml-area"
          />
          <button onClick={() => handleQuestion(textValue)}>update</button>
        </div>
        <img
          src={close}
          alt="ERROR"
          onClick={handleClose}
          className="button"
        ></img>
      </section>
    </div>
  );
};

export default Modal;
