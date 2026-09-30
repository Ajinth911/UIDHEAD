import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

export default function ManifestoSection() {
  const sectionRef = useRef(null);
  const textRef = useRef(null);

  const rawText = 'I create experiences at the intersection of design and code.';

  useEffect(() => {
    const section = sectionRef.current;
    const textEl = textRef.current;
    if (!section || !textEl) return;

    const ctx = gsap.context(() => {
      const letters = textEl.querySelectorAll('.manifesto-letter');

      const horizontalTween = gsap.to(textEl, {
        x: () => -(textEl.scrollWidth - window.innerWidth + 120),
        ease: 'none',
        scrollTrigger: {
          trigger: section,
          start: 'top top',
          end: () => `+=${textEl.scrollWidth * 1.3}`,
          pin: true,
          pinSpacing: true,
          scrub: 1,
          invalidateOnRefresh: true,
        },
      });

      letters.forEach((letter) => {
        const randomRot = (Math.random() - 0.5) * 50;
        const randomY = (Math.random() - 0.5) * 120;

        gsap.fromTo(
          letter,
          {
            yPercent: randomY,
            rotation: randomRot,
            opacity: 0.6,
          },
          {
            yPercent: 0,
            rotation: 0,
            opacity: 1,
            ease: 'power2.out',
            scrollTrigger: {
              trigger: letter,
              containerAnimation: horizontalTween,
              start: 'left 95%',
              end: 'left 25%',
              scrub: 0.5,
            },
          }
        );
      });
    }, section);

    return () => ctx.revert();
  }, []);

  return (
    <section ref={sectionRef} className="manifesto-section" id="manifesto">
      <div className="manifesto-container">
        <div className="manifesto-track">
          <h2 ref={textRef} className="manifesto-text">
            {rawText.split(' ').map((word, wIdx) => (
              <span key={wIdx} className="manifesto-word">
                {word.split('').map((char, cIdx) => (
                  <span key={cIdx} className="manifesto-letter">
                    {char}
                  </span>
                ))}
                <span className="manifesto-space">&nbsp;</span>
              </span>
            ))}
          </h2>
        </div>
      </div>
    </section>
  );
}
