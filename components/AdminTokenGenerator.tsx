"use client";

import { useState } from "react";
import { FiKey, FiCopy, FiCheck, FiRefreshCw } from "react-icons/fi";

export default function AdminTokenGenerator() {
  const [generatedToken, setGeneratedToken] = useState<string>("");
  const [copied, setCopied] = useState(false);

  const generateToken = () => {
    // Generate a secure random token
    const token = Math.random().toString(36).substring(2, 15) + 
                  Math.random().toString(36).substring(2, 15) + 
                  Date.now().toString(36);
    setGeneratedToken(token);
    setCopied(false);
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(generatedToken);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy token:', err);
    }
  };

  return (
    <div className="bg-light-surface-primary rounded-lg border border-light-border-primary p-6 shadow-soft">
      <div className="flex items-center gap-2 mb-4">
        <FiKey className="w-5 h-5 text-primary" />
        <h3 className="text-lg font-semibold text-light-text-primary">Employee Registration Token Generator</h3>
      </div>
      
      <p className="text-sm text-light-text-secondary mb-4">
        Generate a secure token for employee registration. Share this token with employees who need to register.
      </p>

      <div className="space-y-4">
        <button
          onClick={generateToken}
          className="w-full bg-primary hover:bg-primary-600 text-white font-medium py-2 px-4 rounded-lg transition-colors flex items-center justify-center gap-2"
        >
          <FiRefreshCw className="w-4 h-4" />
          Generate New Token
        </button>

        {generatedToken && (
          <div className="bg-light-bg-tertiary border border-light-border-primary rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <p className="text-sm font-medium text-light-text-secondary mb-1">Generated Token:</p>
                <p className="text-sm text-light-text-primary font-mono break-all">{generatedToken}</p>
              </div>
              <button
                onClick={copyToClipboard}
                className="ml-3 p-2 text-light-text-tertiary hover:text-light-text-primary transition-colors"
                title="Copy to clipboard"
              >
                {copied ? (
                  <FiCheck className="w-4 h-4 text-success" />
                ) : (
                  <FiCopy className="w-4 h-4" />
                )}
              </button>
            </div>
          </div>
        )}

        <div className="bg-primary/10 border border-primary/20 rounded-lg p-3">
          <p className="text-xs text-primary-800 dark:text-primary-200">
            <strong>Note:</strong> This token is required for employee registration. Keep it secure and share it only with authorized employees.
          </p>
        </div>
      </div>
    </div>
  );
}
