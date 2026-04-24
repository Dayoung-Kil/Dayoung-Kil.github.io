---
---
(function () {
  if (!('IntersectionObserver' in window)) return;

  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reduceMotion) return;

  document.addEventListener('DOMContentLoaded', function () {
    document.documentElement.classList.add('has-fade-in');

    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('fade-in--visible');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.08, rootMargin: '0px 0px -40px 0px' });

    var selector = [
      '.post > header',
      '.post > article > *',
      '.profile',
      '.card',
      '.timeline-item',
      '.news .row'
    ].join(',');

    document.querySelectorAll(selector).forEach(function (el, i) {
      el.classList.add('fade-in');
      el.style.setProperty('--fade-delay', Math.min(i % 6, 5) * 70 + 'ms');
      observer.observe(el);
    });
  });
})();
