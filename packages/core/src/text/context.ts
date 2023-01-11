import { createContext, useContext } from "solid-js";

export const TypographyContext = createContext(false);

export function useRequiredTypography(componentName: string) {
  const value = useContext(TypographyContext);

  if (process.env.NODE_ENV === "development" && !value) {
    throw new Error(
      `\`${componentName}\` component must be rendered within a \`Text\` or \`Heading\` component.`
    );
  }
}
