import Image from "next/image";
import { Shield, Truck, HeartHandshake, Zap } from "lucide-react";

export default function AboutPage() {
  return (
    <div className="max-w-[1180px] mx-auto px-4 md:px-0 py-12">
      {/* Hero */}
      <div className="text-center max-w-3xl mx-auto mb-16">
        <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6 leading-tight">
          Redefining the way you shop online
        </h1>
        <p className="text-gray-500 text-lg leading-relaxed">
          At Tukaatu, we believe that shopping should be a seamless, enjoyable experience. We combine premium design with an unparalleled selection of products.
        </p>
      </div>
      
      {/* Image / Story */}
      <div className="flex flex-col md:flex-row gap-12 items-center mb-20">
        <div className="flex-1 w-full h-[400px] bg-gray-100 rounded-3xl overflow-hidden relative">
          <Image
            src="https://images.unsplash.com/photo-1522204523234-8729aa6e3d5f?w=800&h=600&fit=crop&q=80" 
            alt="Team working together" 
            fill
            sizes="(max-width: 768px) 100vw, 560px"
            className="w-full h-full object-cover"
          />
        </div>
        <div className="flex-1">
          <h2 className="text-3xl font-bold text-gray-900 mb-6">Our Story</h2>
          <p className="text-gray-600 mb-4 leading-relaxed">
            Founded in 2026, Tukaatu started with a simple vision: to build an ecommerce platform that did not just sell products, but curated experiences. We were tired of cluttered, confusing interfaces and wanted to build something clean, premium, and trustworthy.
          </p>
          <p className="text-gray-600 leading-relaxed">
            Today, we serve millions of customers globally, offering everything from the latest electronics to high-end fashion, always ensuring that our quality standards and customer service are second to none.
          </p>
        </div>
      </div>
      
      {/* Why Choose Us */}
      <div className="mb-16">
        <h2 className="text-3xl font-bold text-gray-900 mb-10 text-center">Why Choose Us</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white rounded-2xl p-8 border border-gray-100 shadow-sm text-center">
            <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-6">
              <Zap className="w-8 h-8" />
            </div>
            <h3 className="font-bold text-gray-900 mb-3">Lightning Fast</h3>
            <p className="text-sm text-gray-500">Our platform is built for speed, making your shopping experience as efficient as possible.</p>
          </div>
          
          <div className="bg-white rounded-2xl p-8 border border-gray-100 shadow-sm text-center">
            <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-6">
              <Shield className="w-8 h-8" />
            </div>
            <h3 className="font-bold text-gray-900 mb-3">Secure Payments</h3>
            <p className="text-sm text-gray-500">Industry-leading encryption ensures your data and transactions are always safe.</p>
          </div>
          
          <div className="bg-white rounded-2xl p-8 border border-gray-100 shadow-sm text-center">
            <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-6">
              <Truck className="w-8 h-8" />
            </div>
            <h3 className="font-bold text-gray-900 mb-3">Fast Delivery</h3>
            <p className="text-sm text-gray-500">We partner with top logistics providers to ensure your orders arrive on time, every time.</p>
          </div>
          
          <div className="bg-white rounded-2xl p-8 border border-gray-100 shadow-sm text-center">
            <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-6">
              <HeartHandshake className="w-8 h-8" />
            </div>
            <h3 className="font-bold text-gray-900 mb-3">24/7 Support</h3>
            <p className="text-sm text-gray-500">Our dedicated support team is always available to help you with any issues.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
