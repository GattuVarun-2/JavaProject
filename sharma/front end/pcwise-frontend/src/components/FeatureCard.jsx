import { ArrowUpRight } from "lucide-react";
function FeatureCard({ icon: Icon, title, description, actionLabel, onClick }) {
  return (
    <article className="feature-card">
      <div className="feature-icon">
        <Icon size={25} aria-hidden="true" />
      </div>
      <h3>{title}</h3>
      <p>{description}</p>
      <button className="text-button" onClick={onClick}>
        {actionLabel} <ArrowUpRight size={17} aria-hidden="true" />
      </button>
    </article>
  );
}
export default FeatureCard;
