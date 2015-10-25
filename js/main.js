// transfer window's variable to node's global context
global.$ = $;
global.Image = Image;
var viewer = require("./js/viewer.js");

var $fileDialog   = $("#open-file-dialog");
var $saveAsDialog = $("#save-as-dialog");
var $info         = $("#imageInfo");

var updateShowingImageInfo = function() {
  var info = viewer.getImageInfo();
  $info.html(
    "图片分辨率: " + info.width + " x " + info.height +
    "，显示尺寸：" + info.displayWidth + " x " + info.displayHeight +
    "，图片宽度与显示的比例：" + info.widthScale
  );
};

// 打开文件
$("li.open-file").unbind("click").bind("click", function() {
  $fileDialog.unbind("change").bind("change", function(e) {
    var filePath = $(this).val();
    viewer.showImage("file://" + filePath, function() {
      updateShowingImageInfo();
    });
    $(this).val(""); // enable input element to select same file
  });
  $fileDialog.trigger("click");
});

// 灰度级别
$("li.grayscale").unbind("click").bind("click", function() {
  if (!viewer.isImageDrew()) {
    return alert("请先打开图片");
  }
  var level = prompt("请输入灰度级别(1-256)：", 256);
  if (level == null) return; // 按了取消
  level = parseInt(level);

  if (isNaN(level) || level > 256 || level < 1) {
    alert("无效的灰度值!");
  } else {
    viewer.grayScale(level);
  }
});

// 恢复原始图片
$("li.recover-image").unbind("click").bind("click", function() {
  if (viewer.isImageDrew()) {
    viewer.recover();
    updateShowingImageInfo();
  }
});

// 缩放
$("li.scale").unbind("click").bind("click", function() {
  if (!viewer.isImageDrew()) {
    return alert("请先打开图片");
  }
  var size = prompt("请输入分辨率（width height）：", "180 150");
  if (size == null) return; // 按了取消 

  var arr  = size.split(/\s+/g);
  var width  = parseInt(arr[0]);
  var height = parseInt(arr[1]);

  if (!width || !height || width <= 0 || height <= 0) {
    alert("无效的尺寸");
  } else {
    viewer.scale(width, height);
    updateShowingImageInfo();
  }
});

// 保存图片
$("li.save").unbind("click").bind("click", function() {
  if (!viewer.isImageDrew()) {
    return alert("请先打开图片");
  }
  $saveAsDialog.unbind("change").bind("change", function() {
    var filename = $(this).val();
    if (!filename) return;
    viewer.saveImage(filename, function(error) {
      if (error) {
        alert("保存失败，", error);
      } else {
        alert("保存成功");
      }
    });
  });
  $saveAsDialog.trigger("click");
});

