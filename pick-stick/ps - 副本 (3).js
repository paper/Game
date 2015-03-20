FIP.stopPageDrag();


var $window = $(window);
var canvas = document.getElementById('myCanvas');
var window_width = $window.width();
var window_height = $window.height();

canvas.width = window_width;
canvas.height = window_height;

var ctx = canvas.getContext('2d');

var PI = Math.PI;
var random = Math.random;
var sin = Math.sin;
var cos = Math.cos;
var tan = Math.tan;

var max = Math.max;
var min = Math.min;
var abs = Math.abs;
var sqrt = Math.sqrt;
var floor = Math.floor;
var ceil = Math.ceil;
var round = Math.round;

// 参数需要整理一下

var canvas_center = {
  x : canvas.width / 2,
  y : canvas.height / 2
};

// 整个棍子的存储容器
var stick_store = [];

// 哪些棍子在最上面的存储容器
var stick_up_store = [];

// 棍子的数量
var sticks_number = 30;

// 棍子唯一id
var _cid = 0;

// 每根棍子的宽高都是一样的
var stick_width = canvas.height * 2;
var stick_height = 10;

// 模糊边界，因为眼睛不见得看得那么清楚
var stick_step = 5;

// 点击生成小圆的半径
var tab_circle_r = 15;

//游戏是否可以玩的参数
//为true，说明可以点击
var canPlayKey = true;

//cr的半径
var R = tab_circle_r;

// R+height/2  最大允许的距离，超过这个距离就说明没有碰撞 
var MAXRANGE = R + stick_height/2;

var Game = {
  reset : function(){
    
    stick_store = [];
    stick_up_store = [];
    _cid = 0;
    
  }
};

// 清空画布
function clearCanvas(){
  ctx.clearRect(0, 0, canvas.width, canvas.height);
}

/**
  得到渐变色
  @n [1, 8] 区间
*/
function getLinearGradientStyle(x1, y1, x2, y2, n){
  n = (n>=1 && n<=8) ? n : _.random(1,8);
  
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

// 相等的精度判断
function isEqual(a, b){
  return abs(a - b) <= 0.001;
}

// 角度 转 弧度
function degToRad(deg){
  return deg * PI / 180;
}

// 得到浮点，可以设置精度
function getFloat(num){
  return +parseFloat(num, 10).toFixed(3);
}

/**
  判断一个点是否在容器里面
  在里面就返回true，不在就返回false
*/
function isInWrap(x,y,w,h){
  w = w - stick_step || window_width - stick_step,
  h = h - stick_step || window_height - stick_step;
      
  return !(x<=0 || x>=w || y<=0 || y>=h);
}


/**
  给出两条线段它们两边的坐标，判断它们是否相交
  相交就返回相交的那个点的坐标，不相交就返回false
*/
function isLineCross(Ax1,Ay1,Ax2,Ay2,Bx1,By1,Bx2,By2){
  var AK = getFloat( (Ay2-Ay1)/(Ax2-Ax1) ),
      BK = getFloat( (By2-By1)/(Bx2-Bx1) );
  
  //平行
  if( isEqual(AK, BK) ) return false;
  
  //相交的点坐标
  var x = getFloat( (By1-Bx1*BK+Ax1*AK-Ay1)/(AK-BK) ),
      y = getFloat( By1+BK*(x-Bx1) ),
  
      //判断x，y是不是在一条线段上
      //假设在A线段上
      AxMax = max(Ax1, Ax2),
      AxMin = min(Ax1, Ax2);
  
  var step = stick_step;
  
  //相交点不在线段上，或者它不在容器里面
  if(x > AxMax-step || x < AxMin+step || !isInWrap(x,y)) return false;
  
  return {
    x:x,
    y:y
  };

}


//比较两个stick是否相交，并且相交点要在容器里面
//相交返回true，否则返回false
function compareStick(A, B){
 
  return !!isLineCross(A.line.x1, A.line.y1, A.line.x2, A.line.y2, 
                        B.line.x1, B.line.y1, B.line.x2, B.line.y2);
  
}

// 知道一线中一个点的左边，和相对水平线来说，顺时针的角度
// 得到包裹它已知容器矩形相交2点的坐标
// 而且得知，直线不可能是水平（排除了水平状态）
function getLineBoxAcrossCoordinate(x, y, rad, box_w, box_h){
  var ret = {};
  
  var temp1 = {};
  var temp2 = [];
  
  if( rad == PI/2 ){
    ret.x1 = x;
    ret.y1 = 0;
    
    ret.x2 = x;
    ret.y2 = box_h;
    
    return ret;
  }
  
  // 先变换一下坐标系
  x = x;
  y = box_h - y;
  
  //直线的斜率 [切线与x轴正方向的夹角tanα]
  var k = tan(PI - rad);
  
  //根据直线的斜截式方程：y=kx+b
  var b = y - k * x;
  
  /* 
    直线方程 与 矩形4边 求交点，如果在矩形范围内，就加入ret
    A: x = 0
    B: y = box_h
    C: x = box_w
    D: y = 0
    矩形4边直线方程
  */

  // 与4条边延长直线都相交后，会等到4个交点
  temp1.Ax = 0;
  temp1.Ay = b;
  
  temp1.Bx = (box_h - b) / k;
  temp1.By = box_h;
  
  temp1.Cx = box_w;
  temp1.Cy = k * box_w + b;
  
  temp1.Dx = -b / k;
  temp1.Dy = 0;
    
  // 判断相交的点是否都符合条件（在矩形上面）
  // 可以肯定的是，必有2个焦点在矩形上面，2个不在
  if( temp1.Ay >= 0 && temp1.Ay <= box_h ){
    temp2.push([temp1.Ax, temp1.Ay]);
  }
  
  if( temp1.Bx > 0 && temp1.Bx < box_w ){
    temp2.push([temp1.Bx, temp1.By]);
  }
  
  if( temp1.Cy >=0 && temp1.Cy <= box_h ){
    temp2.push([temp1.Cx, temp1.Cy]);
  }
  
  if( temp1.Dx > 0 && temp1.Dx < box_w ){
    temp2.push([temp1.Dx, temp1.Dy]);
  }
    
  // 在把坐标系换回来
  ret.x1 = temp2[0][0];
  ret.y1 = box_h - temp2[0][1];
  
  ret.x2 = temp2[1][0];
  ret.y2 = box_h - temp2[1][1];
  
  return ret;
}


/**
  棍子 对象
*/
function Stick(x, y, h, w, deg, n){
  
  var d = Stick.getDefaultData();
  
  this.x = $.isNumeric(x) ? x : d.x;
  this.y = $.isNumeric(y) ? y : d.y;
  this.w = $.isNumeric(w) ? w : d.w;
  this.h = $.isNumeric(h) ? h : d.h;
  this.deg = $.isNumeric(deg) ? deg : d.deg;
  this.rad = degToRad(this.deg);
  this.n = $.isNumeric(n) ? n : d.n;
  
  this.center_x = this.x + this.w/2;
  this.center_y = this.y + this.h/2;
  
  //计算棍子和容器相交后，两个点的坐标
  this.line = getLineBoxAcrossCoordinate(this.center_x, this.center_y, this.rad, canvas.width, canvas.height);
  
  this.id = _cid++;
  
  //存储相交的点
  this.compare = [];
}

Stick.getDefaultData = function(){
  /*
    棍子的中心要在一个区间内( width和height是指棍子的宽高 )
    
    左边的中心 left+(width/2) 的区间是 [100, canvas.width-100];
    =》 left的范围是 100 - width/2 < left < width/2 - 100;
    
    上边的中心 top+(height/2) 的区间是 [100, canvas.height-100];
    =》 left的范围是 100 - height/2 < top < height/2 - 100;
  */
  
  //中心区域的边界
  var w_boundary = canvas.width * 0.2;
  var h_boundary = canvas.height * 0.2;
  
  return {
    x : _.random(w_boundary - stick_width/2, canvas.width - w_boundary - stick_width/2),
    y : _.random(h_boundary - stick_height/2, canvas.height - h_boundary - stick_height/2),
    w : stick_width,
    h : stick_height,
    deg : _.random(1, 179), //排除水平状态。减少判断，而且少一个水平不影响全局
    n : _.random(1, 8)
  };
  
};

Stick.prototype.draw = function(){
  ctx.save();
  
  ctx.translate(this.center_x, this.center_y);
  ctx.rotate(this.rad);
  ctx.translate(-this.center_x, -this.center_y);
  
  ctx.shadowOffsetX = 0;
  ctx.shadowOffsetY = 0;
  ctx.shadowColor = '#000';
  ctx.shadowBlur = 3;
  
  ctx.fillStyle = getLinearGradientStyle(this.x, this.y, this.x, this.y+this.h, this.n);
  ctx.fillRect(this.x, this.y, this.w, this.h ); 
  
  ctx.restore();
  
  return this;
};

Stick.prototype.reset = function(){
  this.compare = [];
  return this;
};

/**
  小圆圈（鼠标或手点击时生成）对象
  
  @x, @y 分别是小圆圈中心的 x坐标 和 y坐标
*/
function TabCircle(x, y){
  this.x = x;
  this.y = y;
  this.r = tab_circle_r;
}

// 画用户点击后，生成的小圆，用于提示用户是否点击到了目标棍子
TabCircle.prototype.draw = function(){
  ctx.save();
  
  ctx.shadowOffsetX = 0;
  ctx.shadowOffsetY = 0;
  ctx.shadowColor = 'rgba(0,0,0,1)';
  ctx.shadowBlur = 4;
  
  ctx.beginPath();
  ctx.arc(this.x, this.y, this.r, 0, Math.PI * 2, true);
  ctx.closePath();
  ctx.fillStyle = 'rgba(0,0,0,0.3)';
  ctx.fill();
  
  ctx.restore();
};

/**
  左边，宽高，旋转角度，颜色方案
  [ x, y, w, h, deg, n ]
  
  @max 生成多少组数据
*/
function createData(num){
  var r = [];
  
  _.times(num, function(){
    r.push( new Stick() );
  });
  
  return r;
}

// 初始化画上 store 存储的全部棍子
function drawSticksInit( callback ){
  var r = [];
  
  _.each(stick_store, function(stick, i){
    stick.draw();
    
    r.push(stick);
    
    if (i !== 0) {
      for (var j = 0, len = r.length - 1; j < len; j++) {
        //如果相交
        if ( compareStick(r[j], stick) ) {
          r[j].compare.push( stick.id );
        }
      }
    }
  });
  
  callback && callback();
}


/**
  画stick_store里面的棍子
*/
function drawSticks(){
  _.each(stick_store, function(stick){
    stick.draw();
  });
}


/**
  canvas 每次画图
*/
function canvaDraw(){
  clearCanvas();
  
  drawSticks();
}


/**
  更新 每个棍子的 compare 属性 即可
  并返回最上面有哪些棍子的数组
  
  @removedStick 被移除的那个棍子(非必须)
*/
function upDateStickCompare(removedStick){
  var aim_id = -1;
  var ret = [];
  
  if( removedStick ){
    aim_id = removedStick.id;
  }
  
  //移除其他棍子里面的含有 aim_id 的值
  _.each(stick_store, function(stick){
    var index = stick.compare.indexOf(aim_id);
    
    if( index > -1 ){
      stick.compare.splice(index, 1);
    }
    
    if( stick.compare.length === 0 ){
      ret.push(stick);
    }
  });
  
  return ret;
}

/**
  移除这个棍子
*/
function removeStick(stick){
  
  var id = stick.id;
  
  _.find(stick_store, function(stick, i){
    
    if( stick.id === id ){
      stick_store.splice(i, 1);
      
      return true;
    }
    
  });
  
  stick_up_store = upDateStickCompare(stick);
}

/**
  判断tabCircle和stick是否碰撞的细节
  如果碰到返回true，否则返回false
  
  @tabClicle 实例
  @stick 实例
*/
function checkTabCircleDetail(tabClicle, stick){
  //cr的中心点的坐标
  var X = tabClicle.x, Y = tabClicle.y;

  var line = stick.line,
      x1 = line.x1, y1 = line.y1,
      x2 = line.x2, y2 = line.y2;
      
  
  var x, y;   //圆点到直线的垂直线的相交的那个点。
  var L;      //圆点到直线的垂直线的距离
  
  //首先把直线转化成Ax+By+C=0;求出A,B，C的值，这样方便利用公式
  var A = y2 - y1,
      B = x1 - x2,
      C = y1*x2 - x1*y2;
  
  L = getFloat( abs(A*X+B*Y+C)/sqrt(A*A+B*B) );
  x = getFloat( (B/A*X-Y-C/B)/(B/A+A/B) );
  
  console.log(L);
  
  if (L < MAXRANGE) {
    //var xMax = max(x1, x2), xMin = min(x1, x2);
    
    //if (x > xMax || x < xMin) return false;
    
    return true;
  }
  
  return false; 
}


/**
  判断tabCircle和stick是否碰撞
*/
function checkTabCircle(tabClicle){
  
  console.log(tabClicle);
  
  _.find(stick_up_store, function(stick){
    
    console.log(stick_up_store);
    
    
    // 点中了！
    if( checkTabCircleDetail(tabClicle, stick) ){
      
      removeStick(stick);
      
      return true;
    }
    
  });
}


function bindUserClick(){
  document.getElementById("myCanvas").addEventListener("touchstart", function(e){
    
    if( !canPlayKey ) return;
    
    var event_x = e.targetTouches[0].pageX;
    var event_y = e.targetTouches[0].pageY;
    
    var myCanvas_x = $("#myCanvas").offset().left;
    var myCanvas_y = 0;
    
    var tab_circle_x = event_x - myCanvas_x;
    var tab_circle_y = event_y - myCanvas_y;

    // 以免用户点的太快，最小间隔是100ms
    clearCanvas();
    
    var tab_circle = new TabCircle(tab_circle_x, tab_circle_y);
    
    //找到点中的那个最上面的棍子，并移除它
    checkTabCircle(tab_circle);

    drawSticks();
    
    tab_circle.draw();
    
  }, false);
  
  // $("#myCanvas").touchdown(function(e){
    
    
  // });
}


//游戏初始化
function gameInit(){
  stick_store = createData(sticks_number);
  
  console.log( stick_store );
  
  drawSticksInit(function(){
    stick_up_store = upDateStickCompare();
    
    bindUserClick();
  });

}

gameInit();











