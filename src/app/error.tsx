"use client";

import { useEffect } from "react";
import { AlertTriangle } from "lucide-react";
import Link from "next/link";

export default function ErrorBoundary({ error, reset }: { error: Error & { digest?: string }, reset: () => void }) {
  useEffect(() => {
    console.error("App Error:", error);
  }, [error]);

  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center p-6 text-center">
      <div className="w-20 h-20 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-full flex items-center justify-center mb-6">
        <AlertTriangle className="w-10 h-10" />
      </div>
      <h1 className="text-3xl font-black text-gray-900 dark:text-white mb-4">Oops! Something went wrong.</h1>
      <p className="text-gray-600 dark:text-gray-400 max-w-md mb-8">
        We hit a snag while trying to load this page. Don&apos;t worry, your data is safe.
      </p>
      <div className="flex gap-4">
        <button onClick={() => reset()} className="bg-mint-600 text-white font-bold px-8 py-3 rounded-full hover:bg-mint-800 transition-colors shadow-md shadow-blue-600/20">
          Try Again
        </button>
        <Link href="/" className="bg-gray-100 dark:bg-slate-800 text-gray-900 dark:text-white font-bold px-8 py-3 rounded-full hover:bg-gray-200 dark:hover:bg-slate-700 transition-colors">
          Go Home
        </Link>
      </div>
    </div>
  );
}
