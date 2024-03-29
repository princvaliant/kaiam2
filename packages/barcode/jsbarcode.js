JsBarcode = function(content, options, validFunction) {

  var merge = function(m1, m2) {
    var newMerge = {};
    for (var k in m1) {
      newMerge[k] = m1[k];
    }
    for (var k in m2) {
      newMerge[k] = m2[k];
    }
    return newMerge;
  };

  //This tries to call the valid function only if it's specified. Otherwise nothing happens
  var validFunctionIfExist = function(valid) {
    if (validFunction) {
      validFunction(valid);
    }
  };

  //Merge the user options with the default
  options = merge(JsBarcode.defaults, options);

  // check if DOM element is a canvas, otherwise it will be probably an image so create a canvas
  if (!(canvas instanceof HTMLCanvasElement)) {
    canvas = document.createElement('canvas');
  }

  var encoder = new CODE128(content);

  //Abort if the barcode format does not support the content
  if (!encoder.valid()) {
    validFunctionIfExist(false);
    return this;
  }

  //Encode the content
  var binary = encoder.encoded();

  var _drawBarcodeText = function(text) {
    var x, y;

    y = options.height;

    ctx.font = options.fontSize + "px " + options.font;
    ctx.textBaseline = "bottom";
    ctx.textBaseline = 'top';

    if (options.textAlign == "left") {
      x = options.quite;
      ctx.textAlign = 'left';
    } else if (options.textAlign == "right") {
      x = canvas.width - options.quite;
      ctx.textAlign = 'right';
    } else { //All other center
      x = canvas.width / 2;
      ctx.textAlign = 'center';
    }

    ctx.fillText(text, x, y);
  }

  //Get the canvas context
  var ctx = canvas.getContext("2d");

  //Set the width and height of the barcode
  canvas.width = binary.length * options.width + 2 * options.quite;
  //Set extra height if the value is displayed under the barcode. Multiplication with 1.3 t0 ensure that some
  //characters are not cut in half
  canvas.height = options.height + (options.displayValue ? options.fontSize * 1.3 : 0);

  //Paint the canvas
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  if (options.backgroundColor) {
    ctx.fillStyle = options.backgroundColor;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  }

  //Creates the barcode out of the encoded binary
  ctx.fillStyle = options.lineColor;
  for (var i = 0; i < binary.length; i++) {
    var x = i * options.width + options.quite;
    if (binary[i] == "1") {
      ctx.fillRect(x, 0, options.width, options.height);
    }
  }

  if (options.displayValue) {
    _drawBarcodeText(content);
  }

  //Grab the dataUri from the canvas
  uri = canvas.toDataURL('image/png');

  validFunctionIfExist(true);

  return uri;
};

JsBarcode.defaults = {
  width: 1,
  height: 60,
  quite: 10,
  format: "CODE128",
  displayValue: true,
  font: "monospace",
  textAlign: "center",
  fontSize: 14,
  backgroundColor: "",
  lineColor: "#000"
};
