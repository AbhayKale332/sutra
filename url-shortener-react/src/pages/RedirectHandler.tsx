import React, { useEffect } from "react";
import { useParams } from "react-router-dom";
import { DotLottieReact } from "@lottiefiles/dotlottie-react";
import loadingLottie from "../assets/lottie/Circle Shape Morphing animation.lottie";

/**
 * Handles the redirection logic from the frontend to the backend's redirect endpoint.
 * This component captures the short URL code from the path and triggers a browser-level
 * redirect to the Spring Boot backend which handles the 302 status.
 */
const RedirectHandler = () => {
  const { shortUrl } = useParams<{ shortUrl: string }>();

  useEffect(() => {
    if (shortUrl) {
      const backendUrl = import.meta.env.VITE_BACKEND_URL || "http://localhost:8080";
      window.location.href = `${backendUrl}/${shortUrl}`;
    }
  }, [shortUrl]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 dark:bg-slate-950">
      <div className="flex flex-col items-center gap-6">
        <div className="w-48 h-48 sm:w-64 sm:h-64 rounded-full bg-white dark:bg-slate-900 shadow-2xl flex items-center justify-center p-4 border-4 border-brand-purple/20 overflow-hidden">
          <DotLottieReact src={loadingLottie} loop autoplay />
        </div>
        <div className="text-center space-y-2">
          <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100">Redirecting...</h2>
          <p className="text-slate-500 dark:text-slate-400 font-medium">Just a second, we're taking you there!</p>
        </div>
      </div>
    </div>
  );
};

export default RedirectHandler;
