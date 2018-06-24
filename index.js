var canvas;
var context;
var canvasWidth =300;
var canvasHeight = 150;
var model = tf.Model;

var clickX = new Array();
var clickY = new Array();
var clickDrag = new Array();
var paint;

var canvasDiv = document.getElementById('canvasDiv');
var detectButton = document.getElementById('submitButton'); 
var clearButton = document.getElementById('clearButton')

canvas = document.createElement('canvas');
canvas.setAttribute('width', canvasWidth);
canvas.setAttribute('height', canvasHeight);
canvas.setAttribute('id', 'canvas');
canvasDiv.appendChild(canvas);
if(typeof G_vmlCanvasManager != 'undefined') {
	canvas = G_vmlCanvasManager.initElement(canvas);
}
context = canvas.getContext("2d");

async function trainModel(){
  model = await tf.loadModel('./assets/model.json')
  console.log('Model Loaded');
}

window.onload = trainModel;


$('#canvas').mousedown(function(e){
    var mouseX = e.pageX - this.offsetLeft;
    var mouseY = e.pageY - this.offsetTop;
          
    paint = true;
    addClick(mouseX, mouseY, false);
    redraw();
  });

  $('#canvas').mousemove(function(e){
    if(paint){
      addClick(e.pageX - this.offsetLeft, e.pageY - this.offsetTop, true);
      redraw();
    }
  });

  $('#canvas').mouseup(function(e){
    paint = false;
  });

  $('#canvas').mouseleave(function(e){
    paint = false;
  });


function addClick(x, y, dragging)
{
  clickX.push(x);
  clickY.push(y);
  clickDrag.push(dragging);
}

function redraw(){
    
    
    context.strokeStyle = "#111111";
    context.lineJoin = "round";
    context.lineWidth = 10;
            
    
    context.clearRect(0, 0, canvasWidth, canvasHeight);

    for(var i=0; i < clickX.length; i++) {		
      context.beginPath();
      if(clickDrag[i] && i){
        context.moveTo(clickX[i-1], clickY[i-1]);
       }else{
         context.moveTo(clickX[i]-1, clickY[i]);
       }
       context.lineTo(clickX[i], clickY[i]);
       context.closePath();
       context.stroke();
    }
  }

clearButton.addEventListener("click", function(){
    clickX = new Array();
    clickY = new Array();
    clickDrag = new Array();
    context.clearRect(0, 0, canvasWidth, canvasHeight);
})

detectButton.addEventListener("click", saveDrawing)


async function saveDrawing() {
    context.drawImage(canvas, 0, 0, 28, 28);
    var data = context.getImageData(0, 0, 28, 28);
    predict(data);
}

async function predict(imageData){

  const pred = await tf.tidy(() => {

 
    let img = tf.fromPixels(imageData, 1);
    img = img.reshape([1 , 28, 28, 1]);
    img = tf.cast(img, 'float32');
    const output = model.predict(img);
    predictions = Array.from(output.dataSync());
  
    document.getElementById("number").innerHTML = indexOfMax(predictions);
    
  });
}

function indexOfMax(arr) {
    if (arr.length === 0) {
        return -1;
    }

    var max = arr[0];
    var maxIndex = 0;

    for (var i = 1; i < arr.length; i++) {
        if (arr[i] > max) {
            maxIndex = i;
            max = arr[i];
        }
    }

    return maxIndex;
}


