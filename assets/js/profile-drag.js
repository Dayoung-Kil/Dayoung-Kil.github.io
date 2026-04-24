---
---
// Profile drag — Stage B: move the profile block with mouse/touch,
// and the surrounding bio text reflows around it in real time.
//
// Trick: we drag via `margin-top` / `margin-right` instead of `transform`,
// so the browser's native float + shape-outside: margin-box recomputes
// text flow whenever the profile moves. No custom text layout engine needed.
(function () {
  document.addEventListener('DOMContentLoaded', function () {
    var profile = document.querySelector('.profile');
    if (!profile) return;

    // Prevent the browser's native image drag ghost
    profile.querySelectorAll('img').forEach(function (img) {
      img.setAttribute('draggable', 'false');
    });

    var isDragging = false;
    var startMouseX = 0;
    var startMouseY = 0;
    // currentX is the horizontal visual offset from the profile's natural
    // float-right pinned position; negative = moved left, positive = moved right.
    var currentX = 0;
    var currentY = 0;
    var baseX = 0;
    var baseY = 0;
    var rafPending = false;
    var usingFloatLeft = false;

    function applyTransform() {
      var container = profile.parentElement;
      var containerWidth = container ? container.clientWidth : 0;
      var profileWidth = profile.offsetWidth;
      // The profile's natural right-pinned position: left edge at naturalRightX
      var naturalRightX = Math.max(0, containerWidth - profileWidth);
      // Desired left edge of profile given current drag
      var desiredLeftX = naturalRightX + currentX;
      var desiredCenterX = desiredLeftX + profileWidth / 2;
      var halfWidth = containerWidth / 2;

      // Hysteresis around the midpoint (10px dead zone) to prevent flicker
      var shouldFloatLeft = usingFloatLeft
        ? desiredCenterX < halfWidth + 10
        : desiredCenterX < halfWidth - 10;

      if (shouldFloatLeft !== usingFloatLeft) {
        usingFloatLeft = shouldFloatLeft;
        if (usingFloatLeft) {
          profile.classList.remove('float-right');
          profile.classList.add('float-left');
        } else {
          profile.classList.remove('float-left');
          profile.classList.add('float-right');
        }
      }

      profile.style.marginTop = currentY + 'px';
      if (usingFloatLeft) {
        // float-left: margin-left places profile's left edge at desiredLeftX
        profile.style.marginLeft = desiredLeftX + 'px';
        profile.style.marginRight = '';
      } else {
        // float-right: margin-right is the offset from right edge
        // If currentX < 0, profile moved left → margin-right = -currentX (positive push)
        // If currentX > 0, profile moved right → margin-right = -currentX (negative push off edge)
        profile.style.marginRight = -currentX + 'px';
        profile.style.marginLeft = '';
      }
    }

    function scheduleApply() {
      if (rafPending) return;
      rafPending = true;
      requestAnimationFrame(function () {
        applyTransform();
        rafPending = false;
      });
    }

    function isInteractiveTarget(el) {
      while (el && el !== profile) {
        if (el.tagName === 'A' || el.tagName === 'BUTTON') return true;
        el = el.parentElement;
      }
      return false;
    }

    function onPointerDown(clientX, clientY, target) {
      if (isInteractiveTarget(target)) return false;
      isDragging = true;
      startMouseX = clientX;
      startMouseY = clientY;
      baseX = currentX;
      baseY = currentY;
      profile.classList.add('profile--dragging');
      document.body.classList.add('profile-drag-active');
      return true;
    }

    function onPointerMove(clientX, clientY) {
      if (!isDragging) return;
      currentX = baseX + (clientX - startMouseX);
      currentY = baseY + (clientY - startMouseY);
      scheduleApply();
    }

    function onPointerUp() {
      if (!isDragging) return;
      isDragging = false;
      profile.classList.remove('profile--dragging');
      document.body.classList.remove('profile-drag-active');
    }

    // Mouse events
    profile.addEventListener('mousedown', function (e) {
      if (onPointerDown(e.clientX, e.clientY, e.target)) {
        e.preventDefault();
      }
    });
    document.addEventListener('mousemove', function (e) {
      onPointerMove(e.clientX, e.clientY);
    });
    document.addEventListener('mouseup', onPointerUp);
    document.addEventListener('mouseleave', onPointerUp);

    // Touch events
    profile.addEventListener(
      'touchstart',
      function (e) {
        if (e.touches.length !== 1) return;
        var t = e.touches[0];
        onPointerDown(t.clientX, t.clientY, e.target);
      },
      { passive: true }
    );
    document.addEventListener(
      'touchmove',
      function (e) {
        if (!isDragging || e.touches.length !== 1) return;
        var t = e.touches[0];
        onPointerMove(t.clientX, t.clientY);
        e.preventDefault();
      },
      { passive: false }
    );
    document.addEventListener('touchend', onPointerUp);
    document.addEventListener('touchcancel', onPointerUp);

    // Double-click to reset to original position (animated)
    profile.addEventListener('dblclick', function (e) {
      if (isInteractiveTarget(e.target)) return;
      currentX = 0;
      currentY = 0;
      profile.style.transition =
        'margin-top 0.4s cubic-bezier(0.25, 0.8, 0.3, 1.05), ' +
        'margin-right 0.4s cubic-bezier(0.25, 0.8, 0.3, 1.05), ' +
        'margin-left 0.4s cubic-bezier(0.25, 0.8, 0.3, 1.05)';
      applyTransform();
      setTimeout(function () {
        profile.style.transition = '';
      }, 450);
    });

    // Recompute on window resize so float-side stays coherent
    window.addEventListener('resize', function () {
      if (currentX !== 0 || currentY !== 0) scheduleApply();
    });
  });
})();
