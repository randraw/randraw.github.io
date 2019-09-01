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

  this.randomRgba = function() {
    return `rgba(${Utils.randomByte()},${Utils.randomByte()},${Utils.randomByte()},${Math.random()})`
  };

  this.currentMillis = function () {
    return new Date().getTime();
  };

  this.millisToTimeStr = function(millis) {
    let r = Math.round;
    let p = x => String(x).padStart(2, '0');
    let seconds = r(millis / 1000) % 60;
    let minutes = r((millis / 1000) / 60) % 60;
    let hours = r(((millis / 1000) / 60) / 60);
    return `${hours ? `${p(hours)}:` : ''}${p(minutes)}:${p(seconds)}`;
  }
}

const Utils = Object.freeze(new UtilsConstructor());
