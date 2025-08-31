"use client";

import { formatPrice } from "../lib/formatPrice";
import Image from "next/image";

export default function CartItem({
  item,
  onQuantityChange,
  onRemove,
  disabled = false,
}: {
  item: { id: string; name: string; price: number; image: string; quantity: number };
  onQuantityChange: (quantity: number) => void;
  onRemove: () => void;
  disabled?: boolean;
}) {
  return (
    <div className="flex items-center gap-4 rounded-lg border border-light-border-primary p-4 bg-light-surface-primary shadow-soft">
      <div className="h-16 w-16 rounded-lg bg-light-bg-tertiary overflow-hidden">
        {item.image && (
          <Image
            src={item.image} 
            alt={item.name} 
            width={64}
            height={64}
            className="h-full w-full object-cover rounded-lg"
          />
        )}
      </div>
      <div className="flex-1">
        <p className="font-medium text-light-text-primary">{item.name}</p>
        <p className="text-sm text-primary font-semibold">{formatPrice(item.price)}</p>
        <div className="mt-3 flex items-center gap-2 text-sm">
          <button 
            onClick={() => onQuantityChange(Math.max(1, item.quantity - 1))} 
            disabled={disabled}
            className="rounded-md border border-light-border-primary px-3 py-1 hover:bg-light-interactive-hover dark:hover:bg-highlight disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            -
          </button>
          <span className="px-3 py-1 bg-light-bg-tertiary dark:bg-neutral-700 text-light-text-primary dark:text-neutral-100 rounded-md font-medium ring-1 ring-light-border-primary dark:ring-neutral-600">{item.quantity}</span>
          <button 
            onClick={() => onQuantityChange(item.quantity + 1)} 
            disabled={disabled}
            className="rounded-md border border-light-border-primary px-3 py-1 hover:bg-light-interactive-hover dark:hover:bg-highlight disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            +
          </button>
          <button 
            onClick={onRemove} 
            disabled={disabled}
            className="ml-4 text-error hover:text-error-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
          >
            Remove
          </button>
        </div>
      </div>
    </div>
  );
}
