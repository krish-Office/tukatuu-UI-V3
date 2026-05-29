import { Minus, Plus } from "lucide-react";

interface QuantitySelectorProps {
  quantity: number;
  onIncrease: () => void;
  onDecrease: () => void;
}

export default function QuantitySelector({ quantity, onIncrease, onDecrease }: QuantitySelectorProps) {
  return (
    <div className="flex w-max items-center overflow-hidden rounded-xl border border-slate-700/80 bg-slate-950/70 shadow-inner shadow-black/20">
      <button 
        onClick={onDecrease}
        disabled={quantity <= 1}
        className="flex h-10 w-10 items-center justify-center text-mint-700 transition-colors hover:bg-slate-800/90 hover:text-white disabled:cursor-not-allowed disabled:opacity-40"
      >
        <Minus className="w-4 h-4" />
      </button>
      <div className="flex h-10 w-12 items-center justify-center border-x border-slate-700/80 font-semibold text-mint-900">
        {quantity}
      </div>
      <button 
        onClick={onIncrease}
        className="flex h-10 w-10 items-center justify-center text-mint-700 transition-colors hover:bg-slate-800/90 hover:text-white"
      >
        <Plus className="w-4 h-4" />
      </button>
    </div>
  );
}
