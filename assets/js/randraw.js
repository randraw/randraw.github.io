function initTooltips() {
    $('[data-toggle="tooltip"]').tooltip();
}

function scaleImageSize(iw, ih, cw) {
  let wRatio = cw / iw;
  let newH = Math.round(ih * wRatio);
  return [cw, newH, cw, newH, ih / iw];
}

function scoreImgData(data1, data2) {
  if (!data1 || !data2 || (data1.length !== data2.length)) {
    throw new Error('Invalid scoring img data');
  }
  let sum = 0;
  let getRgba = (x,i) => [x[i], x[i+1], x[i+2], x[i+3]];
  let distance = (a,b) => Math.max(a,b) - Math.min(a,b);
  for (let i = 0; i < data1.length; i+=4) {
    let [[r1,g1,b1,a1],[r2,g2,b2,a2]] = [getRgba(data1, i), getRgba(data2, i)];
    if (window.RandrawState.Options.GreyscaleCompare) {
      sum += Math.round(distance((r1+g1+b1) / 3, (r2+g2+b2) / 3))
    } else {
      sum += (distance(r1,r2) + distance(g1,g2) + distance(b1,b2));
    }
  }
  return sum;
}

function scoreImgDataFromWhite(data) {
  if (!data) {
    throw new Error('Invalid scoring img data');
  }
  return scoreImgData(data, new Array(data.length).fill(255));
}

function drawOutputToDisplay() {
  let state = window.RandrawState;
  let contextOut = state.CanvasContext.Out;
  let outputCanvas = state.Output.MainCanvas;
  let [inpW, inpH] = state.Input.size();
  let [newW, newH] = state.ScaledImgSize;
  contextOut.globalAlpha = 1;
  if (state.Options.OutputOpacity < 1) {
    contextOut.drawImage(state.Canvas.In, 0, 0);
    contextOut.globalAlpha = state.Options.OutputOpacity;
  }
  contextOut.drawImage(outputCanvas, 0, 0, inpW, inpH, 0, 0, newW, newH);
}

function reDrawImages() {
  let state = window.RandrawState;
  let img = state.Input.MainImg;
  let canvasIn = state.Canvas.In;
  let canvasOut = state.Canvas.Out;
  let [imgW, imgH] = [img.width, img.height];
  let [newImgW, newImgH, newCanW, newCanH, imgRatio] = scaleImageSize(imgW, imgH, canvasIn.offsetWidth);
  state['imgRatio'] = imgRatio;
  state.ScaledImgSize = [newImgW, newImgH];
  canvasIn.width = newCanW;
  canvasIn.height = newCanH;
  canvasOut.width = newCanW;
  canvasOut.height = newCanH;
  let contextIn = state.CanvasContext.In;
  let contextOut = state.CanvasContext.Out;
  contextIn.drawImage(img, 0, 0, imgW, imgH, 0, 0, newImgW, newImgH);
  drawOutputToDisplay();
}

function updateUi() {
  let state = window.RandrawState;
  let counter = state.Counter;
  $('#score-counter').text(counter.Score);
  $('#iteration-counter').text(`${counter.Iteration.Successful} / ${counter.Iteration.Total}`);
  $('#time-counter').text(Utils.millisToTimeStr(counter.Time.dur()));
  $('#sp').prop('disabled', !state.RunningState.canRun);
  $('#sp-img').prop('src', state.RunningState.isRunning ? 'assets/img/pause.png' : 'assets/img/play.png');
  $('#upload-input').prop('disabled', state.RunningState.isRunning);
  $('#dl').prop('disabled', !window.RandrawState.Output.MainCanvas);
  drawOutputToDisplay();
}

function run() {

  let state = window.RandrawState;
  state.RunningState.isRunning = true;

  let time = Utils.currentMillis();
  if (state.RunningState.pauseFlag) {
    state.RunningState.pauseFlag = false;
    state.RunningState.isRunning = false;
    state.Counter.Time.PauseStart = time;
    updateUi();
    return;
  }
  if (state.Counter.Time.TimerStart < 0) {
    state.Counter.Time.TimerStart = time;
  } else if (state.Counter.Time.PauseStart > 0) {
    let pauseLen = time - state.Counter.Time.PauseStart;
    state.Counter.Time.PauseStart = -1;
    state.Counter.Time.TimerStart += pauseLen;
  }

  state.Counter.Iteration.totalUp();

  // Output Size
  let canvasOut = state.Output.MainCanvas;
  let [canW, canH] = [canvasOut.width, canvasOut.height];

  // Input Data
  let dataIn = state.Input.MainImgData;

  // Score output data before
  let contextOut = state.Output.MainCanvasContext;
  let imageDataOut1 = contextOut.getImageData(0,0,canW,canH);
  let dataOut1 = imageDataOut1.data;
  let score1 = scoreImgData(dataIn, dataOut1);
  let scoreRatio = score1 / state.Input.InitScore;

  // Random rect
  let [x, y] = [Utils.randomInt(5, canW - 5), Utils.randomInt(5, canH - 5)];
  let [maxW, maxH] = [Math.min(x, canW - x), Math.min(y, canH - y)];
  if (state.Options.DistanceRatioBias && (Math.random() > scoreRatio)) {
    [maxW, maxH] = [maxW * Utils.random(scoreRatio, 1), maxH * Utils.random(scoreRatio, 1)];
  }
  let [w, h] = [Utils.randomInt(0, maxW * 2), Utils.randomInt(0, maxH * 2)];

  let method = Utils.randomInt(0, 3);
  if (method === 0) {
    // Draw the rect
    contextOut.fillStyle = Utils.randomRgba(state.Options.GreyscaleDrawing);
    contextOut.fillRect(x - (w/2), y - (h/2), w, h);
  } else {
    let minSide = Math.min(w, h);
    contextOut.lineWidth = Utils.randomInt(Math.min(minSide, 1), minSide > 1 ? minSide / 2 : minSide);
    contextOut.strokeStyle = Utils.randomRgba(state.Options.GreyscaleDrawing);
    if (method === 1) {
      contextOut.strokeRect(x - (w/2), y - (h/2), w, h);
    } else {
      let direction = Math.random() > 0.5 ? 1 : -1;
      contextOut.beginPath();
      contextOut.moveTo(x - (w/2), y + ((h / 2) * direction));
      contextOut.lineTo(x + (w/2), y + ((h / 2) * -direction));
      contextOut.stroke();
    }
  }

  // Score output data after
  let dataOut2 = contextOut.getImageData(0,0,canW, canH).data;
  let score2 = scoreImgData(dataIn, dataOut2);

  // console.log(score1, score2, score2 < score1);
  if (score1 < score2) {
    contextOut.putImageData(imageDataOut1, 0, 0);
  } else {
    state.Counter.Score = scoreRatio;
    state.Counter.Iteration.successfulUp();
  }
  setTimeout(function () {
    updateUi();
    setTimeout(run, 0);
  }, 0);
}

function newWhiteCanvas(w, h) {
  let c = $("<canvas>")
    .attr("width", w)
    .attr("height", h)[0];
  let ctx = c.getContext("2d");
  ctx.fillStyle = 'white';
  ctx.fillRect(0, 0, w, h);
  return c;

}

function getImgData(img) {
  let c = newWhiteCanvas(img.width, img.height);
  let ctx = c.getContext('2d');
  ctx.drawImage(img, 0, 0, img.width, img.height);
  return ctx.getImageData(0, 0, img.width, img.height).data;
}

function loadImage(src, cb) {
  let img = new Image();
  img.onload = () => {
    let state = window.RandrawState;
    state.Input.MainImg = img;
    state.Input.MainImgData = getImgData(img);
    state.Output.MainCanvas = newWhiteCanvas(img.width, img.height);
    state.Output.MainCanvasContext = state.Output.MainCanvas.getContext('2d');
    let [imgW, imgH] = state.Input.size();
    state.Input.InitScore = imgW * imgH * 3 * 255;
    state.Counter.reset();
    state.Counter.Score = scoreImgDataFromWhite(state.Input.MainImgData) / state.Input.InitScore;
    reDrawImages();
    cb();
  };
  img.src = src;
}

function init() {
  loadImage('./tile.png',() => {
    window.RandrawState.RunningState.canRun = true;
    updateUi();
  });
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

function sp() {
  let state = window.RandrawState.RunningState;
  if (state.isRunning) {
    state.pauseFlag = true;
  } else {
    run();
  }
}

function dl() {
  let can = window.RandrawState.Output.MainCanvas;
  if (!can) {
    alert('No output is available at the moment!');
    return;
  }
  let url = can.toDataURL("image/png", 1.0);
  window.open().document.write(`<img src="${url}"/><br/><br/><a download="randraw_${new Date()}.png" href="${url}">Download PNG file</a>`);
}

function uploadInput() {
  let state = window.RandrawState;
  if (state.Counter.Iteration.Total > 0) {
    if (!confirm('Uploading new image will erase any existing progress. Continue?')) {
      return;
    }
  }
  let input = document.createElement('input');
  input.type='file';
  input.accept='image/png, image/jpeg';
  window.RandrawState.RunningState.canRun = false;
  setTimeout(function() {
    $(input).click();
    $(input).on('change', function () {
      try {
        if (!window.File || !window.FileReader || !window.FileList || !window.Blob) {
          alert('The File APIs are not fully supported in this browser.');
        } else if (!input.files) {
          alert("This browser doesn't seem to support the `files` property of file inputs.");
        } else if (!input.files[0]) {
          alert("Please select a file before clicking 'Load'");
        } else {
          let file = input.files[0];
          let fr = new FileReader();
          fr.onload = function (e) {
            if (typeof fr.result === 'string') {
              loadImage(fr.result, () => {
                updateUi();
                window.RandrawState.RunningState.canRun = true;
              })
            } else {
              alert(`Unexpected file loader result type: ${typeof fr.result}`)
            }
          };
          fr.readAsDataURL(file);
        }
      } finally {
        window.RandrawState.RunningState.canRun = true;
      }
    });
  },0);
}

$(function() {

    $.isMobile = window.innerWidth < 768;

    Handlebars.registerHelper('str', function (str) {
        return Array.isArray(str) ? str.join(' ') : str;
    });

    let canvasIn = document.getElementById('canvas-in');
    let canvasOut = document.getElementById('canvas-out');
    window['RandrawState'] = {
        Input: {
          MainImg: null,
          MainImgData: null,
          size: function () {
            return [this.MainImg.width, this.MainImg.height];
          },
          InitScore: -1,
        },
        Output: {
          MainCanvas: null,
          MainCanvasContext: null,
        },
        Canvas: {
          In: canvasIn,
          Out: canvasOut,
        },
        CanvasContext: {
          In: canvasIn.getContext('2d'),
          Out: canvasOut.getContext('2d'),
        },
        ScaledImgSize: null,
        Counter: {
          Iteration: {
            Successful: 0,
            Total: 0,
            totalUp: function () {
              this.Total = this.Total + 1;
            },
            successfulUp: function () {
              this.Successful = this.Successful + 1;
            },
            reset: function () {
              this.Successful = 0;
              this.Total = 0;
            }
          },
          Score: 1,
          Time: {
            TimerStart: -1,
            PauseStart: -1,
            dur: function () {
              return this.TimerStart > 0
                ? Utils.currentMillis() - this.TimerStart
                : 0;
            },
            reset: function () {
              this.TimerStart = -1;
              this.PauseStart = -1;
            },
          },
          reset: function () {
            this.Iteration.reset();
            this.Time.reset();
            this.Score = 1;
          },
        },
        RunningState: {
          isRunning: false,
          pauseFlag: false,
          canRun: false,
        },
        Options: {
          GreyscaleCompare: false,
          GreyscaleDrawing: false,
          DistanceRatioBias: true,
          OutputOpacity: 1,
        }
    };

    $(window).on('resize', () => {
      reDrawImages();
    });

    $('#sp').on('click', sp);
    $('#upload-input').on('click', uploadInput);
    $('#dl').on('click', dl);

    HashTabs.bind({
      tabsSelector: '.activate-tab.nav-link',
      linksSelector: '.activate-tab'
    });

    loadHandlebarsPartials({
      // 'name': 'assets/hbs/partial/partial.hbs',
    }, init);
});
