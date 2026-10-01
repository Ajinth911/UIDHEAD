import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

export default function UidSection() {
  const wrapperRef = useRef(null);
  const textRef = useRef(null);

  const rawText = 'uncommon institute of design';

  useEffect(() => {
    const wrapper = wrapperRef.current;
    const text = textRef.current;
    if (!wrapper || !text) return;

    const ctx = gsap.context(() => {
      const chars = text.querySelectorAll('.uid-char');

      const scrollTween = gsap.to(text, {
        xPercent: -100,
        ease: 'none',
        scrollTrigger: {
          trigger: wrapper,
          pin: true,
          start: 'top top',
          end: '+=5000px',
          scrub: true,
          invalidateOnRefresh: true,
        },
      });

      chars.forEach((char) => {
        gsap.from(char, {
          yPercent: gsap.utils.random(-200, 200),
          rotation: gsap.utils.random(-20, 20),
          ease: 'back.out(1.2)',
          scrollTrigger: {
            trigger: char,
            containerAnimation: scrollTween,
            start: 'left 100%',
            end: 'left 30%',
            scrub: 1,
          },
        });
      });
    }, wrapper);

    return () => ctx.revert();
  }, []);

  return (
    <section ref={wrapperRef} className="Horizontal" id="uid">
      <div className="container">
        <h3 ref={textRef} className="Horizontal__text heading-xl">
          {rawText.split(' ').map((word, wIdx) => (
            <span key={wIdx} className="uid-word">
              {word.split('').map((char, cIdx) => (
                <span key={cIdx} className="uid-char">
                  {char}
                </span>
              ))}
            </span>
          ))}
        </h3>
      </div>
    </section>
  );
}
