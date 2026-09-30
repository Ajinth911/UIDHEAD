import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Code, Palette, Box, Cpu, Sparkles, Layers } from 'lucide-react';

gsap.registerPlugin(ScrollTrigger);

const tools = [
  { name: 'Three.js', desc: '3D Web Experiences', category: 'Creative Dev', icon: Box, color: '#ff1400' },
  { name: 'GLSL Shaders', desc: 'Procedural GPU Art', category: 'Creative Dev', icon: Sparkles, color: '#d82878' },
  { name: 'GSAP', desc: 'High Performance Scroll', category: 'Creative Dev', icon: Layers, color: '#88ce02' },
  { name: 'React / Vite', desc: 'Modern Architecture', category: 'Frontend', icon: Code, color: '#61dafb' },
  { name: 'Figma', desc: 'Visual Systems & UI', category: 'Art Direction', icon: Palette, color: '#a259ff' },
  { name: 'WebGL', desc: 'Custom Canvas Pipelines', category: 'Creative Dev', icon: Cpu, color: '#ff5477' },
];

export default function ToolkitSection() {
  const sectionRef = useRef(null);
  const containerRef = useRef(null);
  const wheelRef = useRef(null);

  useEffect(() => {
    const section = sectionRef.current;
    const container = containerRef.current;
    const wheel = wheelRef.current;
    if (!section || !container || !wheel) return;

    const ctx = gsap.context(() => {
      const cards = wheel.querySelectorAll('.toolkit-card-item');

      gsap.to(wheel, {
        x: () => -(wheel.scrollWidth - window.innerWidth + 100),
        ease: 'none',
        scrollTrigger: {
          trigger: section,
          start: 'top top',
          end: () => `+=${wheel.scrollWidth * 1.2}`,
          pin: container,
          scrub: 1,
          invalidateOnRefresh: true,
        },
      });

      cards.forEach((card, i) => {
        gsap.fromTo(
          card,
          { rotation: i % 2 === 0 ? 8 : -8, yPercent: 20 },
          {
            rotation: 0,
            yPercent: 0,
            ease: 'power2.out',
            scrollTrigger: {
              trigger: card,
              containerAnimation: gsap.getTweensOf(wheel)[0],
              start: 'left 90%',
              end: 'left 40%',
              scrub: 0.5,
            },
          }
        );
      });
    }, section);

    return () => ctx.revert();
  }, []);

  return (
    <section ref={sectionRef} className="toolkit-section" id="toolkit">
      <div ref={containerRef} className="toolkit-container">
        <div className="toolkit-header">
          <span className="toolkit-label">SKILLS & TECHNOLOGIES</span>
          <h2 className="toolkit-title">Creative Toolkit</h2>
        </div>

        <div ref={wheelRef} className="toolkit-track">
          {tools.map((t) => {
            const IconComp = t.icon;
            return (
              <div key={t.name} className="toolkit-card-item">
                <div className="toolkit-card-inner" style={{ '--tool-accent': t.color }}>
                  <div className="toolkit-icon-box">
                    <IconComp size={32} />
                  </div>
                  <div className="toolkit-badge-tag">{t.category}</div>
                  <h3 className="toolkit-name">{t.name}</h3>
                  <p className="toolkit-desc">{t.desc}</p>
                  <div className="toolkit-card-glow" />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
