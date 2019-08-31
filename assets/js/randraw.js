function initTooltips() {
    $('[data-toggle="tooltip"]').tooltip();
}

function scaleImageSize(iw, ih, cw) {
  let wRatio = cw / iw;
  let newH = Math.round(ih * wRatio);
  return [cw, newH, cw, newH, ih / iw];
}

function reDrawImages() {
  let img = window.RandrawState.ImgIn;
  let canvasIn = window.RandrawState.Canvas.In;
  let canvasOut = window.RandrawState.Canvas.Out;
  let [imgW, imgH] = [img.width, img.height];
  let [newImgW, newImgH, newCanW, newCanH, imgRatio] = scaleImageSize(imgW, imgH, canvasIn.offsetWidth);
  window.RandrawState['imgRatio'] = imgRatio;
  canvasIn.width = newCanW;
  canvasIn.height = newCanH;
  canvasOut.width = newCanW;
  canvasOut.height = newCanH;
  let contextIn = window.RandrawState.CanvasContext.In;
  contextIn.drawImage(img, 0, 0, imgW, imgH, 0, 0, newImgW, newImgH);
  let contextOut = window.RandrawState.CanvasContext.Out;
  contextOut.fillStyle = '#eeeeee';
  contextOut.fillRect(0, 0, newCanW, newCanH);
}

function scoreImgData(data1, data2) {
  if (!data1 || !data2 || (data1.length !== data2.length)) {
    return 0;
  }
  let sum = 0;
  for (let i = 0; i < data1.length; i++) {
    let [a,b] = [data1[i], data2[i]];
    sum += Math.max(a,b) - Math.min(a,b);
  }
  return sum;
}

function updateUi() {
  $('#iteration-counter').text(window.RandrawState.Counter.Iteration);
  $('#score-counter').text(window.RandrawState.Counter.Score);
}

function run() {

  window.RandrawState.Counter.nextIteration();

  // Output Size
  let canvasOut = window.RandrawState.Canvas.Out;
  let [canW, canH] = [canvasOut.offsetWidth, canvasOut.offsetHeight];

  // Input Data
  let contextIn = window.RandrawState.CanvasContext.In;
  let dataIn = contextIn.getImageData(0,0,canW,canH).data;

  // Score output data before
  let contextOut = window.RandrawState.CanvasContext.Out;
  let imageDataOut1 = contextOut.getImageData(0,0,canW,canH);
  let dataOut1 = imageDataOut1.data;
  let score1 = scoreImgData(dataIn, dataOut1);

  // Random rect
  let [x, y] = [Utils.randomInt(0, canW), Utils.randomInt(0, canH)];
  let [w, h] = [Utils.randomInt(0, canW-x), Utils.randomInt(0, canH-y)];

  // Draw the rect
  contextOut.fillStyle = Utils.randomRgba();
  contextOut.fillRect(x, y, w, h);

  // Score output data after
  let dataOut2 = contextOut.getImageData(0,0,canW, canH).data;
  let score2 = scoreImgData(dataIn, dataOut2);

  // console.log(score1, score2, score2 < score1);
  if (score1 < score2) {
    contextOut.putImageData(imageDataOut1, 0, 0);
  } else {
    window.RandrawState.Counter.Score = score2;
  }
  setTimeout(function () {
    updateUi();
    setTimeout(run, 0);
  }, 0);
}

function loadImage() {
  let img = new Image();
  img.onload = () => {
    window.RandrawState['ImgIn'] = img;
    reDrawImages();
  };
  img.src = './tile.png';
}

function init() {
  loadImage();
  run();
}

function loadHandlebarsPartials(filemap = {}, callback) {
    let keys = Object.keys(filemap);
    (function loadPartial(idx) {
        if (idx >= keys.length) {
            if (callback) {
                return callback();
            }
            return null;
        }
        let key = keys[idx];
        $.ajax({
            url: filemap[key],
            cache: true,
            success: function(partialContent) {
                Handlebars.registerPartial(key, partialContent);
                loadPartial(idx + 1)
            }
        });
    })(0);
}

$(function() {

    $.isMobile = window.innerWidth < 768;

    Handlebars.registerHelper('str', function (str) {
        return Array.isArray(str) ? str.join(' ') : str;
    });

    let canvasIn = document.getElementById('canvas-in');
    let canvasOut = document.getElementById('canvas-out');
    window['RandrawState'] = {
        Canvas: {
          In: canvasIn,
          Out: canvasOut,
        },
        CanvasContext: {
          In: canvasIn.getContext('2d'),
          Out: canvasOut.getContext('2d'),
        },
        Counter: {
          Iteration: 0,
          Score: -1,
          nextIteration: function() {
            this.Iteration = this.Iteration + 1;
          }
        }
    };

    $(window).on('resize', () => {
      reDrawImages();
    });

    HashTabs.bind({
      tabsSelector: '.activate-tab.nav-link',
      linksSelector: '.activate-tab'
    });

    loadHandlebarsPartials({
      // 'name': 'assets/hbs/partial/partial.hbs',
    }, init);
});
