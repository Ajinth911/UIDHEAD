import { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { ArrowUpRight } from 'lucide-react';

gsap.registerPlugin(ScrollTrigger);

const projects = [
  {
    id: 'ghibli',
    title: 'memories of ghibli',
    category: 'Interactive WebGL Experience',
    year: '2024',
    color: '#ff4d6d',
    image: 'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?w=800&auto=format&fit=crop&q=80',
    tags: ['Three.js', 'GLSL', 'GSAP'],
  },
  {
    id: 'mirage',
    title: 'mirage architecture',
    category: 'Art Direction & 3D Space',
    year: '2024',
    color: '#9b5de5',
    image: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&auto=format&fit=crop&q=80',
    tags: ['React', 'WebGL', 'Figma'],
  },
  {
    id: 'pulse',
    title: 'pulse sound festival',
    category: 'Dynamic Audio Visualizer',
    year: '2023',
    color: '#f15bb5',
    image: 'https://images.unsplash.com/photo-1550684848-fac1c5b4e853?w=800&auto=format&fit=crop&q=80',
    tags: ['WebAudio API', 'Creative Dev', 'Shaders'],
  },
  {
    id: 'ornate',
    title: 'ornate luxury studio',
    category: 'Editorial E-Commerce',
    year: '2023',
    color: '#fee440',
    image: 'https://images.unsplash.com/photo-1541701494587-cb58502866ab?w=800&auto=format&fit=crop&q=80',
    tags: ['Next.js', 'Shopify', 'Animations'],
  },
  {
    id: 'webflow',
    title: 'maë creative identity',
    category: 'Brand & Interaction System',
    year: '2023',
    color: '#00f5d4',
    image: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?w=800&auto=format&fit=crop&q=80',
    tags: ['Art Direction', 'Custom WebGL'],
  },
];

export default function HorizontalProjectsSection() {
  const sectionRef = useRef(null);
  const containerRef = useRef(null);
  const trackRef = useRef(null);
  const [activeImage, setActiveImage] = useState(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const section = sectionRef.current;
    const container = containerRef.current;
    const track = trackRef.current;
    if (!section || !container || !track) return;

    const ctx = gsap.context(() => {
      const scrollDistance = track.scrollWidth - window.innerWidth + 120;

      gsap.to(track, {
        x: () => -scrollDistance,
        ease: 'none',
        scrollTrigger: {
          trigger: section,
          start: 'top top',
          end: () => `+=${scrollDistance * 1.3}`,
          pin: container,
          scrub: 1,
          invalidateOnRefresh: true,
        },
      });

      const cards = track.querySelectorAll('.project-horizontal-card');
      cards.forEach((card) => {
        gsap.fromTo(
          card,
          { scale: 0.92, opacity: 0.8 },
          {
            scale: 1,
            opacity: 1,
            ease: 'power2.out',
            scrollTrigger: {
              trigger: card,
              containerAnimation: gsap.getTweensOf(track)[0],
              start: 'left 90%',
              end: 'left 30%',
              scrub: 0.5,
            },
          }
        );
      });
    }, section);

    return () => ctx.revert();
  }, []);

  const handleMouseMove = (e) => {
    setMousePos({ x: e.clientX, y: e.clientY });
  };

  return (
    <section
      ref={sectionRef}
      className="horizontal-projects-section"
      id="projects"
      onMouseMove={handleMouseMove}
    >
      <div ref={containerRef} className="horizontal-projects-container">
        <div className="projects-header-bar">
          <span className="projects-badge">SELECTED WORKS</span>
          <h2 className="projects-title">Featured Projects</h2>
          <span className="projects-counter">01 — 05</span>
        </div>

        <div ref={trackRef} className="projects-horizontal-track">
          {projects.map((project, idx) => (
            <div
              key={project.id}
              className="project-horizontal-card"
              onMouseEnter={() => setActiveImage(project.image)}
              onMouseLeave={() => setActiveImage(null)}
            >
              <div className="card-number">0{idx + 1}</div>
              <div
                className="card-media-wrap"
                style={{ '--accent-color': project.color }}
              >
                <img
                  src={project.image}
                  alt={project.title}
                  className="card-img"
                  loading="lazy"
                />
                <div className="card-media-overlay" />
              </div>
              <div className="card-content">
                <div className="card-category-row">
                  <span className="card-cat">{project.category}</span>
                  <span className="card-year">{project.year}</span>
                </div>
                <h3 className="card-title">
                  {project.title}
                  <ArrowUpRight className="card-arrow" size={24} />
                </h3>
                <div className="card-tags">
                  {project.tags.map((tag) => (
                    <span key={tag} className="card-tag">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>

        {activeImage && (
          <div
            className="cursor-image-follower"
            style={{
              left: `${mousePos.x}px`,
              top: `${mousePos.y}px`,
            }}
          >
            <img src={activeImage} alt="" className="follower-img" />
          </div>
        )}
      </div>
    </section>
  );
}
