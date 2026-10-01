import {
  ArrowRight,
  CheckCircle2,
  Cpu,
  Monitor,
  Sparkles,
  Wrench,
  ShieldCheck,
} from "lucide-react";
import Button from "../components/Button";
import FeatureCard from "../components/FeatureCard";
export default function Home({ onNavigate }) {
  return (
    <>
      <section className="hero-section">
        <div className="container hero-grid">
          <div className="hero-copy">
            <p className="eyebrow">
              <Sparkles size={16} aria-hidden="true" /> LESS GUESSWORK. BETTER
              BUILDS.
            </p>
            <h1>
              The right PC.
              <br />
              <span>For your world.</span>
            </h1>
            <p className="hero-description">
              Big ideas, late-night games, everyday work. Find the parts that
              fit what you do—and what you want to spend.
            </p>
            <div className="hero-actions">
              <Button onClick={() => onNavigate("builder")}>
                Find my build <ArrowRight size={17} aria-hidden="true" />
              </Button>
              <Button
                variant="secondary"
                onClick={() => onNavigate("peripherals")}
              >
                Explore peripherals
              </Button>
            </div>
            <p className="hero-note">
              <CheckCircle2 size={17} aria-hidden="true" /> No sign-up. Just
              your preferences.
            </p>
          </div>
          <div
            className="hero-panel"
            aria-label="Illustration of the recommendation process"
          >
            <div className="panel-topline">
              <span>YOUR NEXT SETUP</span>
              <span className="status-badge sample-badge">
                A clearer choice
              </span>
            </div>
            <div className="computer-illustration" aria-hidden="true">
              <div className="computer-screen">
                <Cpu size={48} strokeWidth={1.3} />
                <div className="screen-bars">
                  <i />
                  <i />
                  <i />
                </div>
              </div>
              <div className="computer-stand" />
              <div className="computer-base" />
            </div>
            <div className="hero-panel-caption">
              <strong>Built around you.</strong>
              <span>From a budget to a breakdown.</span>
            </div>
            <div className="mini-specs">
              <div>
                <span>01 · Your budget</span>
                <strong>Set your limit</strong>
              </div>
              <div>
                <span>02 · Your purpose</span>
                <strong>Work, play, create</strong>
              </div>
              <div>
                <span>03 · Your result</span>
                <strong>Every part explained</strong>
              </div>
            </div>
          </div>
        </div>
      </section>
      <section className="feature-section container">
        <div className="section-heading">
          <p className="eyebrow">ONE PLACE TO FIGURE IT OUT</p>
          <h2>Good choices start with clarity.</h2>
          <p>Choose a whole system, upgrade a part, or finish your desk.</p>
        </div>
        <div className="feature-grid">
          <FeatureCard
            icon={Cpu}
            title="Your next PC"
            description="Bring your budget and purpose. Explore a full system or find one component."
            actionLabel="Build a PC"
            onClick={() => onNavigate("builder")}
          />
          <FeatureCard
            icon={Wrench}
            title="Understand each choice"
            description="See itemized costs, selection reasons, and available compatibility checks."
            actionLabel="Explore the builder"
            onClick={() => onNavigate("builder")}
          />
          <FeatureCard
            icon={Monitor}
            title="Beyond the tower"
            description="Monitors, keyboards, and mice that share one budget and fit your everyday use."
            actionLabel="Find peripherals"
            onClick={() => onNavigate("peripherals")}
          />
        </div>
        <div className="trust-note">
          <ShieldCheck size={20} aria-hidden="true" />
          <p>
            You stay in control. Review every part and adjust your preferences
            at any time.
          </p>
        </div>
      </section>
    </>
  );
}
