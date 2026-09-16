/* ============================================================
   Scroll walker
   The hero headshot zooms out into the full-body photo as you
   scroll, then walks along the page with a gentle bob and sway.

   Head-matching numbers, measured from the two images:
     profile.png  900 x 896   face centre at 49.7% / 33% , head width 41.9%
     walk.png     637 x 1100  face centre at 49.8% / 7.5%, head width 22.8%
   So the body image is drawn 1.838x the width of the headshot,
   which makes the two heads exactly the same size mid-crossfade.
   ============================================================ */
(function () {
  'use strict';

  var BODY_W_RATIO   = 1.838;   // body width / headshot width, for equal head size
  var BODY_ASPECT    = 1100 / 637;
  var HEAD_ANCHOR_X  = 0.497, HEAD_ANCHOR_Y = 0.330;  // face centre inside headshot
  var BODY_ANCHOR_X  = 0.498, BODY_ANCHOR_Y = 0.075;  // face centre inside body shot

  var walker = document.querySelector('.walker');
  var slot   = document.querySelector('.portrait-wrap');
  var inner  = document.querySelector('.walker-inner');
  var head   = document.querySelector('.walker-head');
  var body   = document.querySelector('.walker-body');

  if (!walker || !slot || !inner || !head || !body) return;

  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)');

  var state = null;   // measurements, recalculated on resize
  var ticking = false;

  function clamp(v, a, b) { return v < a ? a : v > b ? b : v; }
  function lerp(a, b, t) { return a + (b - a) * t; }
  function ease(t) { return t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2; }

  function measure() {
    var vw = window.innerWidth;
    var vh = window.innerHeight;
    var r  = slot.getBoundingClientRect();
    var scrollY = window.pageYOffset;

    var headW = r.width;
    var headH = headW * (896 / 900);

    // where the face sits in the document while the headshot is in the hero
    var anchorDocX = r.left + headW * HEAD_ANCHOR_X;
    var anchorDocY = r.top + scrollY + headH * HEAD_ANCHOR_Y;

    // how tall the walking figure should be once it is small
    var walkH = vw < 700 ? Math.min(vh * 0.30, 250) : Math.min(vh * 0.42, 380);
    var kWalk = walkH / (headW * BODY_W_RATIO * BODY_ASPECT);

    var maxScroll = Math.max(1, document.documentElement.scrollHeight - vh);

    // the crossfade is kept short, and shorter still on a short page
    var startPx = Math.min(vh * 0.22, maxScroll * 0.14);
    var endPx   = startPx + Math.min(vh * 0.5, maxScroll * 0.3);

    return {
      vw: vw, vh: vh,
      headW: headW,
      anchorDocX: anchorDocX,
      anchorDocY: anchorDocY,
      walkH: walkH,
      kWalk: kWalk,
      startPx: startPx,
      endPx: endPx,
      docEnd: maxScroll,
      laneAmp: vw < 700 ? Math.min(vw * 0.07, 34) : Math.min(vw * 0.05, 70),
      // walk down the side, clear of the 720px reading column
      laneMid: vw < 760 ? vw * 0.76 : Math.min(vw - vw * 0.16, vw * 0.5 + 430)
    };
  }

  function render() {
    ticking = false;
    if (!state) return;

    var y = window.pageYOffset;
    var s = state;

    // ---- phase 1: headshot, sitting where the hero photo would be -----
    if (y <= s.startPx) {
      place(s.anchorDocX, s.anchorDocY - y, 1, 0, 1, 0);
      return;
    }

    var walkAnchorY = s.vh - 18 - s.walkH * (1 - BODY_ANCHOR_Y);

    // ---- phase 2: zoom out, crossfade into the full body --------------
    if (y < s.endPx) {
      var t = ease((y - s.startPx) / (s.endPx - s.startPx));
      var x = lerp(s.anchorDocX, s.laneMid, t);
      var yy = lerp(s.anchorDocY - y, walkAnchorY, t);
      var k = lerp(1, s.kWalk, t);
      place(x, yy, k, 0, clamp(1 - t * 2.1, 0, 1), clamp((t - 0.22) * 2.4, 0, 1));
      return;
    }

    // ---- phase 3: walking, driven by how far you have scrolled --------
    var q = clamp((y - s.endPx) / (s.docEnd - s.endPx), 0, 1);
    var stride = (y - s.endPx) / 320;                 // one step per ~260px scrolled
    var sway = Math.sin(stride * Math.PI);            // side to side
    var bob = Math.abs(Math.sin(stride * Math.PI)) * (s.walkH * 0.018);
    var tilt = Math.sin(stride * Math.PI) * 2.1;

    var exit = clamp((q - 0.88) / 0.12, 0, 1);        // walk off at the very end
    var x = s.laneMid + sway * s.laneAmp + exit * s.vw * 0.55;

    place(x, walkAnchorY - bob, s.kWalk, tilt, 0, 1 - exit);
  }

  function place(x, y, k, rot, headOpacity, bodyOpacity) {
    inner.style.transform =
      'translate3d(' + x.toFixed(1) + 'px,' + y.toFixed(1) + 'px,0) ' +
      'rotate(' + rot.toFixed(2) + 'deg) scale(' + k.toFixed(4) + ')';
    head.style.opacity = headOpacity;
    body.style.opacity = bodyOpacity;
  }

  function onScroll() {
    if (!ticking) {
      ticking = true;
      window.requestAnimationFrame(render);
    }
  }

  function enable() {
    document.body.classList.add('walker-on');
    inner.style.width = '1px';                 // anchor box; images are sized in CSS
    state = measure();
    head.style.width = state.headW + 'px';
    body.style.width = state.headW * BODY_W_RATIO + 'px';
    render();
  }

  function disable() {
    document.body.classList.remove('walker-on');
    state = null;
  }

  function start() {
    if (reduced.matches) { disable(); return; }
    enable();
  }

  // wait for the images so nothing flashes at the wrong size
  var pending = 2;
  function ready() { if (--pending === 0) start(); }
  [head, body].forEach(function (img) {
    if (img.complete) ready();
    else img.addEventListener('load', ready, { once: true });
  });

  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', function () {
    if (!document.body.classList.contains('walker-on')) return;
    state = measure();
    head.style.width = state.headW + 'px';
    body.style.width = state.headW * BODY_W_RATIO + 'px';
    render();
  });
  reduced.addEventListener('change', start);
})();
