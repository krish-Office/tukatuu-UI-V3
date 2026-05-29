import Link from "next/link";
import { ChevronRight } from "lucide-react";

interface BreadcrumbProps {
  items: { label: string; href?: string }[];
}

export default function Breadcrumb({ items }: BreadcrumbProps) {
  return (
    <nav className="flex items-center gap-2 text-sm text-gray-500 mb-6">
      <Link href="/" className="hover:text-blue-600 transition-colors">Home</Link>
      {items.map((item, index) => (
        <div key={index} className="flex items-center gap-2">
          <ChevronRight className="w-4 h-4" />
          {item.href ? (
            <Link href={item.href} className="hover:text-blue-600 transition-colors">
              {item.label}
            </Link>
          ) : (
            <span className="text-gray-900 font-medium">{item.label}</span>
          )}
        </div>
      ))}
    </nav>
  );
}
