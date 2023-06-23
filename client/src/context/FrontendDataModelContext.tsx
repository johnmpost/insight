import * as React from "react";
import { FrontendDataModel, Action } from "../types/FrontendDataModel";

export const FrontendContext = React.createContext<FrontendDataModel>({
  type: "noneSelected",
});

export const FrontendDispatchContext = React.createContext<
  React.Dispatch<Action>
>(() => {});
