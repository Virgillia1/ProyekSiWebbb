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
          toast: "group toast bg-white text-foreground border border-border shadow-lg font-sans",
          title: "text-foreground font-semibold group-data-[type=success]:text-white group-data-[type=error]:text-white",
          description: "text-muted-foreground group-data-[type=success]:text-emerald-100 group-data-[type=error]:text-rose-100",
          success: "!bg-emerald-600 !text-white !border-emerald-700",
          error: "!bg-red-600 !text-white !border-red-700",
          ...toastOptions?.classNames,
        },
      }}
      {...toasterProps}
    />
  );
};

export { Toaster };
