import { Menu, X } from "lucide-react";
import { useState } from "react";
const navigationItems = [
  {
    id: "home",
    label: "Home",
  },
  {
    id: "builder",
    label: "PC Builder",
  },
  {
    id: "peripherals",
    label: "Peripherals",
  },
];
function Navbar({ currentPage, onNavigate }) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const handleNavigation = (page) => {
    onNavigate(page);
    setIsMenuOpen(false);
  };
  return (
    <header className="site-header">
      <nav className="navbar container" aria-label="Main navigation">
        <button
          className="brand"
          onClick={() => handleNavigation("home")}
          aria-label="Go to PCWise home"
        >
          <span className="brand-mark">P</span>PCWise
        </button>
        <div className="desktop-nav">
          {navigationItems.map((item) => (
            <button
              key={item.id}
              className={`nav-link ${currentPage === item.id ? "active" : ""}`}
              aria-current={currentPage === item.id ? "page" : undefined}
              onClick={() => handleNavigation(item.id)}
            >
              {item.label}
            </button>
          ))}
        </div>
        <button
          className="menu-button"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          aria-controls="mobile-navigation"
          aria-expanded={isMenuOpen}
          aria-label={
            isMenuOpen ? "Close navigation menu" : "Open navigation menu"
          }
        >
          {isMenuOpen ? <X aria-hidden="true" /> : <Menu aria-hidden="true" />}
        </button>
      </nav>
      {isMenuOpen && (
        <div id="mobile-navigation" className="mobile-nav container">
          {navigationItems.map((item) => (
            <button
              key={item.id}
              className="mobile-nav-link"
              aria-current={currentPage === item.id ? "page" : undefined}
              onClick={() => handleNavigation(item.id)}
            >
              {item.label}
            </button>
          ))}
        </div>
      )}
    </header>
  );
}
export default Navbar;
