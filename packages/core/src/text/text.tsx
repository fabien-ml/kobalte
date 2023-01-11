import { createPolymorphicComponent } from "@kobalte/utils";
import { splitProps } from "solid-js";
import { Dynamic } from "solid-js/web";

import { TypographyContext } from "./context";

export interface TextOptions {}

export const Text = createPolymorphicComponent<"span", TextOptions>(props => {
  const [local, others] = splitProps(props, ["as", "children"]);
  const elementType = () => local.as ?? "span";

  return (
    <Dynamic component={elementType()} {...others}>
      <TypographyContext.Provider value>{local.children}</TypographyContext.Provider>
    </Dynamic>
  );
});
