"use client";
import { useEffect, useState } from "react";
import { AlertCircle, UserPlus, LogIn, RefreshCw } from "lucide-react";

export default function AuthErrorPage() {
  const [errorType, setErrorType] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [actionText, setActionText] = useState("");
  const [actionLink, setActionLink] = useState("");
  const [showRetry, setShowRetry] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const error = params.get("error");

    switch (error) {
      case "no-account":
      case "signup_disabled":
        setErrorMessage("No account found with this email");
        setActionText("Create an account");
        setActionLink("/sign-up");
        setShowRetry(false);
        break;

      case "user-not-found":
        setErrorMessage("User not found");
        setActionText("Sign up instead");
        setActionLink("/sign-up");
        setShowRetry(true);
        break;

      case "auth-failed":
        setErrorMessage("Authentication failed");
        setActionText("Try again");
        setActionLink("/sign-in");
        setShowRetry(true);
        break;

      case "invalid-credentials":
        setErrorMessage("Invalid email or password");
        setActionText("Try again");
        setActionLink("/sign-in");
        setShowRetry(false);
        break;

      case "session-expired":
        setErrorMessage("Your session has expired");
        setActionText("Sign in again");
        setActionLink("/sign-in");
        setShowRetry(false);
        break;

      case "oauth-error":
        setErrorMessage("OAuth authentication failed");
        setActionText("Try again");
        setActionLink("/sign-in");
        setShowRetry(true);
        break;

      default:
        setErrorMessage("Something went wrong");
        setActionText("Go to sign in");
        setActionLink("/sign-in");
        setShowRetry(true);
    }

    setErrorType(error || "unknown");
  }, []);

  const handleAction = () => {
    window.location.href = actionLink;
  };

  const handleRetry = () => {
    window.location.reload();
  };

  const getIcon = () => {
    if (errorType === "no-account" || errorType === "user-not-found") {
      return <UserPlus className="w-16 h-16 text-red-500" />;
    }
    return <AlertCircle className="w-16 h-16 text-red-500" />;
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 w-100">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl p-8">
        <div className="flex justify-center mb-6">{getIcon()}</div>

        <h1 className="text-2xl font-semibold text-gray-900 text-center mb-3">
          Authentication Error
        </h1>

        <p className="text-gray-600 text-center mb-8">{errorMessage}</p>

        <div className="text-center mb-8">
          <span className="text-xs text-gray-400 font-mono">
            Error: {errorType}
          </span>
        </div>

        <button
          onClick={handleAction}
          className="w-full bg-black text-white py-3 rounded-lg font-medium hover:bg-gray-800 transition-colors mb-3"
        >
          {actionText}
        </button>

        {showRetry && (
          <button
            onClick={handleRetry}
            className="w-full bg-white text-gray-700 py-3 rounded-lg font-medium border border-gray-300 hover:bg-gray-50 transition-colors flex items-center justify-center gap-2"
          >
            <RefreshCw className="w-4 h-4" />
            Retry
          </button>
        )}
      </div>
    </div>
  );
}
