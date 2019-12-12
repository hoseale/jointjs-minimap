function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys(source, true).forEach(function (key) { _defineProperty(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys(source).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

import { debounce } from '../utils'; // 获取缩放比例和map尺寸

function getScaleAndSize(_ref) {
  var paper = _ref.paper,
      el = _ref.el,
      $ = _ref.$;
  var elWidth = $(el).width();
  var elHeight = $(el).height();
  var paperWidth = paper.options.width;
  var paperHeight = paper.options.height;
  var elAspectRatio = elWidth / elHeight;
  var paperAspectRatio = paperWidth / paperHeight;
  var scale;
  var mapWidth;
  var mapHeight;

  if (paperAspectRatio > elAspectRatio) {
    //paper较宽， 以el宽作为缩放基准
    scale = elWidth / paperWidth;
    mapWidth = elWidth;
    mapHeight = paperHeight * scale;
  } else {
    //以el高作为基准
    scale = elHeight / paperHeight;
    mapHeight = elHeight;
    mapWidth = paperWidth * scale;
  }

  return {
    scale: scale,
    width: mapWidth,
    height: mapHeight,
    origin: paper.options.origin,
    paperScale: paper.scale()
  };
} // 获取视口与paper比例


function getViewScale(_ref2) {
  var paper = _ref2.paper,
      paperViewEl = _ref2.paperViewEl,
      $ = _ref2.$;
  var _paper$options = paper.options,
      width = _paper$options.width,
      height = _paper$options.height;
  var el = $(paperViewEl)[0];
  var viewWidth = el.clientWidth;
  var viewHeight = el.clientHeight;
  return {
    viewScaleX: viewWidth / width > 1 ? 1 : viewWidth / width,
    viewScaleY: viewHeight / height > 1 ? 1 : viewHeight / height
  };
} // 初始化map视口尺寸和位置


function setMapNavSize(_ref3) {
  var $ = _ref3.$,
      paperViewEl = _ref3.paperViewEl,
      paper = _ref3.paper,
      mapNav = _ref3.mapNav,
      minimapPaper = _ref3.minimapPaper,
      scale = _ref3.scale;

  var _getViewScale = getViewScale({
    $: $,
    paperViewEl: paperViewEl,
    paper: paper
  }),
      viewScaleX = _getViewScale.viewScaleX,
      viewScaleY = _getViewScale.viewScaleY;

  var _minimapPaper$options = minimapPaper.options,
      width = _minimapPaper$options.width,
      height = _minimapPaper$options.height;
  var style = {
    top: $(paperViewEl).scrollTop() * scale,
    left: $(paperViewEl).scrollLeft() * scale
  };
  $(mapNav).width(width * viewScaleX).height(height * viewScaleY).css(style);
} // 判断是否需要自适应（坐标为负、或者图形过大时自适应）


function needFit(_ref4) {
  var paper = _ref4.paper;
  var paperWidth = paper.options.width;
  var paperHeight = paper.options.height;

  var _paper$scale = paper.scale(),
      sx = _paper$scale.sx,
      sy = _paper$scale.sy;

  var _paper$translate = paper.translate(),
      tx = _paper$translate.tx,
      ty = _paper$translate.ty;

  var _paper$getContentArea = paper.getContentArea(),
      x = _paper$getContentArea.x,
      y = _paper$getContentArea.y,
      height = _paper$getContentArea.height,
      width = _paper$getContentArea.width;

  var absoluteX = x + tx;
  var absoluteY = y + ty;
  var xEnd = (x + width) * sx + tx;
  var yEnd = (y + height) * sy + ty; // 超出paper边界才自适应

  return absoluteX < 0 || absoluteY < 0 || xEnd > paperWidth || yEnd > paperHeight;
}

function createMap(_ref5) {
  var joint = _ref5.joint,
      paper = _ref5.paper,
      graph = _ref5.graph,
      el = _ref5.el,
      jquery = _ref5.jquery,
      paperViewEl = _ref5.paperViewEl,
      _ref5$extra = _ref5.extra,
      extra = _ref5$extra === void 0 ? {} : _ref5$extra,
      _ref5$mapViewColor = _ref5.mapViewColor,
      mapViewColor = _ref5$mapViewColor === void 0 ? '#1890ff' : _ref5$mapViewColor;
  var $ = jquery;

  var _getScaleAndSize = getScaleAndSize({
    paper: paper,
    el: el,
    $: $
  }),
      scale = _getScaleAndSize.scale,
      width = _getScaleAndSize.width,
      height = _getScaleAndSize.height; // 创建节点


  var container = document.createElement('div');
  var map = document.createElement('div');
  var mapNav = document.createElement('div');
  container.appendChild(map);
  container.appendChild(mapNav);
  var style = {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center'
  };
  $(el).append(container).css(style);
  $(container).css({
    position: 'relative'
  });
  $(mapNav).css({
    position: 'absolute',
    left: 0,
    right: 0,
    border: "1px solid ".concat(mapViewColor),
    cursor: 'move',
    zIndex: 10
  });
  var defaultOption = {
    el: map,
    model: graph,
    width: width,
    height: height,
    interactive: false
  };
  var minimapPaper = new joint.dia.Paper(_objectSpread({
    gridSize: 10,
    drawGrid: true
  }, extra, {}, defaultOption));
  minimapPaper.scale(scale);
  setMapNavSize({
    $: $,
    paperViewEl: paperViewEl,
    paper: paper,
    mapNav: mapNav,
    minimapPaper: minimapPaper,
    scale: scale
  }); // 监听图形位置改变

  graph.on({
    'change:position': debounce(function (cell) {
      var flag = needFit({
        paper: paper
      });

      if (flag) {
        paper.fitToContent({
          padding: 40,
          allowNewOrigin: 'any'
        });
      }
    })
  });
  paper.on({
    scale: debounce(function (sx, sy, ox, oy) {
      var flag = needFit({
        paper: paper
      });

      if (!flag) {
        var _getScaleAndSize2 = getScaleAndSize({
          paper: paper,
          el: el,
          $: $
        }),
            _scale = _getScaleAndSize2.scale;

        minimapPaper.scale(sx * _scale, sy * _scale, ox * _scale, oy * _scale);
      } else {
        //图形超出paper时
        paper.fitToContent({
          padding: 40,
          allowNewOrigin: 'any'
        });
      }
    }),
    translate: debounce(function (ox, oy) {
      var flag = needFit({
        paper: paper
      });

      if (!flag) {
        var _getScaleAndSize3 = getScaleAndSize({
          paper: paper,
          el: el,
          $: $
        }),
            _scale2 = _getScaleAndSize3.scale,
            origin = _getScaleAndSize3.origin;

        minimapPaper.setOrigin(origin.x * _scale2, origin.y * _scale2);
      } else {
        paper.fitToContent({
          padding: 40,
          allowNewOrigin: 'any'
        });
      }
    }),
    resize: debounce(function (newWidth, newHeight) {
      var _getScaleAndSize4 = getScaleAndSize({
        paper: paper,
        el: el,
        $: $
      }),
          scale = _getScaleAndSize4.scale,
          width = _getScaleAndSize4.width,
          height = _getScaleAndSize4.height,
          origin = _getScaleAndSize4.origin,
          paperScale = _getScaleAndSize4.paperScale;

      var sx = paperScale.sx,
          sy = paperScale.sy;
      minimapPaper.setDimensions(width, height);
      minimapPaper.scale(sx * scale, sy * scale);
      setMapNavSize({
        $: $,
        paperViewEl: paperViewEl,
        paper: paper,
        mapNav: mapNav,
        minimapPaper: minimapPaper,
        scale: scale
      });
    })
  }); // 绑定视口滚动事件

  $(paperViewEl).scroll(debounce(function (e) {
    var _getScaleAndSize5 = getScaleAndSize({
      paper: paper,
      el: el,
      $: $
    }),
        scale = _getScaleAndSize5.scale;

    var target = e.target;
    $(mapNav).css({
      top: target.scrollTop * scale,
      left: target.scrollLeft * scale
    });
  }));
  $(window).resize(debounce(function (e) {
    var _getScaleAndSize6 = getScaleAndSize({
      paper: paper,
      el: el,
      $: $
    }),
        scale = _getScaleAndSize6.scale;

    setMapNavSize({
      $: $,
      paperViewEl: paperViewEl,
      paper: paper,
      mapNav: mapNav,
      minimapPaper: minimapPaper,
      scale: scale
    });
  }));
  $(mapNav).mousedown(function (e) {
    e.preventDefault();
    var x = e.clientX;
    var y = e.clientY;
    var oTop = $(this).position().top;
    var oLeft = $(this).position().left;
    $(document).mousemove(function (e) {
      var newY = e.clientY - y + oTop;
      var newX = e.clientX - x + oLeft;
      var _minimapPaper$options2 = minimapPaper.options,
          width = _minimapPaper$options2.width,
          height = _minimapPaper$options2.height;
      var left = width - $(mapNav).width();
      var top = height - $(mapNav).height();

      if (newX > left) {
        newX = left;
      } else if (newX < 0) {
        newX = 0;
      }

      if (newY > top) {
        newY = top;
      } else if (newY < 0) {
        newY = 0;
      }

      $(mapNav).css({
        top: newY,
        left: newX
      });

      var _getScaleAndSize7 = getScaleAndSize({
        paper: paper,
        el: el,
        $: $
      }),
          scale = _getScaleAndSize7.scale;

      $(paperViewEl).scrollLeft(newX / scale).scrollTop(newY / scale);
    });
    $(document).mouseup(function () {
      $(document).off("mousemove mouseup");
    });
  });
}

export default createMap;