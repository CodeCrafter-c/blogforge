import { useEffect } from 'react';

export default function Cursor() {
  useEffect(() => {
    const cursor = document.getElementById('cursor');
    const trail = document.getElementById('cursor-trail');
    let trailX = 0, trailY = 0;
    let mouseX = 0, mouseY = 0;

    const moveCursor = (e) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
      cursor.style.left = mouseX + 'px';
      cursor.style.top = mouseY + 'px';
    };

    const animateTrail = () => {
      trailX += (mouseX - trailX) * 0.12;
      trailY += (mouseY - trailY) * 0.12;
      trail.style.left = trailX + 'px';
      trail.style.top = trailY + 'px';
      requestAnimationFrame(animateTrail);
    };

    const onMouseDown = () => cursor.classList.add('clicking');
    const onMouseUp = () => cursor.classList.remove('clicking');

    const onHoverIn = () => cursor.classList.add('hovering');
    const onHoverOut = () => cursor.classList.remove('hovering');

    document.addEventListener('mousemove', moveCursor);
    document.addEventListener('mousedown', onMouseDown);
    document.addEventListener('mouseup', onMouseUp);

    const interactables = document.querySelectorAll('a, button, [data-cursor]');
    interactables.forEach(el => {
      el.addEventListener('mouseenter', onHoverIn);
      el.addEventListener('mouseleave', onHoverOut);
    });

    animateTrail();

    return () => {
      document.removeEventListener('mousemove', moveCursor);
      document.removeEventListener('mousedown', onMouseDown);
      document.removeEventListener('mouseup', onMouseUp);
    };
  }, []);

  return (
    <>
      <div id="cursor" />
      <div id="cursor-trail" />
    </>
  );
}