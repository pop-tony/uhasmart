"use client";

import { useEffect, useState } from "react";
import { Smartphone, RotateCcw } from "lucide-react";

export default function PortraitLockGuard() {
  const [isLandscapeMobile, setIsLandscapeMobile] = useState(false);

  useEffect(() => {
    // Attempt standard screen orientation lock where supported (e.g. Android PWA / Fullscreen)
    const lockPortrait = async () => {
      try {
        if (
          typeof window !== "undefined" &&
          window.screen &&
          "orientation" in window.screen &&
          "lock" in window.screen.orientation
        ) {
          // @ts-expect-error - Screen Orientation API lock method
          await window.screen.orientation.lock("portrait-primary").catch(() => {});
        }
      } catch {
        // Ignored on browsers that do not permit JS orientation locking
      }
    };

    void lockPortrait();

    // Check if the current screen is a mobile device rotated to landscape
    const checkOrientation = () => {
      if (typeof window === "undefined") return;

      const isLandscape =
        window.matchMedia("(orientation: landscape)").matches ||
        Math.abs(Number(window.orientation) || 0) === 90;

      // Mobile phones in landscape have a small height (typically 320px - 500px)
      // and coarse pointer (touch screen)
      const isShortHeight = window.innerHeight <= 550;
      const isTouch =
        window.matchMedia("(pointer: coarse)").matches ||
        "ontouchstart" in window ||
        navigator.maxTouchPoints > 0;

      setIsLandscapeMobile(isLandscape && isShortHeight && isTouch);
    };

    checkOrientation();

    window.addEventListener("resize", checkOrientation);
    window.addEventListener("orientationchange", checkOrientation);

    return () => {
      window.removeEventListener("resize", checkOrientation);
      window.removeEventListener("orientationchange", checkOrientation);
    };
  }, []);

  return (
    <>
      {/* 
        Pure CSS Guard: Instantly triggers with 0 JS delay when a mobile phone 
        is turned to landscape, preventing any desktop layout flash.
      */}
      <div
        id="portrait-lock-barrier"
        className={`fixed inset-0 z-[99999] flex flex-col items-center justify-center bg-slate-950/95 text-white backdrop-blur-2xl px-6 text-center select-none ${
          isLandscapeMobile ? "flex" : "hidden portrait-guard-hide"
        }`}
        role="alert"
        aria-live="assertive"
      >
        <div className="relative mb-6 flex h-20 w-20 items-center justify-center rounded-3xl bg-blue-600/20 border border-blue-500/30 text-blue-400 shadow-2xl shadow-blue-500/20">
          <Smartphone className="h-10 w-10 animate-phone-rotate" />
          <div className="absolute -bottom-1 -right-1 flex h-6 w-6 items-center justify-center rounded-full bg-blue-600 text-white shadow-md">
            <RotateCcw className="h-3.5 w-3.5 animate-spin" style={{ animationDuration: "3s" }} />
          </div>
        </div>

        <div className="inline-flex items-center gap-1.5 rounded-full bg-blue-950/80 border border-blue-800/60 px-3 py-1 text-[11px] font-bold text-blue-300 uppercase tracking-widest mb-3">
          VarsMart Mobile
        </div>

        <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
          Please Rotate Your Phone
        </h2>

        <p className="mt-2 max-w-sm text-xs sm:text-sm text-slate-400 leading-relaxed">
          VarsMart is locked to <strong>portrait mode</strong> on mobile phones for the cleanest browsing and shopping experience. Please turn your device upright.
        </p>

        <div className="mt-6 flex items-center gap-2 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
          <span>Portrait Orientation Locked</span>
        </div>
      </div>
    </>
  );
}
