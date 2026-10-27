"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

/** Progressive enhancement: content remains visible without JavaScript or motion. */
export function ScrollReveal() {
  const pathname = usePathname();

  useEffect(() => {
    const preference = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (preference.matches || !("IntersectionObserver" in window)) return;

    const elements = Array.from(document.querySelectorAll<HTMLElement>("[data-reveal]"));
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          (entry.target as HTMLElement).dataset.revealState = "visible";
          observer.unobserve(entry.target);
        });
      },
      { threshold: 0.15, rootMargin: "0px 0px -50px 0px" }
    );

    elements.forEach((element) => {
      // Never hide content already in view, including after back navigation.
      if (element.getBoundingClientRect().top < window.innerHeight) return;
      element.dataset.revealState = "pending";
      observer.observe(element);
    });

    const reset = () => {
      observer.disconnect();
      elements.forEach((element) => delete element.dataset.revealState);
    };
    preference.addEventListener("change", reset);
    return () => {
      reset();
      preference.removeEventListener("change", reset);
    };
  }, [pathname]);

  return null;
}
