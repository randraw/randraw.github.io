function UtilsConstructor() {

  this.randomInt = function(min, max) {
    min = min || 0;
    max = max || Number.MAX_SAFE_INTEGER;
    if (min > max) {
      throw new Error(`Utils.randomInt :: min (${min}) > max (${max})`);
    }
    return (Math.random() * (max - min)) + min;
  };

  this.randomByte = function() {
    return this.randomInt(0,255);
  };

  this.randomRgba = function(isGreyscale = false) {
    let alpha = Utils.randomByte();
    let byte1 = Utils.randomByte();
    return isGreyscale ?
      `rgba(${byte1},${byte1},${byte1},${alpha})`
      : `rgba(${byte1},${Utils.randomByte()},${Utils.randomByte()},${alpha})`;
  };

  this.currentMillis = function () {
    return new Date().getTime();
  };

  this.millisToTimeStr = function(millis) {
    let r = Math.floor;
    let p = x => String(x).padStart(2, '0');
    let seconds = r(millis / 1000) % 60;
    let minutes = r(r(millis / 1000) / 60) % 60;
    let hours = r(r(r(millis / 1000) / 60) / 60);
    return `${hours ? `${p(hours)}:` : ''}${p(minutes)}:${p(seconds)}`;
  }
}

const Utils = Object.freeze(new UtilsConstructor());
