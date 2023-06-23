import * as React from "react";
import { reducer } from "../types/FrontendDataModel";
import {
  FrontendContext,
  FrontendDispatchContext,
} from "../context/FrontendDataModelContext";

type Props = {
  children: React.ReactNode;
};

export function FrontendProvider({ children }: Props) {
  const [dataModel, dispatch] = React.useReducer(reducer, {
    type: "noneSelected",
  });

  return (
    <FrontendContext.Provider value={dataModel}>
      <FrontendDispatchContext.Provider value={dispatch}>
        {children}
      </FrontendDispatchContext.Provider>
    </FrontendContext.Provider>
  );
}
