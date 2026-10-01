import { useEffect, useState } from "react";
import Footer from "./components/Footer";
import Navbar from "./components/Navbar";
import Home from "./pages/Home";
import PCBuilder from "./pages/PCBuilder";
import Peripherals from "./pages/Peripherals";
import { API_MODE } from "./services/api";
const getPage = () =>
  ["builder", "peripherals"].includes(window.location.hash.slice(1))
    ? window.location.hash.slice(1)
    : "home";
export default function App() {
  const [currentPage, setCurrentPage] = useState(getPage);
  useEffect(() => {
    function sync() {
      setCurrentPage(getPage());
    }
    window.addEventListener("hashchange", sync);
    return () => window.removeEventListener("hashchange", sync);
  }, []);
  useEffect(() => {
    document.title = `${currentPage === "builder" ? "PC Builder" : currentPage === "peripherals" ? "Peripherals" : "Build with confidence"} | PCWise`;
    window.scrollTo({
      top: 0,
      behavior: "instant",
    });
    document.getElementById("main-content")?.focus({
      preventScroll: true,
    });
  }, [currentPage]);
  function navigateTo(page) {
    window.location.hash = page;
  }
  return (
    <div className="app-shell">
      <a
        className="skip-link"
        href="#main-content"
        onClick={(e) => {
          e.preventDefault();
          document.getElementById("main-content")?.focus();
        }}
      >
        Skip to content
      </a>
      <Navbar currentPage={currentPage} onNavigate={navigateTo} />
      <div className="mode-banner">
        <div className="container">
          <span className="mode-dot" />
          {API_MODE === "demo"
            ? "Local demo · Explore sample recommendations. Products and prices are illustrative."
            : "Connected mode · Recommendations come from your local service."}
        </div>
      </div>
      <main id="main-content" tabIndex={-1}>
        <div hidden={currentPage !== "home"}>
          <Home onNavigate={navigateTo} />
        </div>
        <div hidden={currentPage !== "builder"}>
          <PCBuilder />
        </div>
        <div hidden={currentPage !== "peripherals"}>
          <Peripherals />
        </div>
      </main>
      <Footer />
    </div>
  );
}
