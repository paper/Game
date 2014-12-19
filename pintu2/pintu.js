;
(function ($) {
  function arrayIndexOf(r, num) {
    if (Array.prototype.indexOf) {
      //console.log(r);
      return r.indexOf(num);
    } else {
      for (var i = 0, len = r.length; i < len; i++) {
        if (r[i] === num)
          return i;
      }
      return -1;
    }
  } //end arrayIndexOf
  
  function setStyle(elem, obj) {
    for (var i in obj) {
      if (obj.hasOwnProperty(i)) {
        elem["style"][i] = obj[i];
      }
    }
  } //end setStyle
  
  /**
  @x x轴最大值
  @y y轴最大值
  @ret 从左到右，从上到下，某个数字周围数字的数组集合
  初始化数字范围。数字从 0 开始填，比如：
  0, 1, 2, 3, 4,
  5, 6, 7, 8, 9,
  10, 11, 12, 13, 14
  0的附近是[-1, 5, -1, 1]
  6的附近是[1, 11, 5, 7]
   */
  function getRangeNum(x, y) {
    var ret = [],
    cur = 0,
    i,
    j,
    temp;
    for (i = 0; i < y; i++) {
      for (j = 0; j < x; j++) {
        temp = [
          i > 0 ? cur - x : -1, //上
          i < y - 1 ? cur + x : -1, //下
          j > 0 ? cur - 1 : -1, //左
          j < x - 1 ? cur + 1 : -1 //右
        ];
        ret.push(temp);
        cur++;
      } //for
    } //for
    return ret;
  } //end getRangeNum
  
  var direction = ["up", "down", "left", "right"];
  var emptyFun = function () {};
  
  function pintu(option) {
    var imgSrc = option.imgSrc;
    var imgWidth = option.imgWidth;
    var imgHeight = option.imgHeight;
    var block = option.block || 100;
    var id = option.id || "J_paper_pintu";
    var begin = option.begin || emptyFun;
    var success = option.success || emptyFun;
    var x = parseInt(imgWidth / block, 10);
    var y = parseInt(imgHeight / block, 10);
    var num = 0;
    var beginEmpty = 0;
    var empty = 0;
    
    $(function () {
      var $id = $("#" + id);
      var frag = document.createDocumentFragment();
      var i, j, div, span;
      
      for (i = 0; i < y; i++) { //行
        for (j = 0; j < x; j++) { //列
          div = document.createElement("div");
          div.className = "paper-pintu-block";
          var imgx = block * j * -1 + "px";
          var imgy = block * i * -1 + "px";
          setStyle(div, {
            width : block + "px",
            height : block + "px",
            left : block * j + "px",
            top : block * i + "px",
            background : "url(" + imgSrc + ") " + imgx + " " + imgy + " no-repeat"
          });
          // 最后一格
          if (i == y - 1 && j == x - 1) {
            empty = num;
            beginEmpty = num;
            // 先设置隐藏，success时再显示出来
            setStyle(div, {
              display : "none"
            });
            div.className = "paper-pintu-last-block";
          } else {
            div.setAttribute("data-num", num);
            num++;
          }
          frag.appendChild(div);
        } //for
      } //for
      
      $id.css({
        width : x * block + "px",
        height : y * block + "px",
      }).append(frag);
      
      var $blocks = $id.find(".paper-pintu-block");
      var blocksLength = $blocks.length;
      var ret = getRangeNum(x, y);
      var $lastBlock = $id.find(".paper-pintu-last-block");
      
      // 方块移动
      function moveBlock($elem, isHuman) {
        if (isHuman && begin) {
          begin();
          begin = null;
        }
        var num = +$elem.attr("data-num"),
        rangeNum = ret[num],
        i = arrayIndexOf(rangeNum, empty);
        if (i > -1) {
          $elem.attr("data-num", empty);
          empty = num;
          //移动方块
          switch (direction[i]) {
          case "up":
            $elem.css("top", parseInt($elem.css("top"), 10) - block + "px");
            break;
          case "down":
            $elem.css("top", parseInt($elem.css("top"), 10) + block + "px");
            break;
          case "left":
            $elem.css("left", parseInt($elem.css("left"), 10) - block + "px");
            break;
          case "right":
            $elem.css("left", parseInt($elem.css("left"), 10) + block + "px");
            break;
          }
          isHuman && checkSuccess();
        }
      } //end moveBlock
      
      //随机打乱图片
      function randomBlocks() {
        var max = 1000;
        var a = 0;
        function fn() {
          if (a++ > max)
            return;
          var r = ret[empty];
          var n = parseInt(Math.random() * 4, 10); // 0 - 3
          var m = r[n];
          if (m != -1 && m < blocksLength) {
            moveBlock($blocks.eq(m));
          }
          fn();
        }
        fn();
      } //end randomBlocks
      
      //判断是否成功
      function checkSuccess() {
        if (empty == beginEmpty) {
          for (var i = 0; i < blocksLength; i++) {
            if (+$blocks.eq(i).attr("data-num") != i) {
              return;
            }
          }
          $lastBlock.show();
          success();
        } else {
          $lastBlock.hide();
        }
      } //end checkSuccess
      
      randomBlocks();
      
      $id.on("click", ".paper-pintu-block", function () {
        moveBlock($(this), true);
      });
      
    }); //dom ready
  } //end pintu
  
  window.pintu = pintu;
})(jQuery);