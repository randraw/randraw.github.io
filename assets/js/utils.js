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
}

const Utils = Object.freeze(new UtilsConstructor());
