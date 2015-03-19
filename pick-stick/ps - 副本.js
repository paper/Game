var canvas = document.getElementById('myCanvas');


var window_width = $(window).width();
var window_height = $(window).height();
canvas.width = window_width;
canvas.height = window_height;

var ctx = canvas.getContext('2d');


var PS = PS || {};

var PI = Math.PI;
var random = Math.random;
var sin = Math.sin;
var cos = Math.cos;
var max = Math.max;
var min = Math.min;
var abs = Math.abs;
var sqrt = Math.sqrt;

var canvas_width = canvas.width;
var canvas_height = canvas.height;
var canvas_center = {
  x : canvas_width / 2,
  y : canvas_height / 2
};

var store = [];
var sticksNumber = 10;

/**
  棍子 对象
*/
function Stick(x, y, h, w, deg, n){
  this.x = $.isNumeric(x) ? x : _.random(50, canvas_width - 50);
  this.y = $.isNumeric(y) ? y : _.random(50, canvas_height - 50);
  this.w = $.isNumeric(w) ? canvas_width;
  this.h = $.isNumeric(h) ? 40;
  this.deg = $.isNumeric(deg) ? _.random(0, 179);
  this.n = $.isNumeric(n) ? n : _.random(1, 8);
}

Stick.proto

// 清空画布
function clearCanvas(){
  ctx.clearRect(0, 0, canvas_width, canvas_height);
}

/**
  渐变色
  @n [1, 8] 区间
*/
function getLinearGradientStyle(x1, y1, x2, y2, n){
  n = $.isNumeric(n) ? n : _.random(1,8);
  
  var g = ctx.createLinearGradient(x1, y1, x2, y2);
  
  switch(n){
    case 1:
      g.addColorStop(0, '#5b7f05'); 
      g.addColorStop(0.5, '#addd3a');
      g.addColorStop(1, '#5b7f05');
      break;
    case 2:
      g.addColorStop(0, '#ffc100'); 
      g.addColorStop(0.5, '#c0eb59');
      g.addColorStop(1, '#ffc100');
      break;
    case 3:
      g.addColorStop(0, '#f928ff'); 
      g.addColorStop(0.5, '#e584fa');
      g.addColorStop(1, '#f928ff');
      break;
    case 4:
      g.addColorStop(0, '#693812'); 
      g.addColorStop(0.5, '#b46c2f');
      g.addColorStop(1, '#693812');
      break;
    case 5:
      g.addColorStop(0, '#235959'); 
      g.addColorStop(0.5, '#48b0b0');
      g.addColorStop(1, '#235959');
      break;
    case 6:
      g.addColorStop(0, '#C48915'); 
      g.addColorStop(0.5, '#F1BF5D');
      g.addColorStop(1, '#C48915');
      break;
    case 7:
      g.addColorStop(0, '#2414BF'); 
      g.addColorStop(0.5, '#8272FE');
      g.addColorStop(1, '#2414BF');
      break;
    case 8:
      g.addColorStop(0, '#9C184A'); 
      g.addColorStop(0.5, '#F779AF');
      g.addColorStop(1, '#9C184A');
      break;  
  }
  
  return g;
}


function setStickAttribute(){
  
}

/**
  画一根棍子
  
  @deg 度
*/
function drawOneStick(x, y, w, h, deg, n ){

  deg = $.isNumeric(deg) ? deg : _.random(0, 180);
  var rad = deg * PI / 180;
  
  var x = $.isNumeric(x) ? x : _.random(-212, 8); // 50<left+(width/2)<270
  var y = $.isNumeric(y) ? y : _.random(45, 361);  // 50<top+(height/2)<366
  var w = $.isNumeric(w) ? w : stick.w;
  var h = $.isNumeric(h) ? h : stick.h;
  
  var c_x = x + w/2;
  var c_y = y + h/2;
  
  ctx.save();
  
  ctx.translate(c_x, c_y);
  ctx.rotate(rad);
  ctx.translate(-1 * c_x, -1 * c_y);
  
  ctx.shadowOffsetX = 0;
  ctx.shadowOffsetY = 0;
  ctx.shadowColor = 'rgba(0,0,0,0.8)';
  ctx.shadowBlur = 4;
  
  ctx.fillStyle = getLinearGradientStyle(x, y, x, y+h, n);
  ctx.fillRect(x, y, w, h ); 
  
  ctx.restore();
}

// 画用户点击后，生成的小圆，用于提示用户是否点击到了目标棍子
function drawTabCircle(x, y){
  ctx.save();
  
  ctx.shadowOffsetX = 0;
  ctx.shadowOffsetY = 0;
  ctx.shadowColor = 'rgba(0,0,0,1)';
  ctx.shadowBlur = 4;
  
  ctx.beginPath();
  ctx.arc(x, y, 15, 0, Math.PI * 2, true);
  ctx.closePath();
  ctx.fillStyle = 'rgba(0,0,0,0.3)';
  ctx.fill();
  
  ctx.restore();
}

/**
  左边，宽高，旋转角度，颜色方案
  [ x, y, w, h, deg, n ]
  
  @max 生成多少组数据
*/
function createData(num){
  var store = [];
  
  _.times(num, function(){
  
    x = _.random(50, canvas_width - 50);
    y = _.random(60, canvas_height - 50);
    w = stick.w;
    h = stick.h;
    deg = _.random(0, 179);
    n = _.random(1, 8);
    
    store.push([x, y, w, h, deg, n]);
  });
  
  return store;
}

// 画多个棍子
function drawSticks(){
  _.each(store, function(v, i){
    drawOneStick.apply(null, v);
  });
}



// 游戏初始化
function gameInit(){
  store = createData(sticksNumber);
  
  drawSticks();
  
  $("#myCanvas").click(function(e){
    
    var event_x = e.pageX;
    var event_y = e.pageY;
    
    var myCanvas_x = $("#myCanvas").offset().left;
    var myCanvas_y = 0;

    // 以免用户点的太快，最小间隔是100ms
    _.throttle(function(){
      clearCanvas();
      
      store.pop();
      drawSticks();
      drawTabCircle(event_x - myCanvas_x, event_y);
    }, 100)();
  });
  
}

gameInit();











