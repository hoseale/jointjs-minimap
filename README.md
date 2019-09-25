# jointjs-minimap

You can quickly build minimap with jointjs-minimap

### Installation

Install using NPM or yarn

npm install --save jointjs-minimap

yarn add jointjs-minimap


### Usage

```javascript

import * as React from "react";
import minimap from "jointjs-minimap";
const joint = require('jointjs');
import $ from "jquery";

class Example extends React.Component{

  componentDidMount() {
    const graph = new joint.dia.Graph();
    const paper = new joint.dia.Paper({
      el: document.getElementById('paper'),
      model: graph,
      width: 800,
      height: 800,
      gridSize: 10,
      drawGrid: true
    });

    minimap({
      el: '#minimap'
      joint,
      paper,
      graph,
      jquery: $,
      paperViewEl: '#paperView',
      extra: {
        background: {  color: '#eee' }
      },
      mapViewColor: '#1890ff'
    })
  }

  render(){
    return(
      <div>
        <div id='paperView' style={{ width: 800, height: 400, overflow: 'auto' }}>
          <div id='paper'></div>
        </div>
        <div id='minimap' style={{ width: 300, height: 300 }}></div>
      </div>
    )
  }
}

```

### minimap(options)

* options.el ---minimap container
* options.joint
* options.paper
* options.graph
* options.jquery
* options.paperViewEl ---Viewport element(paper's parent element)
* options.extra    ---minimap paper extra options,  default {}
* options.mapViewColor  --- default #1890ff




