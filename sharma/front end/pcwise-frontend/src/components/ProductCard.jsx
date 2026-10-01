import {
  Cpu,
  CircuitBoard,
  MemoryStick,
  HardDrive,
  Monitor,
  Keyboard,
  Mouse,
  Zap,
  Box,
  Fan,
  Check,
} from "lucide-react";
import { money } from "../lib/preferences";
const icons = {
  CPU: Cpu,
  GPU: Monitor,
  Motherboard: CircuitBoard,
  RAM: MemoryStick,
  SSD: HardDrive,
  PSU: Zap,
  Cabinet: Box,
  Cooler: Fan,
  Monitor,
  Keyboard,
  Mouse,
};
export default function ProductCard({ product }) {
  const Icon = icons[product.category] || Box;
  return (
    <article className="product-card">
      <div className="part-icon">
        <Icon size={21} aria-hidden="true" />
      </div>
      <div className="part-copy">
        <p className="product-category">{product.category}</p>
        <h3>{product.name}</h3>
        {product.detail && (
          <p className="product-description">{product.detail}</p>
        )}
        {product.reason && (
          <p className="part-reason">
            <Check size={14} aria-hidden="true" />
            {product.reason}
          </p>
        )}
        {!!product.specifications?.length && (
          <details className="spec-details">
            <summary>Technical specifications</summary>
            <dl>
              {product.specifications.map(([label, value]) => (
                <div key={label}>
                  <dt>{label}</dt>
                  <dd>{String(value)}</dd>
                </div>
              ))}
            </dl>
          </details>
        )}
      </div>
      <strong>{money(product.price)}</strong>
    </article>
  );
}
