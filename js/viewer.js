var $viewer   = $("#viewer");
var $canvas   = $viewer.find("canvas");
var canvas    = $canvas[0];
var context   = canvas.getContext("2d");

var originalImageData = null;

function cloneData(imageData) {
  var data = [];
  for (var i = 0; i < imageData.length; i++) {
    data.push(imageData[i]);
  }
  return data;
}

var adaptImageToDisplay = function(imageWidth, imageHeight) {
  var resolutionWidth   = imageWidth;
  var resolutionHeight  = resolutionWidth * imageHeight / imageWidth;

  var displayWidth  = imageWidth > 600 ? 600 : imageWidth;
  var displayHeight = displayWidth * imageHeight / imageWidth;

  canvas.width  = resolutionWidth;
  canvas.height = resolutionHeight;

  canvas.style.width  = displayWidth + "px";
  canvas.style.height = displayHeight + "px";
};

var drawImage = function(image) {
  var adaptor = adaptImageToDisplay(image.width, image.height);
  context.drawImage(image, 0, 0, canvas.width, canvas.height);
  originalImageData = context.getImageData(0, 0, canvas.width, canvas.height);
};

var showImage = function(file, callback) {
  var image = new Image();
  image.style.display = "none";
  image.onload = function() {
    drawImage(this);
    callback && callback();
  };
  image.src = file;
};

var isImageDrew = function() {
  return originalImageData != null;
};

var grayScale = function(level) {
  var currentImageData = context.getImageData(0, 0, canvas.width, canvas.height);
  var data = currentImageData.data;
  for (var i = 0; i < data.length; i+=4) {
    var gray = Math.floor((data[i] + data[i+1] + data[i+2]) / 3);
    var temp = Math.floor(gray / Math.floor(256 / level)) * Math.floor(255 / (level - 1));
    data[i] = data[i + 1] = data[i + 2] = temp;
  }

  drawImageDataToCanvas(currentImageData);
};

var drawImageDataToCanvas = function(imageData) {
  context.clearRect(0, 0, canvas.width, canvas.height);
  adaptImageToDisplay(imageData.width, imageData.height);
  context.putImageData(imageData, 0, 0);
};

var recover = function() {
  drawImageDataToCanvas(originalImageData);
};

var scale = function(width, height) {
  var newImageData = context.createImageData(width, height);
  var currentImageData = context.getImageData(0, 0, canvas.width, canvas.height);
  var data = currentImageData.data;
  for (var row = 0; row < height; row++) {
    for (var col = 0; col < width; col++) {
      var position = row * width * 4 + col * 4;
      var r = Math.floor(row * currentImageData.width / width);
      var c = Math.floor(col * currentImageData.height / height);
      var p = r * currentImageData.width * 4 + c * 4;
      newImageData.data[position + 0] = data[p + 0];
      newImageData.data[position + 1] = data[p + 1];
      newImageData.data[position + 2] = data[p + 2];
      newImageData.data[position + 3] = data[p + 3];
    }
  }
  drawImageDataToCanvas(newImageData);
};

var saveImage = function(filename, callback) {
  var dataUrl = canvas.toDataURL();
  dataUrl = dataUrl.replace(/^data:image\/png;base64,/, "");
  require("fs").writeFile(filename, dataUrl, "base64", callback);
};

var getImageInfo = function() {
  var widthScale = 0;
  var displayWidth = parseInt(canvas.style.width.replace("px"));
  var displayHeight = parseInt(canvas.style.height.replace("px"));
  if (displayWidth) {
    widthScale = canvas.width / displayWidth;
  }
  return {
    width: canvas.width,
    height: canvas.height,
    displayWidth: displayWidth,
    displayHeight: displayHeight,
    widthScale: widthScale
  };
};

exports.showImage = showImage;
exports.isImageDrew = isImageDrew;
exports.grayScale = grayScale;
exports.recover = recover;
exports.scale = scale;
exports.getImageInfo = getImageInfo;
exports.saveImage = saveImage;
