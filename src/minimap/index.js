
import { debounce } from '../utils';

// 获取缩放比例和map尺寸
function getScaleAndSize({ paper, el, $ }) {
  const elWidth = $(el).width();
  const elHeight = $(el).height();
  const paperWidth = paper.options.width;
  const paperHeight = paper.options.height;
  const elAspectRatio = elWidth / elHeight;
  const paperAspectRatio = paperWidth / paperHeight;
  let scale;
  let mapWidth;
  let mapHeight;
  if (paperAspectRatio > elAspectRatio) { //paper较宽， 以el宽作为缩放基准
    scale = elWidth / paperWidth
    mapWidth = elWidth;
    mapHeight = paperHeight * scale;
  } else { //以el高作为基准
    scale = elHeight / paperHeight;
    mapHeight = elHeight;
    mapWidth = paperWidth * scale;
  }
  return {
    scale,
    width: mapWidth,
    height: mapHeight,
    origin: paper.options.origin,
    paperScale: paper.scale()
  }
}

// 获取视口与paper比例
function getViewScale({ paper, paperViewEl, $ }) {
  const { width, height } = paper.options;
  const el = $(paperViewEl)[0];
  const viewWidth = el.clientWidth;
  const viewHeight = el.clientHeight;
  return {
    viewScaleX: viewWidth / width > 1 ? 1 : viewWidth / width,
    viewScaleY: viewHeight / height > 1 ? 1 : viewHeight / height
  }
}

// 初始化map视口尺寸和位置
function setMapNavSize({ $, paperViewEl, paper, mapNav, minimapPaper, scale }) {
  const { viewScaleX, viewScaleY } = getViewScale({ $, paperViewEl, paper });
  const { width, height } = minimapPaper.options;
  const style = {
    top: $(paperViewEl).scrollTop() * scale,
    left: $(paperViewEl).scrollLeft() * scale
  };
  $(mapNav).width(width * viewScaleX).height(height * viewScaleY).css(style);
}


// 判断是否需要自适应（坐标为负、或者图形过大时自适应）
function needFit({ paper }) {
  const paperWidth = paper.options.width;
  const paperHeight = paper.options.height;

  const { sx, sy } = paper.scale();
  const { tx, ty } = paper.translate();
  const { x, y, height, width } = paper.getContentArea();
  const absoluteX = x + tx;
  const absoluteY = y + ty;
  const xEnd = (x + width) * sx + tx;
  const yEnd = (y + height) * sy + ty;

  // 超出paper边界才自适应
  return absoluteX < 0 || absoluteY < 0 || xEnd > paperWidth || yEnd > paperHeight;
}

function createMap({ joint, paper, graph, el, jquery, paperViewEl, extra = {}, mapViewColor = '#1890ff' }) {
  const $ = jquery;
  const { scale, width, height } = getScaleAndSize({ paper, el, $ });
  // 创建节点
  let container = document.createElement('div');
  let map = document.createElement('div');
  let mapNav = document.createElement('div');
  container.appendChild(map);
  container.appendChild(mapNav);
  const style = {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center'
  }
  $(el).append(container).css(style);
  $(container).css({ position: 'relative' });
  $(mapNav).css({ position: 'absolute', left: 0, right: 0, border: `1px solid ${mapViewColor}`, cursor: 'move', zIndex: 10 });

  let defaultOption = {
    el: map,
    model: graph,
    width,
    height,
    interactive: false,
  }

  const minimapPaper = new joint.dia.Paper({
    gridSize: 10,
    drawGrid: true,
    ...extra,
    ...defaultOption
  });


  minimapPaper.scale(scale);
  setMapNavSize({ $, paperViewEl, paper, mapNav, minimapPaper, scale });

  // 监听图形位置改变
  graph.on({
    'change:position': debounce(function (cell) {
      const flag = needFit({ paper });
      if (flag) {
        paper.fitToContent({ padding: 40, allowNewOrigin: 'any' });
      }
    }
    ),
  })

  paper.on({
    scale: debounce(
      function (sx, sy, ox, oy) {
        const flag = needFit({ paper });
        if (!flag) {
          const { scale } = getScaleAndSize({ paper, el, $ });
          minimapPaper.scale(sx * scale, sy * scale, ox * scale, oy * scale);
        } else { //图形超出paper时
          paper.fitToContent({ padding: 40, allowNewOrigin: 'any' });
        }
      }),
    translate: debounce(
      function (ox, oy) {
        const flag = needFit({ paper });
        if (!flag) {
          const { scale, origin } = getScaleAndSize({ paper, el, $ });
          minimapPaper.setOrigin(origin.x * scale, origin.y * scale);
        } else {
          paper.fitToContent({ padding: 40, allowNewOrigin: 'any' });
        }
      }),
    resize: debounce(function (newWidth, newHeight) {
      const { scale, width, height, origin, paperScale } = getScaleAndSize({ paper, el, $ });
      const { sx, sy } = paperScale;
      minimapPaper.setDimensions(width, height);
      minimapPaper.scale(sx * scale, sy * scale);
      setMapNavSize({ $, paperViewEl, paper, mapNav, minimapPaper, scale });
    })
  })

  // 绑定视口滚动事件
  $(paperViewEl).scroll(debounce(function (e) {
    const { scale } = getScaleAndSize({ paper, el, $ });
    const target = e.target;
    $(mapNav).css({ top: target.scrollTop * scale, left: target.scrollLeft * scale });
  }));
  $(window).resize(debounce(function (e) {
    const { scale } = getScaleAndSize({ paper, el, $ });
    setMapNavSize({ $, paperViewEl, paper, mapNav, minimapPaper, scale })
  }))
  $(mapNav).mousedown(function (e) {
    e.preventDefault();
    const x = e.clientX;
    const y = e.clientY;
    const oTop = $(this).position().top;
    const oLeft = $(this).position().left;

    $(document).mousemove(function (e) {
      let newY = (e.clientY - y) + oTop;
      let newX = (e.clientX - x) + oLeft;
      const { width, height } = minimapPaper.options
      const left = width - $(mapNav).width();
      const top = height - $(mapNav).height();

      if (newX > left) {
        newX = left;
      } else if (newX < 0) {
        newX = 0
      }

      if (newY > top) {
        newY = top;
      } else if (newY < 0) {
        newY = 0
      }
      $(mapNav).css({ top: newY, left: newX });

      const { scale } = getScaleAndSize({ paper, el, $ });
      $(paperViewEl).scrollLeft(newX / scale).scrollTop(newY / scale);

    });
    $(document).mouseup(function () {
      $(document).off("mousemove mouseup");
    });
  });
}

export default createMap;
