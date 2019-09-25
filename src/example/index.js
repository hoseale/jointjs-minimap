var graph = new joint.dia.Graph();
var paper = new joint.dia.Paper({
  el: document.getElementById('paper'),
  model: graph,
  width: 800,
  height: 800,
  gridSize: 10,
  drawGrid: true
});

var rect = new joint.shapes.standard.Rectangle();
rect.position(100, 30);
rect.resize(100, 40);
rect.attr({
  body: {
    fill: 'blue'
  },
  label: {
    text: 'Hello',
    fill: 'white'
  }
});

var rect2 = rect.clone();
rect2.translate(400, 0);
rect2.attr('label/text', 'World!');

var link = new joint.shapes.standard.Link();
link.source(rect);
link.target(rect2);

var rect3 = rect.clone();
rect3.translate(0, 400);
rect3.attr('label/text', 'Foo');
var rect4 = rect3.clone();
rect4.translate(400, 0);
rect4.attr('label/text', 'Bar');
var link2 = new joint.shapes.standard.Link();
link2.source(rect3);
link2.target(rect4);
graph.addCells([rect, rect2, rect3, rect4, link, link2]);

minimap.default({
  joint, 
  paper, 
  graph, 
  el:'#minimap-container', 
  jquery: $, 
  paperViewEl: '#container',
  extra: {
    background: {
      color: '#eee'
    }
  },
  mapViewColor: 'red'
});

let scale = 1
$('#redScale').on('click',(e) => {
  scale = scale - 0.03
  paper.scale(scale);
})
$('#addScale').on('click',(e) => {
  scale = scale + 0.03
  paper.scale(scale);
})

let step = 10
$('#translate').on('click',(e) => {
  const { tx, ty } = paper.translate();
  console.log(tx, ty, '=-----------------------------------')
  paper.translate(tx+10, ty);
})


$('#fit').on('click',(e) => {
  paper.fitToContent({ padding: 40, allowNewOrigin: 'any' });
})

