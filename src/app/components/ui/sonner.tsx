"use client";

import { useTheme } from "next-themes";
import { Toaster as Sonner, ToasterProps } from "sonner";

const Toaster = ({ ...props }: ToasterProps) => {
  const { theme = "system" } = useTheme();
  const { toastOptions, ...toasterProps } = props;

  return (
    <Sonner
      theme={theme as ToasterProps["theme"]}
      className="toaster group"
      style={
        {
          "--normal-bg": "var(--popover)",
          "--normal-text": "#064e3b",
          "--normal-border": "var(--border)",
        } as React.CSSProperties
      }
      toastOptions={{
        ...toastOptions,
        classNames: {
          toast: "bg-white text-[#064e3b] border border-[#d9f5df] shadow-lg",
          title: "text-[#064e3b] font-semibold",
          description: "text-[#0a0a0a]",
          ...toastOptions?.classNames,
        },
      }}
      {...toasterProps}
    />
  );
};

export { Toaster };
