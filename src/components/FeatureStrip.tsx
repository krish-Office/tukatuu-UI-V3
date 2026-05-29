import { Leaf, Truck, RefreshCcw, ShieldCheck } from "lucide-react";

export function FeatureStrip() {
  const features = [
    {
      title: "100% Organic",
      desc: "Quality you can trust",
      icon: Leaf,
    },
    {
      title: "Free Shipping",
      desc: "On orders over $50",
      icon: Truck,
    },
    {
      title: "Easy Returns",
      desc: "30 days return policy",
      icon: RefreshCcw,
    },
    {
      title: "Secure Payment",
      desc: "100% secure checkout",
      icon: ShieldCheck,
    },
  ];

  return (
    <div className="bg-white/90 rounded-2xl py-6 px-4 md:px-8 shadow-sm border border-mint-100">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 divide-x divide-mint-100">
        {features.map((feat, i) => {
          const Icon = feat.icon;
          return (
            <div key={i} className={`flex items-center gap-4 ${i !== 0 ? 'pl-6' : ''}`}>
              <div className="w-12 h-12 rounded-full bg-mint-100 flex items-center justify-center text-mint-800">
                <Icon size={20} />
              </div>
              <div>
                <h4 className="font-bold text-mint-900 text-sm">{feat.title}</h4>
                <p className="text-xs text-mint-700 mt-0.5">{feat.desc}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
