import { useContext } from "react";
import { Toaster as Sonner } from "sonner";
import { ThemeProviderContext } from "./theme-provider";

const Toaster = ({
  ...props
}) => {
  const { theme = "system" } = useContext(ThemeProviderContext);

  return (
    (<Sonner
      theme={theme}
      className="toaster group"
      style={
        {
          "--normal-bg": "var(--popover)",
          "--normal-text": "var(--popover-foreground)",
          "--normal-border": "var(--border)"
        }
      }
      {...props} />)
  );
}

export { Toaster }
