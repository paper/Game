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


var canvas_center = {
  x : canvas.width / 2,
  y : canvas.height / 2
};

var stick_store = [];
var sticksNumber = 10;

// 棍子唯一id
var _cid = 0;

// 每根棍子的宽高都是一样的
var stick_width = canvas.height * 2;
var stick_height = 10;

// 模糊边界，因为眼睛不见得看得那么清楚
var stick_step = 5;


//游戏是否可以玩的参数
//为true，说明可以点击
var canPlayKey = false;




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
};

/**
  判断一个点是否在容器里面
  在里面就返回true，不在就返回false
*/
function isInWrap(x,y,w,h){
  var step = stick_step,
      w = w - step || window_width - step,
      h = h - step || window_height - step;
      
  return !(x<=0 || x>=w || y<=0 || y>=h);
};


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
  }

};


//比较两个stick是否相交，并且相交点要在容器里面
//相交返回true，否则返回false
function compareStick(A, B){
  var Arad = A.rad,
    Brad= B.rad,
    Awidth = stick_width,
    Bwidth = stick_width,
    Aheight = stick_height,
    Bheight = stick_height,
    Aleft = parseInt(A.style.left),
    Bleft = parseInt(B.style.left),
    Atop = parseInt(A.style.top),
    Btop = parseInt(B.style.top);
  
  //A左右两边中间的坐标
  var AwidthHalf=Awidth/2,
    AheightHalf=Aheight/2,
    
    //左边
    ALx=Aleft,
    ALy=Atop+AheightHalf, 		
    
    //右边
    ARx=Aleft+Awidth,
    ARy=ALy; 				
  
  //旋转之后，A左右两边中间的坐标
  var cosArad=cos(Arad),sinArad=sin(Arad),
    ALxx=parseInt( ALx+AwidthHalf-AwidthHalf*cosArad,10 ),
    ALyy=parseInt( ALy-AwidthHalf*sinArad,10 ),
    
    ARxx=parseInt( ARx-AwidthHalf+AwidthHalf*cosArad,10 ),
    ARyy=parseInt( ARy+AwidthHalf*sinArad,10 );
  
  if(A.getAttribute('data-coord')===null){
    A.setAttribute('data-coord',ALxx+','+ALyy+','+ARxx+','+ARyy);
  }
  
  //旋转之后，A四个角的坐标
  var ALTx=parseInt( ALxx+AheightHalf*sinArad,10 ),
    ALTy=parseInt( ALyy-AheightHalf*cosArad,10 ),
    
    ALBx=parseInt( ALxx-AheightHalf*sinArad,10 ),
    ALBy=parseInt( ALyy+AheightHalf*cosArad,10 ),
    
    ARTx=parseInt( ARxx+AheightHalf*sinArad,10 ),
    ARTy=parseInt( ARyy-AheightHalf*cosArad,10 ),
    
    ARBx=parseInt( ARxx-AheightHalf*sinArad,10 ),
    ARBy=parseInt( ARyy+AheightHalf*cosArad,10 );
    
  
  //B左右两边中间的坐标
  var BwidthHalf=Bwidth/2,
    BheightHalf=Bheight/2,
    
    //左边
    BLx=Bleft,
    BLy=Btop+BheightHalf, 		
    
    //右边
    BRx=Bleft+Bwidth,
    BRy=BLy;
  
  //旋转之后，B左右两边中间的坐标
  var cosBrad=cos(Brad),sinBrad=sin(Brad),
    BLxx=parseInt( BLx+BwidthHalf-BwidthHalf*cosBrad,10 ),
    BLyy=parseInt( BLy-BwidthHalf*sinBrad,10 ),
    
    BRxx=parseInt( BRx-BwidthHalf+BwidthHalf*cosBrad,10 ),
    BRyy=parseInt( BRy+BwidthHalf*sinBrad,10 );
    
  if (B.getAttribute('data-coord') === null) {
    B.setAttribute('data-coord', BLxx + ',' + BLyy + ',' + BRxx + ',' + BRyy);
  }
  
  //旋转之后，B四个角的坐标
  var BLTx=parseInt( BLxx+BheightHalf*sinBrad,10 ),
      BLTy=parseInt( BLyy-BheightHalf*cosBrad,10 ),
      
      BLBx=parseInt( BLxx-BheightHalf*sinBrad,10 ),
      BLBy=parseInt( BLyy+BheightHalf*cosBrad,10 ),
      
      BRTx=parseInt( BRxx+BheightHalf*sinBrad,10 ),
      BRTy=parseInt( BRyy-BheightHalf*cosBrad,10 ),
      
      BRBx=parseInt( BRxx-BheightHalf*sinBrad,10 ),
      BRBy=parseInt( BRyy+BheightHalf*cosBrad,10 );
    
  return !!( isLineCross(ALTx,ALTy,ARTx,ARTy,BLBx,BLBy,BRBx,BRBy) || 
              isLineCross(ALBx,ALBy,ARBx,ARBy,BLTx,BLTy,BRTx,BRTy) );
  
};

// 知道一线中一个点的左边，和相对水平线来说，顺时针的角度
// 得到包裹它已知容器矩形相交2点的坐标
function getLineBoxAcrossCoordinate(x,y,rad,w,h){
  var ret = {}
  
  if( rad == PI/2 ){
    ret.x1 = x;
    ret.y1 = 0;
    
    ret.x2 = x;
    ret.y2 = h;
    
    return ret;
  }
  
  // 先变换一下坐标系
  x = x;
  y = h - y;
  
  //直线的斜率 [切线与x轴正方向的夹角tanα]
  var k = tan(rad);
  
  //根据直线的斜截式方程：y=kx+b
  var b = y - kx;
  
  /* 直线方程 与 矩形4边 求交点，如果在矩形范围内，就加入ret
    
    A: x = 0
    B: y = h
    C: x = w
    D: y = 0
      
    矩形4边直线方程
  */
  
  // 判断与A相交
  
  
  
  // if( rad == PI/2 ){
    // ret.x1 = x;
    // ret.y1 = 0;
    
    // ret.x2 = x;
    // ret.y2 = h;
  // }else{
    
    // if( y > x * tan(rad) ){
      // ret.x1 = 0;
      // ret.y1 = y - x * tan(rad);
      
      // ret.x2 = w;
      // ret.y2 = y + (w-x) * tan(rad);
    // }else if(  )
    
  // }
  
  
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
  
  
  this.id = _cid++;
  
  //存储相交的点
  this.compare = {};
};

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
    deg : _.random(1, 179),
    n : _.random(1, 8)
  }
};

Stick.prototype.draw = function(){
  ctx.save();
  
  ctx.translate(this.center_x, this.center_y);
  ctx.rotate(this.rad);
  ctx.translate(-this.center_x, -this.center_y);
  
  ctx.shadowOffsetX = 0;
  ctx.shadowOffsetY = 0;
  ctx.shadowColor = 'rgba(0,0,0,1)';
  ctx.shadowBlur = 10;
  
  ctx.fillStyle = getLinearGradientStyle(this.x, this.y, this.x, this.y+this.h, this.n);
  ctx.fillRect(this.x, this.y, this.w, this.h ); 
  
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
  var stick_store = [];
  
  _.times(num, function(){
    stick_store.push( new Stick() );
  });
  
  return stick_store;
}

// 画上 store 存储的全部棍子
function drawSticks(){
  _.each(stick_store, function(stick){
    stick.draw();
  });
}

$("#myCanvas").click(function(e){
    
  var event_x = e.pageX;
  var event_y = e.pageY;
  
  var myCanvas_x = $("#myCanvas").offset().left;
  var myCanvas_y = 0;

  // 以免用户点的太快，最小间隔是100ms
  _.throttle(function(){
    clearCanvas();
    
    stick_store.pop();
    drawSticks();
    drawTabCircle(event_x - myCanvas_x, event_y);
  }, 100)();
});


//游戏初始化
function gameInit(){
  stick_store = createData(sticksNumber);
  
  console.log( stick_store )
  
  drawSticks();

}

gameInit();











