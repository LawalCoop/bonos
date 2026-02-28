"use client";

import { useEffect, Suspense } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import NProgress from "nprogress";

// Configure NProgress
NProgress.configure({
  showSpinner: false,
  minimum: 0.1,
  speed: 300,
});

function ProgressBarInner() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    NProgress.done();
  }, [pathname, searchParams]);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const anchor = target.closest("a");

      if (anchor) {
        const href = anchor.getAttribute("href");
        const anchorTarget = anchor.getAttribute("target");

        // Only start progress for internal links
        if (
          href &&
          !href.startsWith("#") &&
          !href.startsWith("http") &&
          !href.startsWith("mailto:") &&
          anchorTarget !== "_blank"
        ) {
          NProgress.start();
        }
      }
    };

    // Also handle button clicks that might trigger navigation
    const handleButtonClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const button = target.closest("button");

      if (button && button.getAttribute("data-loading") === "true") {
        NProgress.start();
      }
    };

    document.addEventListener("click", handleClick);
    document.addEventListener("click", handleButtonClick);

    return () => {
      document.removeEventListener("click", handleClick);
      document.removeEventListener("click", handleButtonClick);
    };
  }, []);

  return null;
}

export function ProgressBar() {
  return (
    <Suspense fallback={null}>
      <ProgressBarInner />
    </Suspense>
  );
}
