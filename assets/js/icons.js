/* ==========================================================================
   icons.js: the custom black-and-white glyph set used instead of emoji.
   Every glyph is drawn on a 24 by 24 grid with one stroke weight and uses
   currentColor, so it is black on paper and white on the chalkboard.
     class "f"  solid fill      class "h"  light tint fill
   Use in HTML:  <i data-ic="arm"></i>      Use in JS:  icon('arm')
   ========================================================================== */
(function (root) {
  'use strict';
  var R3 = function (inner) {
    return '<g>' + inner + '</g><g transform="rotate(120 12 12)">' + inner + '</g><g transform="rotate(240 12 12)">' + inner + '</g>';
  };

  var ICONS = {
    /* ---------------- robots and hardware ---------------- */
    arm: '<path d="M3 21h9"/><path class="h" d="M5 21v-2a2.5 2.5 0 0 1 5 0v2z"/><path d="M5 21v-2a2.5 2.5 0 0 1 5 0v2"/><path d="M7.5 16.5v-2.4"/><circle cx="7.5" cy="12.4" r="1.7"/><path d="M8.7 11.2l4.6-4.6"/><circle cx="14.5" cy="5.4" r="1.7"/><path d="M16 6.2l3.2 1.65"/><path d="M21.6 7.5l-2.4.35 1.1 2.1"/>',
    robot: '<rect class="h" x="4.5" y="7.5" width="15" height="11.5" rx="2.5"/><rect x="4.5" y="7.5" width="15" height="11.5" rx="2.5"/><path d="M12 7.5V4.7"/><circle class="f" cx="12" cy="3.6" r="1.2"/><circle class="f" cx="9" cy="12.3" r="1.5"/><circle class="f" cx="15" cy="12.3" r="1.5"/><path d="M9.5 16h5"/><path d="M2.5 11.5v4M21.5 11.5v4"/>',
    omni: '<circle class="h" cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="6"/>' + R3('<rect class="f" x="9.4" y="2.5" width="5.2" height="2.7" rx="1.3"/>') + '<path d="M12 12V8.4"/><circle class="f" cx="12" cy="12" r="1.1"/>',
    rover: '<rect class="h" x="7" y="5" width="10" height="14" rx="2"/><rect x="7" y="5" width="10" height="14" rx="2"/><rect class="f" x="3.4" y="8" width="2.6" height="8" rx="1.3"/><rect class="f" x="18" y="8" width="2.6" height="8" rx="1.3"/><path d="M12 15.5V9"/><path d="M9.8 11.2L12 9l2.2 2.2"/>',
    drone: '<path d="M8.2 8.2l7.6 7.6M15.8 8.2l-7.6 7.6"/><circle cx="6" cy="6" r="3"/><circle cx="18" cy="6" r="3"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="18" r="3"/><rect class="f" x="9.8" y="9.8" width="4.4" height="4.4" rx="1"/>',
    thruster: '<rect class="h" x="6.5" y="8" width="11.5" height="8" rx="4"/><rect x="6.5" y="8" width="11.5" height="8" rx="4"/><path d="M2 12h4.5M2.5 9.3h2.4M2.5 14.7h2.4"/><path d="M18 12h3.6"/><path d="M19.7 10l2 2-2 2"/><circle class="f" cx="13.6" cy="12" r="1.2"/>',
    gripper: '<path d="M12 2.8v5.2"/><path d="M6.5 8h11"/><path d="M6.5 8v5l3 3.2v4"/><path d="M17.500 8v5l-3 3.200v4"/><rect class="f" x="10.300" y="16.600" width="3.400" height="3.400"/>',
    squeeze: '<rect class="h" x="9" y="7.500" width="6" height="9"/><rect x="9" y="7.500" width="6" height="9"/><path d="M2.300 12h5M5 9.500L7.500 12 5 14.500"/><path d="M21.700 12h-5M19 9.500L16.500 12l2.500 2.500"/>',
    beacon: '<path d="M12 21V11"/><path d="M8.500 21h7"/><circle class="f" cx="12" cy="8.500" r="2"/><path d="M7.400 12.600a6 6 0 0 1 0-8.200"/><path d="M16.600 12.600a6 6 0 0 0 0-8.200"/><path d="M4.600 14.800a10 10 0 0 1 0-12.600"/><path d="M19.400 14.800a10 10 0 0 0 0-12.600"/>',
    lidar: '<circle cx="12" cy="12" r="9" stroke-dasharray="1.200 3.200"/><path class="h" d="M12 12L20.500 9a9 9 0 0 0-5.500-5.500z"/><path d="M12 12l8.500-3M12 12l3-8.500"/><circle class="f" cx="12" cy="12" r="1.900"/>',
    camera: '<rect class="h" x="3" y="7" width="13" height="10" rx="1.500"/><rect x="3" y="7" width="13" height="10" rx="1.500"/><path d="M16 10.500l5-2.500v8l-5-2.500"/><circle cx="9.500" cy="12" r="2.400"/>',
    gear: '<circle cx="12" cy="12" r="6.200"/><circle cx="12" cy="12" r="2.300"/><path d="M12 2.600v3.200M12 18.200v3.200M2.600 12h3.200M18.200 12h3.200M5.350 5.350l2.250 2.250M16.400 16.400l2.250 2.250M5.350 18.650l2.250-2.250M16.400 7.600l2.250-2.250"/>',
    motor: '<rect class="h" x="3.500" y="7.500" width="11.500" height="9.500" rx="1.500"/><rect x="3.500" y="7.500" width="11.500" height="9.500" rx="1.500"/><path d="M15 12.200h5.800"/><path d="M18.600 9.400v5.600"/><path d="M6.800 7.500V5.300M11.700 7.500V5.300"/><path d="M7 10.500v3.500M9.800 10.500v3.500"/>',
    wheel: '<circle cx="12" cy="12" r="8.500"/><circle class="f" cx="12" cy="12" r="2"/><path d="M12 3.500V10M12 14v6.500M3.500 12H10M14 12h6.500"/>',
    joint: '<path d="M3 17.500h6"/><circle cx="11.300" cy="17.500" r="2.300"/><circle class="f" cx="11.300" cy="17.500" r=".800"/><path d="M12.900 15.900L19.500 9"/><path d="M16.800 17.500a5.500 5.500 0 0 0-1.400-3.700" stroke-dasharray="1.400 2"/><path d="M20.800 5.200l-.300 3.900-3.900.300"/>',
    chip: '<rect x="6.500" y="6.500" width="11" height="11" rx="1"/><rect class="f" x="9.600" y="9.600" width="4.800" height="4.800"/><path d="M9.500 3.500v3M14.500 3.500v3M9.500 17.500v3M14.500 17.500v3M3.500 9.500h3M3.500 14.500h3M17.500 9.500h3M17.500 14.500h3"/>',
    push: '<path d="M19.500 3.500v17" stroke-width="2.600"/><path d="M3.500 12h11.500"/><path d="M11 8l4 4-4 4"/>',

    /* ---------------- linear algebra ---------------- */
    matrix: '<path d="M7 3.500H4v17h3M17 3.500h3v17h-3"/><circle class="f" cx="9.500" cy="9" r="1.150"/><circle class="f" cx="14.500" cy="9" r="1.150"/><circle class="f" cx="9.500" cy="15" r="1.150"/><circle class="f" cx="14.500" cy="15" r="1.150"/>',
    vector: '<path d="M5 19L18.500 5.500"/><path d="M12.500 5.200H19v6.500"/><circle class="f" cx="5" cy="19" r="1.500"/>',
    rows: '<path d="M3 17L21 8"/><path d="M6 3.500l10 17"/><circle class="f" cx="11.450" cy="12.800" r="2.100"/>',
    columns: '<path d="M9 8l12-3M16 17l5-12" stroke-dasharray="1.500 2.500"/><path d="M4 20L9 8"/><path d="M4 20l12-3"/><path d="M4 20L20.300 5.600"/><path d="M15.800 5.300L21 5l-.700 5.200"/><circle class="f" cx="4" cy="20" r="1.400"/>',
    stairs: '<path class="h" d="M3.500 4.500h17v15h-5.700v-5H9.100v-5H3.500z"/><path d="M3.500 4.500h17v15"/><path d="M3.500 4.500v5h5.600v5h5.700v5h5.700"/><circle class="f" cx="6.300" cy="7" r="1.150"/><circle class="f" cx="12" cy="12" r="1.150"/><circle class="f" cx="17.600" cy="17" r="1.150"/>',
    pivot: '<path d="M7 3.500H4v17h3M17 3.500h3v17h-3"/><circle cx="9.300" cy="9" r="2.700"/><circle class="f" cx="9.300" cy="9" r="1.150"/><circle class="f" cx="15" cy="9" r="1.150"/><circle class="f" cx="15" cy="15.300" r="1.150"/>',
    multiply: '<rect x="2.600" y="6.500" width="7" height="11" rx="1"/><rect class="h" x="14.400" y="6.500" width="7" height="11" rx="1"/><rect x="14.400" y="6.500" width="7" height="11" rx="1"/><path d="M10.800 10.800l2.400 2.400M13.200 10.800l-2.400 2.400"/>',
    inverse: '<path d="M4 9h10.500a5.500 5.500 0 0 1 0 11H8"/><path d="M8 5L4 9l4 4"/>',
    lu: '<path class="h" d="M4 4v16h16z"/><path d="M4 4h16v16H4z"/><path d="M4 4l16 16"/><circle class="f" cx="8" cy="15.500" r="1.150"/><circle class="f" cx="16" cy="8.500" r="1.150"/>',
    transpose: '<rect x="3.500" y="3.500" width="17" height="17" rx="1"/><path d="M3.500 3.500l17 17" stroke-dasharray="1.500 2.500"/><path d="M16.500 7.500l-9 9"/><path d="M12.900 7.500h3.600v3.600"/><path d="M11.100 16.500H7.500v-3.600"/>',
    permute: '<path d="M3.500 8h14"/><path d="M14 4.500L17.500 8 14 11.500"/><path d="M20.500 16h-14"/><path d="M10 12.500L6.500 16l3.500 3.500"/>',
    plane: '<path class="h" d="M2.500 17l5.500-8.500h13.500L16 17z"/><path d="M2.500 17l5.500-8.500h13.500L16 17z"/><path d="M12 12.800V3.500"/><path d="M9.800 5.700l2.200-2.200 2.200 2.200"/><circle class="f" cx="12" cy="12.800" r="1.400"/>',
    nullspace: R3('<path d="M12 2.300v5.500"/><path d="M9.800 5.700l2.200 2.200 2.200-2.200"/>') + '<circle class="f" cx="12" cy="12" r="2.200"/>',
    rank: '<path d="M3.500 20.500h17"/><rect class="f" x="5" y="11" width="3.400" height="7"/><rect class="f" x="10.300" y="5" width="3.400" height="13"/><rect class="h" x="15.600" y="14" width="3.400" height="4"/><rect x="15.600" y="14" width="3.400" height="4" stroke-dasharray="1.400 1.600"/>',
    rref: '<path d="M7 3.500H4v17h3M17 3.500h3v17h-3"/><path d="M9.300 6.800v4.400M14.700 12.800v4.400" stroke-width="2"/><circle cx="14.700" cy="9" r="1.300"/><circle cx="9.300" cy="15" r="1.300"/>',
    blocks: '<rect class="f" x="3.500" y="3.500" width="7.500" height="7.500"/><rect x="13" y="3.500" width="7.500" height="7.500"/><rect x="3.500" y="13" width="7.500" height="7.500"/><rect class="h" x="13" y="13" width="7.500" height="7.500"/><rect x="13" y="13" width="7.500" height="7.500"/>',
    frame: '<path d="M6 18V4.500M6 18h13.500"/><path d="M3.800 6.700L6 4.500l2.200 2.200M17.300 15.800l2.200 2.200-2.200 2.200"/><circle class="f" cx="6" cy="18" r="1.400"/>',
    axes: '<path d="M5 19V4M5 19h15.500M5 19l9.500-7"/><path d="M3 6l2-2 2 2M18.500 17l2 2-2 2M11.500 12.300l3-.300-.300 3"/><circle class="f" cx="5" cy="19" r="1.300"/>',
    spline: '<path d="M3.500 18c3-10 5.500-10 8.500-5s5.500 4 8.500-7"/><circle class="f" cx="3.500" cy="18" r="1.600"/><circle class="f" cx="12" cy="13" r="1.600"/><circle class="f" cx="20.500" cy="6" r="1.600"/>',
    torque: '<path d="M21.350 5.200v5.100h-5.100"/><path d="M19.220 14.550a7.650 7.650 0 1 1-1.800-7.960l3.930 3.710"/><circle class="f" cx="12" cy="12" r="1.700"/>',
    bolt: '<path class="h" d="M13.500 2.500L5 13.500h6l-1 8 8.500-11h-6z"/><path d="M13.500 2.500L5 13.500h6l-1 8 8.500-11h-6z"/>',
    grid: '<path d="M3.500 3.500h17v17h-17zM3.500 9.200h17M3.500 14.800h17M9.200 3.500v17M14.800 3.500v17"/>',
    infinity: '<path d="M12 12c-2-3-3.500-4.500-5.500-4.500a4.500 4.500 0 0 0 0 9c2 0 3.500-1.500 5.500-4.500s3.500-4.500 5.500-4.500a4.500 4.500 0 0 1 0 9c-2 0-3.500-1.500-5.500-4.500z"/>',

    /* ---------------- teaching and interface ---------------- */
    idea: '<path class="h" d="M8.500 14.500a6 6 0 1 1 7 0c-.700.600-1 1.300-1 2.200V17h-5v-.300c0-.900-.300-1.600-1-2.200z"/><path d="M8.500 14.500a6 6 0 1 1 7 0c-.700.600-1 1.300-1 2.200V17h-5v-.300c0-.900-.300-1.600-1-2.200z"/><path d="M9.800 19.500h4.400M10.800 21.700h2.400"/>',
    warn: '<path class="h" d="M12 3.500L21.500 20h-19z"/><path d="M12 3.500L21.500 20h-19z"/><path d="M12 9.500v5"/><circle class="f" cx="12" cy="17.200" r=".950"/>',
    spark: '<path class="f" d="M11 3l1.900 5.600 5.600 1.900-5.600 1.900L11 18l-1.900-5.600-5.600-1.900 5.600-1.900z"/><path d="M19 15.500v5M16.500 18h5"/>',
    check: '<path d="M4.500 12.500l5 5L19.500 7"/>',
    cross: '<path d="M6 6l12 12M18 6L6 18"/>',
    plus: '<path d="M12 5v14M5 12h14"/>',
    minus: '<path d="M5 12h14"/>',
    play: '<path class="f" d="M7 4.500v15l12.500-7.500z"/>',
    pause: '<rect class="f" x="6" y="4.500" width="4.200" height="15"/><rect class="f" x="13.800" y="4.500" width="4.200" height="15"/>',
    prev: '<path class="f" d="M17.500 5v14L8 12z"/><path d="M6.500 5v14"/>',
    next: '<path class="f" d="M6.500 5v14l9.500-7z"/><path d="M17.500 5v14"/>',
    reset: '<path d="M2.650 5.200v5.100h5.100"/><path d="M4.780 14.550a7.650 7.650 0 1 0 1.810-7.960L2.650 10.300"/>',
    loop: '<path d="M21.350 5.200v5.100h-5.100"/><path d="M19.220 14.550a7.650 7.650 0 1 1-1.800-7.960l3.930 3.710"/>',
    sun: '<circle cx="12" cy="12" r="3.600"/><path d="M12 2.500v2.600M12 18.900v2.600M2.500 12h2.600M18.900 12h2.600M5.300 5.300l1.800 1.800M16.900 16.900l1.800 1.800M5.300 18.700l1.800-1.800M16.900 7.100l1.800-1.800"/>',
    moon: '<path d="M20 14.200A8.500 8.500 0 1 1 9.800 4a6.800 6.800 0 0 0 10.200 10.200z"/>',
    'arrow-right': '<path d="M4 12h15"/><path d="M13.500 6.500L19 12l-5.500 5.500"/>',
    'arrow-left': '<path d="M20 12H5"/><path d="M10.500 6.500L5 12l5.500 5.500"/>',
    'arrow-down': '<path d="M12 4v15"/><path d="M6.500 13.500L12 19l5.500-5.500"/>',
    external: '<path d="M7 17L17 7"/><path d="M9 7h8v8"/>',
    video: '<rect x="2.800" y="5" width="18.400" height="14" rx="2"/><path class="f" d="M10 9v6l5.200-3z"/>',
    clock: '<circle cx="12" cy="12" r="8.500"/><path d="M12 7v5l3.200 2"/>',
    stopwatch: '<circle cx="12" cy="13.500" r="7.500"/><path d="M12 13.500V9.500M9.500 3h5M12 3v3M18 7.500L19.500 6"/>',
    book: '<path d="M12 6.500C10 5 7 4.600 3.500 5v13.500c3.500-.400 6.500 0 8.500 1.500 2-1.500 5-1.900 8.500-1.500V5C17 4.600 14 5 12 6.500z"/><path d="M12 6.500V20"/>',
    pen: '<path class="h" d="M4 20l1-4.500L16.500 4a2.120 2.120 0 0 1 3 3L8 18.500z"/><path d="M4 20l1-4.500L16.500 4a2.120 2.120 0 0 1 3 3L8 18.500z"/><path d="M14.500 6l3 3"/>',
    target: '<circle cx="12" cy="12" r="8.500"/><circle cx="12" cy="12" r="4.600"/><circle class="f" cx="12" cy="12" r="1.500"/>',
    question: '<circle cx="12" cy="12" r="8.500"/><path d="M9.400 9.600a2.700 2.700 0 1 1 3.900 2.400c-.800.500-1.300 1-1.300 2"/><circle class="f" cx="12" cy="16.900" r=".950"/>',
    flask: '<path class="h" d="M7.800 14.500h8.400l2.900 4.800a.800.800 0 0 1-.700 1.200H5.600a.800.800 0 0 1-.700-1.200z"/><path d="M9.300 3.500h5.400"/><path d="M10.500 3.500v6L4.800 19a1 1 0 0 0 .900 1.500h12.600a1 1 0 0 0 .900-1.500l-5.700-9.500v-6"/><path d="M7.800 14.500h8.400"/>',
    code: '<path d="M8.500 7L3.500 12l5 5M15.500 7l5 5-5 5M13.500 4.500l-3 15"/>',
    quote: '<path d="M4.500 16.500V12c0-3 1.500-5 4.500-5.500M13.500 16.500V12c0-3 1.500-5 4.500-5.500"/><rect class="f" x="4.500" y="12" width="4.600" height="4.600"/><rect class="f" x="13.500" y="12" width="4.600" height="4.600"/>',
    map: '<path d="M7.600 6.400l8.700 1.300M6.100 8.100l1.400 7.800M10.200 18l5.600-.300M17.300 10.100l-8 6.500"/><circle cx="5.500" cy="6" r="2.200"/><circle class="f" cx="18.500" cy="8" r="2.200"/><circle class="f" cx="8" cy="18" r="2.200"/><circle cx="18" cy="17.500" r="2.200"/>',
    sliders: '<path d="M4 7h9M17 7h3M4 12h3M11 12h9M4 17h11M19 17h1"/><circle cx="15" cy="7" r="2"/><circle cx="9" cy="12" r="2"/><circle cx="17" cy="17" r="2"/>',
    drag: '<path d="M12 3v18M3 12h18"/><path d="M9.500 5.500L12 3l2.500 2.500M9.500 18.500L12 21l2.500-2.500M5.500 9.500L3 12l2.500 2.500M18.500 9.500L21 12l-2.500 2.500"/>',
    eye: '<path d="M2.500 12S6 5.500 12 5.500 21.500 12 21.500 12 18 18.500 12 18.500 2.500 12 2.500 12z"/><circle class="f" cx="12" cy="12" r="2.800"/>',
    ruler: '<path d="M3 16.500L16.500 3 21 7.500 7.500 21z"/><path d="M7 12.500l2 2M10 9.500l2 2M13 6.500l2 2"/>',
    compass: '<circle cx="12" cy="12" r="8.500"/><path class="f" d="M15.800 8.200l-2.300 5.300-5.300 2.300 2.300-5.300z"/>',
    flag: '<path d="M5.500 21V3.500"/><path class="f" d="M5.500 4.500h12.500l-2.800 4 2.800 4H5.500z"/>',
    list: '<path d="M8 6.500h12M8 12h12M8 17.500h12"/><circle class="f" cx="4.200" cy="6.500" r="1.100"/><circle class="f" cx="4.200" cy="12" r="1.100"/><circle class="f" cx="4.200" cy="17.500" r="1.100"/>',
    link: '<path d="M10 14a4 4 0 0 0 5.700 0l3-3a4 4 0 0 0-5.700-5.700l-1 1"/><path d="M14 10a4 4 0 0 0-5.700 0l-3 3a4 4 0 0 0 5.700 5.700l1-1"/>',
    copy: '<rect x="8" y="8" width="12" height="12" rx="1.500"/><path d="M16 8V5.500A1.500 1.500 0 0 0 14.500 4h-9A1.500 1.500 0 0 0 4 5.500v9A1.500 1.500 0 0 0 5.500 16H8"/>'
  };

  /* tidy "8.500" style numbers written above into "8.5" */
  Object.keys(ICONS).forEach(function (k) {
    ICONS[k] = ICONS[k].replace(/(\d*\.\d*?[1-9])0+(?=[^\d]|$)/g, '$1').replace(/(\d)\.0+(?=[^\d]|$)/g, '$1');
  });

  function icon(name, cls) {
    var body = ICONS[name] || ICONS.question;
    return '<svg class="ic' + (cls ? ' ' + cls : '') + '" viewBox="0 0 24 24" aria-hidden="true" focusable="false">' + body + '</svg>';
  }
  /* a complete standalone SVG file, for use outside these pages */
  function iconFile(name) {
    var body = (ICONS[name] || '').replace(/class="f"/g, 'fill="#000" stroke="none"').replace(/class="h"/g, 'fill="#000" fill-opacity=".16" stroke="none"');
    return '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="96" height="96" fill="none" stroke="#000" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">' + body + '</svg>\n';
  }
  /* swap every <i data-ic="name"></i> placeholder for its glyph */
  function hydrate(scope) {
    var nodes = (scope || document).querySelectorAll('i[data-ic]');
    for (var i = 0; i < nodes.length; i++) {
      var el = nodes[i], t = document.createElement('template');
      t.innerHTML = icon(el.getAttribute('data-ic'), el.className);
      el.replaceWith(t.content.firstChild);
    }
  }

  root.ICONS = ICONS;
  root.icon = icon;
  root.iconFile = iconFile;
  root.hydrateIcons = hydrate;
  if (typeof module !== 'undefined' && module.exports) module.exports = { ICONS: ICONS, icon: icon, iconFile: iconFile };
})(typeof window !== 'undefined' ? window : globalThis);
