import React, { useEffect } from "react";
import { useParams } from "react-router-dom";
import { Loader2 } from "lucide-react";

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
    <div className="min-h-screen flex flex-col items-center justify-center bg-background">
      <div className="flex flex-col items-center gap-4">
        <Loader2 className="h-10 w-10 animate-spin text-brand-purple" />
        <h2 className="text-xl font-semibold text-foreground">Redirecting you...</h2>
        <p className="text-muted-foreground">Please wait while we take you to your destination.</p>
      </div>
    </div>
  );
};

export default RedirectHandler;
