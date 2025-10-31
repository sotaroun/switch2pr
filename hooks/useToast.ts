"use client";

import { useCallback } from "react";

import { appToaster } from "@/lib/toaster";

type ToastStatus = "info" | "warning" | "success" | "error" | "loading";

interface ToastOptions {
  title: string;
  description?: string;
  status?: ToastStatus;
  duration?: number;
}

const statusToType: Record<ToastStatus, ToastStatus> = {
  info: "info",
  warning: "warning",
  success: "success",
  error: "error",
  loading: "loading",
};

export function useToast() {
  return useCallback(
    (options: ToastOptions) => {
      const type = statusToType[options.status ?? "info"];
      appToaster.create({
        title: options.title,
        description: options.description,
        type,
        duration: options.duration,
        closable: type !== "loading",
      });
    },
    []
  );
}
