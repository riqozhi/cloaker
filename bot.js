function isClientBot(fp) {
  const device = fp.device.toLowerCase();
  const browser = fp.browser.toLowerCase();

  const isMobileOrSpecial = [
    'mobile', 'tablet', 'smarttv',
    'console (playstation)', 'console (xbox)', 'console (nintendo)', 'car'
  ].includes(device);

  // === Kriteria deteksi
  if (fp.webdriver === true) return true;

  // Safari = plugins kosong itu normal
  const isSafari = browser.includes('safari') && !browser.includes('chrome');
  if (!isMobileOrSpecial && fp.plugins.length === 0 && !isSafari) return true;

  if (fp.languages.length === 0) return true;
  if (fp.screen[0] === 0 || fp.screen[1] === 0) return true;
  if (fp.hardwareConcurrency <= 1 && !isMobileOrSpecial) return true;
  if (fp.touchPoints === 0 && isMobileOrSpecial) return true;

  if (fp.canvas.length > 0 && fp.canvas.length < 20) return true;
  if (fp.audio.length > 0 && fp.audio.length < 5) return true;

  const webglSuspicious = (fp.webgl.length > 0 && fp.webgl.length < 20)
    && (!fp.webglManual || fp.webglManual.includes("not supported") || fp.webglManual === "WebGL detection error");
  if (webglSuspicious) return true;

  return false;
}
