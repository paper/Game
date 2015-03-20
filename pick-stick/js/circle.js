/**
  小圆圈（鼠标或手点击时生成）对象
  
  @x, @y 分别是小圆圈中心的 x坐标 和 y坐标
*/
function TabCircle(x, y){
  this.x = x;
  this.y = y;
  this.r = CircleOption.r;
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















