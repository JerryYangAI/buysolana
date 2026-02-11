"use client";

import { useEffect, useId, useRef } from "react";

type TurnstileWidgetProps = {
  siteKey: string;
  onToken: (token: string) => void;
};

type TurnstileRenderOptions = {
  sitekey: string;
  callback?: (token: string) => void;
  "expired-callback"?: () => void;
  "error-callback"?: () => void;
  theme?: "light" | "dark" | "auto";
};

type TurnstileApi = {
  render: (container: string | HTMLElement, options: TurnstileRenderOptions) => string;
  remove: (widgetId: string) => void;
};

declare global {
  interface Window {
    turnstile?: TurnstileApi;
    __turnstileScriptPromise?: Promise<void>;
  }
}

function loadTurnstileScript() {
  if (typeof window === "undefined") {
    return Promise.resolve();
  }

  if (window.turnstile) {
    return Promise.resolve();
  }

  if (window.__turnstileScriptPromise) {
    return window.__turnstileScriptPromise;
  }

  window.__turnstileScriptPromise = new Promise<void>((resolve, reject) => {
    const script = document.createElement("script");
    script.src = "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit";
    script.async = true;
    script.defer = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error("Failed to load Turnstile script"));
    document.head.appendChild(script);
  });

  return window.__turnstileScriptPromise;
}

export function TurnstileWidget({ siteKey, onToken }: TurnstileWidgetProps) {
  const reactId = useId();
  const containerId = `turnstile-${reactId.replace(/[:]/g, "")}`;
  const widgetIdRef = useRef<string | null>(null);

  useEffect(() => {
    let mounted = true;

    async function renderWidget() {
      if (!siteKey) return;

      await loadTurnstileScript();

      if (!mounted || !window.turnstile || widgetIdRef.current) return;

      widgetIdRef.current = window.turnstile.render(`#${containerId}`, {
        sitekey: siteKey,
        theme: "dark",
        callback: (token: string) => onToken(token),
        "expired-callback": () => onToken(""),
        "error-callback": () => onToken(""),
      });
    }

    void renderWidget();

    return () => {
      mounted = false;
      if (widgetIdRef.current && window.turnstile) {
        window.turnstile.remove(widgetIdRef.current);
      }
      widgetIdRef.current = null;
    };
  }, [containerId, onToken, siteKey]);

  return <div id={containerId} className="min-h-16" />;
}
