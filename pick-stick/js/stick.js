/**==================================================
  棍子 对象
  
  @left
  @top 棍子的左上角坐标
  
  @width
  @height 棍子的宽度和高度
  
  @deg 棍子旋转的角度。相对于水平，顺时针方向的角度
  
  @n 根子的颜色方案
=====================================================*/
function Stick(left, top, width, height, deg, n){
  
  var s = Stick.create();
  
  this.left   = isNumeric(left) ? left : s.left;
  this.top    = isNumeric(top) ? top : s.top;
  this.width  = isNumeric(width) ? width : s.width;
  this.height = isNumeric(height) ? height : s.height;
  this.deg    = isNumeric(deg) ? deg : s.deg;
  this.n      = isNumeric(n) ? n : s.n;
  this.rad    = degToRad(this.deg);
  
  // 中心坐标
  this.x = this.left + this.width/2;
  this.y = this.top + this.height/2;
  
  // 计算棍子和容器相交后的两个点的坐标
  this.line = getLineBoxAcrossCoordinate(this.x, this.y, this.rad, canvas.width, canvas.height);
  
  this.id = StickOption._cid++;
  
  // 存储相交的点的id
  this.compare = [];
}

/**==================================================
  得到随机默认的棍子
=====================================================*/
Stick.create = function(){
  /*
    棍子的中心要在一个区间内( width和height是指棍子的宽高 )
    [100px边界 只是举个例子]
    左边的中心 left+(width/2) 的区间是 [100, canvas.width-100];
    =》left的范围是 100 - width/2 < left < width/2 - 100;
    
    上边的中心 top+(height/2) 的区间是 [100, canvas.height-100];
    =》top的范围是 100 - height/2 < top < height/2 - 100;
  */
  
  //中心区域的边界
  var w_boundary = canvas.width * 0.2;
  var h_boundary = canvas.height * 0.2;
  
  return {
    left   : _.random(w_boundary - StickOption.width/2, canvas.width - w_boundary - StickOption.width/2),
    top    : _.random(h_boundary - StickOption.height/2, canvas.height - h_boundary - StickOption.height/2),
    width  : StickOption.width,
    height : StickOption.height,
    //排除水平状态，减少判断。而且少一个水平不影响全局
    deg    : _.random(1, 179),
    n      : _.random(1, 8)
  };
  
};

Stick.prototype.draw = function(context){  
  var ctx2 = context || ctx;
  
  ctx2.save();
  
  // 偏移，旋转，偏移
  ctx2.translate(this.x, this.y);
  ctx2.rotate(this.rad);
  ctx2.translate(-this.x, -this.y);
  
  // 加阴影
  ctx2.shadowOffsetX = 0;
  ctx2.shadowOffsetY = 0;
  ctx2.shadowColor = '#000';
  ctx2.shadowBlur = 3;
  
  // 加渐变
  ctx2.fillStyle = getLinearGradientStyle(this.left, this.top, this.left, this.top+this.height, this.n);
  ctx2.fillRect(this.left, this.top, this.width, this.height ); 
  
  ctx2.restore();
  
  return this;
};

Stick.prototype.reset = function(){
  this.compare = [];
  return this;
};


