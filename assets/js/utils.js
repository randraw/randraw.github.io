function UtilsConstructor() {

  this.random = function(min, max) {
    min = min || 0;
    max = max || Number.MAX_SAFE_INTEGER;
    if (min > max) {
      throw new Error(`Utils.random :: min (${min}) > max (${max})`);
    }
    return (Math.random() * (max - min)) + min;
  };

  this.randomInt = function(min, max) {
    return Math.floor(this.random(min,max));
  };

  this.randomItem = function(arr) {
    return arr.length > 0 ? arr[this.randomInt(0, arr.length)] : undefined;
  };

  this.randomByte = function() {
    return this.randomInt(0,255);
  };

  this.FULL_RADIAN = Math.PI * 2;

  this.randomRadian = function(radMultiplier = 1) {
    return Math.random() * this.FULL_RADIAN * radMultiplier;
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
