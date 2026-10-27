"use client";
import Script from "next/script";
import { useEffect, useRef, useState } from "react";
declare global {
  interface Window {
    turnstile?: {
      render: (
        element: HTMLElement,
        options: {
          sitekey: string;
          action: string;
          callback: (token: string) => void;
          "expired-callback": () => void;
          "error-callback": () => void;
          theme: string;
        }
      ) => string;
      remove: (id: string) => void;
    };
  }
}
export function Turnstile({
  onToken,
  attempt,
}: {
  onToken: (token: string) => void;
  attempt: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [ready, setReady] = useState(false);
  const sitekey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;
  useEffect(() => {
    if (!ready || !ref.current || !window.turnstile || !sitekey) return;
    const id = window.turnstile.render(ref.current, {
      sitekey,
      action: "explore",
      callback: onToken,
      "expired-callback": () => onToken(""),
      "error-callback": () => onToken(""),
      theme: "auto",
    });
    return () => window.turnstile?.remove(id);
  }, [ready, onToken, sitekey, attempt]);
  if (!sitekey) return null;
  return (
    <>
      <Script
        src="https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit"
        onReady={() => setReady(true)}
      />
      <div ref={ref} className="turnstile" aria-label="Visitor verification" />
    </>
  );
}
