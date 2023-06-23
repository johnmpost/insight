import { useState } from "react";
import "./Toggle.css";

interface ToggleProps {
  label: string;
  toggled: boolean;
  onClick: any;
}

export const Toggle = ({ label, toggled, onClick }: ToggleProps) => {
  const [isToggled, toggle] = useState(toggled);

  const callback = () => {
    toggle(!isToggled);
    onClick(!isToggled);
  };

  return (
    <div className="toggle-box">
      <div className="toggle-box-text">
        <div className="questions-toggle">questions</div>
        <div className="responses-toggle">responses</div>
      </div>
      <label className="label">
        <input
          type="checkbox"
          defaultChecked={isToggled}
          onClick={callback}
          className="input"
        />
        <span className="span" />
      </label>
    </div>
  );
};

export default Toggle;
