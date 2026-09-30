import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

export default function TrajectorySection() {
  const sectionRef = useRef(null);
  const containerRef = useRef(null);

  useEffect(() => {
    const section = sectionRef.current;
    const container = containerRef.current;
    if (!section || !container) return;

    const ctx = gsap.context(() => {
      const sentences = container.querySelectorAll('.trajectory-sentence');
      const visualLeft = container.querySelector('.trajectory-portal-left');
      const visualRight = container.querySelector('.trajectory-portal-right');

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: section,
          start: 'top top',
          end: '+=2000',
          pin: true,
          pinSpacing: true,
          scrub: 1,
          invalidateOnRefresh: true,
        },
      });

      sentences.forEach((sentence, idx) => {
        if (idx === 0) {
          tl.fromTo(sentence, { opacity: 1, y: 0 }, { opacity: 0, y: -60, duration: 1 });
        } else if (idx === sentences.length - 1) {
          tl.fromTo(sentence, { opacity: 0, y: 60 }, { opacity: 1, y: 0, duration: 1 });
        } else {
          tl.fromTo(sentence, { opacity: 0, y: 60 }, { opacity: 1, y: 0, duration: 1 })
            .to(sentence, { opacity: 0, y: -60, duration: 1 });
        }
      });

      if (visualLeft && visualRight) {
        tl.fromTo(
          [visualLeft, visualRight],
          { scaleX: 0, opacity: 0 },
          { scaleX: 1, opacity: 1, duration: 2, ease: 'power2.inOut' },
          '<'
        );
      }
    }, section);

    return () => ctx.revert();
  }, []);

  return (
    <section ref={sectionRef} className="trajectory-section" id="journey">
      <div ref={containerRef} className="trajectory-container">
        <div className="trajectory-portals">
          <div className="trajectory-portal trajectory-portal-left" />
          <div className="trajectory-portal trajectory-portal-right" />
        </div>

        <div className="trajectory-content">
          <span className="trajectory-label">THE JOURNEY</span>
          <div className="trajectory-sentences-wrap">
            <h2 className="trajectory-sentence active">
              First<br />
              <span className="highlight-text">art direction.</span>
            </h2>
            <h2 className="trajectory-sentence">
              Then<br />
              <span className="highlight-text">front-end development.</span>
            </h2>
            <h2 className="trajectory-sentence">
              Today<br />
              <span className="highlight-text-gradient">I bridge the two.</span>
            </h2>
          </div>
        </div>
      </div>
    </section>
  );
}
