function isClientBot(e){let n=e.device.toLowerCase(),l=e.browser.toLowerCase(),t=["mobile","tablet","smarttv","console (playstation)","console (xbox)","console (nintendo)","car"].includes(n);if(!0===e.webdriver)return!0;let o=l.includes("safari")&&!l.includes("chrome");if(!t&&0===e.plugins.length&&!o||0===e.languages.length||0===e.screen[0]||0===e.screen[1]||e.hardwareConcurrency<=1&&!t||0===e.touchPoints&&t||e.canvas.length>0&&e.canvas.length<20||e.audio.length>0&&e.audio.length<5)return!0;let r=e.webgl.length>0&&e.webgl.length<20&&(!e.webglManual||e.webglManual.includes("not supported")||"WebGL detection error"===e.webglManual);return!!r}
