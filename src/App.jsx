import { useEffect, useRef } from 'react';
import Lenis from 'lenis';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

import ThreeGradientScene from './components/ThreeGradientScene';
import './App.css';

gsap.registerPlugin(ScrollTrigger);

export default function App() {
  const heroPinContainerRef = useRef(null);
  const heroCardRef = useRef(null);
  const threeSceneRef = useRef(null);

  useEffect(() => {
    // 1. Initialize Lenis Smooth Scrolling
    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      orientation: 'vertical',
      gestureOrientation: 'vertical',
      smoothWheel: true,
      wheelMultiplier: 1.0,
      touchMultiplier: 1.5,
    });

    lenis.on('scroll', () => {
      ScrollTrigger.update();
    });

    let rafId;
    function raf(time) {
      lenis.raf(time);
      rafId = requestAnimationFrame(raf);
    }
    rafId = requestAnimationFrame(raf);

    // 2. Setup GSAP ScrollTrigger 3D Camera & Text Choreography
    const ctx = gsap.context(() => {
      if (heroPinContainerRef.current) {
        ScrollTrigger.create({
          trigger: heroPinContainerRef.current,
          start: 'top top',
          end: '+=3200',
          pin: true,
          pinSpacing: true,
          scrub: 1,
          invalidateOnRefresh: true,
          onUpdate: (self) => {
            threeSceneRef.current?.setScroll(self.progress, self.getVelocity());
          },
        });
      }
    });

    const timeout = setTimeout(() => {
      ScrollTrigger.refresh();
    }, 200);

    return () => {
      clearTimeout(timeout);
      cancelAnimationFrame(rafId);
      ctx.revert();
      lenis.destroy();
    };
  }, []);

  return (
    <div className="portfolio-wrapper">
      {/* Fixed Site Header Capsule Overlay */}
      <header className="site-header-overlay">
        <a href="#hero" className="header-logo" title="Guillaume Zhu">
          <svg
            className="logo-svg"
            viewBox="0 0 48 48"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <rect
              x="2"
              y="2"
              width="44"
              height="44"
              rx="4"
              stroke="currentColor"
              strokeWidth="2.5"
            />
            <path
              d="M19 28.5C18.5 29.8 17 31 15 31C12.2 31 10.5 28.8 10.5 25C10.5 21.2 12.5 19 15.5 19C18 19 19.5 20.8 19.5 23.5V31C19.5 35 17 37 13.5 37"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
            />
            <path
              d="M24 13V33.5C24 34.5 25 35 26.5 35H30"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
            />
          </svg>
        </a>

        <nav className="header-nav-capsule">
          <a href="#hero" className="nav-item">journey</a>
          <a href="#hero" className="nav-item">toolkit</a>
          <a href="#hero" className="nav-item">projects</a>
          <a href="#hero" className="nav-item">playground</a>
          <a href="#hero" className="nav-item">contact</a>
          <div className="nav-lang">
            <span className="lang-active">EN</span>
            <span className="lang-divider">/</span>
            <span className="lang-inactive">FR</span>
          </div>
        </nav>

        <div className="header-right-spacer" />
      </header>

      {/* Main Content Flow - Pure 3D Interactive Hero */}
      <main className="portfolio-main">
        <div id="hero-trigger" className="hero-scroll-wrapper">
          <section ref={heroPinContainerRef} className="hero-pin-section" id="hero">
            <div ref={heroCardRef} className="hero-inner-frame">
              <ThreeGradientScene
                ref={threeSceneRef}
                interactive={true}
                parallaxStrength={0.35}
                noiseOpacity={0.045}
              />
            </div>
          </section>
        </div>
      </main>

      {/* Left Bottom Scroll Indicator Bars */}
      <nav className="scroll-indicator-bars" aria-label="Page scroll position">
        <span className="bar active" />
        <span className="bar neighbor" />
        <span className="bar" />
        <span className="bar" />
        <span className="bar" />
        <span className="bar" />
      </nav>
    </div>
  );
}
