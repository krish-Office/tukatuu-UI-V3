import Link from "next/link";
import { Search } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center p-6 text-center">
      <div className="text-[120px] font-black text-blue-600/10 leading-none select-none relative mb-8">
        404
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-24 h-24 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-full flex items-center justify-center shadow-inner">
            <Search className="w-10 h-10" />
          </div>
        </div>
      </div>
      <h1 className="text-3xl font-black text-gray-900 dark:text-white mb-4">Page not found</h1>
      <p className="text-gray-600 dark:text-gray-400 max-w-md mb-8">
        We searched everywhere, but we couldn&apos;t find the page you&apos;re looking for. It might have been moved or deleted.
      </p>
      <Link href="/" className="bg-mint-600 text-white font-bold px-8 py-3 rounded-full hover:bg-mint-800 transition-colors shadow-md shadow-blue-600/20">
        Return to Homepage
      </Link>
    </div>
  );
}
