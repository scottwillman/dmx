var SimGraph = new Object(); // Base Namespace

// ------------- NODE STYLES ------------------

BasicGreyNodeStyle = {
    styleName: "basic grey",
    
    unselected: {
        bodyFillColor:   new GrayColor(0.05),
        bodyStrokeColor: new GrayColor(0.65),
        bodyStrokeWidth: 1,
        
        nodeNameColor:   new GrayColor(0.8),
        nodeNameFontSize: 11,
        nodeValueColor:  new GrayColor(1.0),
        nodeValueFontSize: 12,
        
        portFillColor:   new GrayColor(0.1),
        portStrokeColor: new GrayColor(0.35),
        portStrokeWidth: 1,
    },
    
    selected: {
        bodyFillColor:   new GrayColor(0.05),
        bodyStrokeColor: "blue",
        bodyStrokeWidth: 3,
        
        nodeNameColor:   new GrayColor(0.8),
        nodeNameFontSize: 11,
        nodeValueColor:  new GrayColor(1.0),
        nodeValueFontSize: 12,
        
        portFillColor:   new GrayColor(0.1),
        portStrokeColor: new GrayColor(0.35),
        portStrokeWidth: 1,
    },
    
    hover: {
        bodyFillColor:   new GrayColor(0.03),
        bodyStrokeColor: new GrayColor(0.65),
        bodyStrokeWidth: 1,
        
        nodeNameColor:   new GrayColor(0.8),
        nodeNameFontSize: 11,
        nodeValueColor:  new GrayColor(1.0),
        nodeValueFontSize: 12,
        
        portFillColor:   new GrayColor(0.1),
        portStrokeColor: new GrayColor(0.35),
        portStrokeWidth: 1,
    }
}

// ------------- NODES ------------------

SimGraph.Nodes = new Object();

SimGraph.Nodes.Base = new Class({
    initialize: function(nodeStyle, properties, propertiesContainerElement) {
        this._signature = String.uniqueID();
        this.nodeType   = "Base";
        this.nodeStyle  = nodeStyle;
        this.properties = properties;
        this.propertiesContainerElement = propertiesContainerElement;
        
        this.isSelected = false;
        this.result     = 0;
        this.name       = "unnamed";
        
        this.canvasElements       = new Object();
        this.canvasElements.group = new Group(); // "Group" is a paperscript object
        this._build(nodeStyle);
    },
    
    _build: function(nodeStyle) {
        var nodeDimensions = [85, 45];
        var portDimensions = [75, 8];
        
        this.canvasElements.body = new Path.Rectangle([100, 100], nodeDimensions);
        this.canvasElements.group.addChild(this.canvasElements.body);
        
        var nodeNamePos = new Point(this.canvasElements.body.bounds.center.x, this.canvasElements.body.bounds.center.y - (nodeDimensions[1] / 5))
        this.canvasElements.nodeName         = new PointText(nodeNamePos);
        this.canvasElements.nodeName.content = this.name;
        this.canvasElements.group.addChild(this.canvasElements.nodeName);
        
        var nodeResultPos = new Point(this.canvasElements.body.bounds.center.x, this.canvasElements.body.bounds.center.y + (nodeStyle.unselected.nodeValueFontSize / 1.25));
        this.canvasElements.nodeResult         = new PointText(nodeResultPos);
        this.canvasElements.nodeResult.content = this.result;
        this.canvasElements.group.addChild(this.canvasElements.nodeResult);
        
        var inPortPos = new Point(this.canvasElements.body.bounds.topCenter.x - portDimensions[0]/2, this.canvasElements.body.bounds.topCenter.y - portDimensions[1]);
        this.canvasElements.inputPort = new Path.Rectangle(inPortPos, portDimensions);
        this.canvasElements.group.addChild(this.canvasElements.inputPort);
        
        var outPortPos = new Point(this.canvasElements.body.bounds.bottomCenter.x - portDimensions[0]/2, this.canvasElements.body.bounds.bottomCenter.y);
        this.canvasElements.outputPort = new Path.Rectangle(outPortPos, portDimensions);
        this.canvasElements.group.addChild(this.canvasElements.outputPort);
        // console.log(portDimensions);
        console.log(this.canvasElements.nodeName.handleBounds);
        return true;
    },
    
    _setStyleState: function(nodeState) {
        // "unselected", "selected", "hover"
        this.canvasElements.body.strokeColor = this.nodeStyle[nodeState].bodyStrokeColor;
        this.canvasElements.body.strokeWidth = this.nodeStyle[nodeState].bodyStrokeWidth;
        this.canvasElements.body.fillColor   = this.nodeStyle[nodeState].bodyFillColor;
        
        this.canvasElements.nodeName.characterStyle.fontSize      = this.nodeStyle[nodeState].nodeNameFontSize;
        this.canvasElements.nodeName.paragraphStyle.justification = 'center';
        this.canvasElements.nodeName.characterStyle.fillColor     = this.nodeStyle[nodeState].nodeNameColor;
        
        this.canvasElements.nodeResult.characterStyle.fontSize      = this.nodeStyle[nodeState].nodeValueFontSize;
        this.canvasElements.nodeResult.paragraphStyle.justification = 'center';
        this.canvasElements.nodeResult.characterStyle.fillColor     = this.nodeStyle[nodeState].nodeValueColor;
        
        this.canvasElements.inputPort.strokeColor = this.nodeStyle[nodeState].portStrokeColor;
        this.canvasElements.inputPort.fillColor   = this.nodeStyle[nodeState].portFillColor;
        
        this.canvasElements.outputPort.strokeColor = this.nodeStyle[nodeState].portStrokeColor;
        this.canvasElements.outputPort.fillColor   = this.nodeStyle[nodeState].portFillColor;
    },
    
    showProperties: function() {
        
        var propertiesGroup = new Element('ul', {
            "class": "propertiesGroup",
        });
        propertiesGroup.inject(this.propertiesContainerElement);
        
        var hiddenSig = new Element('hidden', {
            'type': "hidden",
            'name': "node-signature",
            'value': this._signature,
            'id': "signature-"+this._signature,
        });
        hiddenSig.inject(propertiesGroup);
        
        
        this.properties.each(function(prop, idx) {
            var row = new Element('li');
            row.inject(propertiesGroup);
            
            var label = new Element('label', {
                'for': prop.name+"-"+this._signature,
                'html': prop.label,
            });
            label.inject(row);
            
            switch (prop.type) {
                case "number":
                    var numberInput = new Element('input', {
                        'name': prop.name+"-"+this._signature,
                        'type': 'text',
                        // 'class': 'propertyLabel',
                        'value': prop.value,
                        'id': prop.name+"-"+this._signature,
                        
                        events: {
                            change: function() {
                                var node = simGraph.getNodeBySignature(this._signature);
                                node._updateProperties();
                                node._update();
                                simGraph.evaluateGraph();
                                // simGraph.draw();
                            }.bind(this),
                        }
                    });
                    numberInput.inject(row);
                    break;
                    
                case "text":
                    var textInput = new Element('input', {
                        'name': prop.name+"-"+this._signature,
                        'type': 'text',
                        // 'class': 'propertyLabel',
                        'value': prop.value,
                        'id': prop.name+"-"+this._signature,
                        
                        events: {
                            change: function() {
                                var node = simGraph.getNodeBySignature(this._signature);
                                node._updateProperties();
                                node._update();
                                simGraph.evaluateGraph();
                                // simGraph.draw();
                            }.bind(this),
                        }
                    });
                    textInput.inject(row);
                    break;
            };
        }.bind(this));
    },
    
    _updateProperties: function() {
        if ($("signature-"+this._signature)) {
            this.properties = this.properties.map(function(prop, idx) {
                var el = $(prop.name+"-"+this._signature);
                var value = el.getProperty('value');
                
                if (prop.type === "number") {
                    prop.value = value.toFloat();
                } else {
                    prop.value = value.toString();
                }
                return prop;
            }.bind(this));
        }
    },
    
    getProperty: function(propertyName) {
        var property = false;
        this.properties.each(function(prop, idx) {
            if (prop.name === propertyName) property = prop;
        }.bind(this));
        return property;
    },
    
    getInputPortPosition: function() {
        return this.canvasElements.inputPort.bounds.topCenter;
    },
    
    getOutputPortPosition: function() {
        return this.canvasElements.outputPort.bounds.bottomCenter;
    },
    
    setPosition: function(delta) {
        this.canvasElements.group.position += delta;
    },
    
    setSelected: function(bool) {
        if (bool) {
            this._setStyleState('selected');
            this.isSelected = true;
        } else {
            this._setStyleState('unselected');
            this.isSelected = false;
            this.propertiesContainerElement.empty();
        }
    },
    
    setHighlighted: function(bool) {
        if (bool) {
            if (!this.isSelected) {
                this._setStyleState("hover");
            }
        } else {
            this.isSelected ? this._setStyleState("selected") : this._setStyleState("unselected");
        }
        // bool ? (this.isSelected) ? this._setStyleState("hover") :  this._setStyleState("selected") : this._setStyleState("unselected");
    },
    
    _update: function(displayPrecision) {
        var nodeName = this.getProperty("nodeName");
        this.canvasElements.nodeName.content = nodeName.value;
        
        if (displayPrecision) {
            var width = Math.pow(10, displayPrecision.value);
            var displayResult = Math.round(this.result*width)/width;
        } else {
            var displayResult = this.result;
        }
        this.canvasElements.nodeResult.content = displayResult; //.toString().replace(/\B(?=(?:\d{3})+(?!\d))/g, ",");
        // console.log(this.canvasElements.nodeResult.bounds);
        
        return true;
    },
});


SimGraph.Nodes.Source = new Class({
    Extends: SimGraph.Nodes.Base,
    
    initialize: function(nodeStyle, propertiesContainerElement) {
        properties = [
            {
                "name": "nodeName",
                "value": "Source",
                "label": "Name",
                "type": "text",
            },
            {
                "name": "sourceValue",
                "value": 10,
                "label": "Value",
                "type": "number",
            },
        ]
        
        this.parent(nodeStyle, properties, propertiesContainerElement); // Mootools method to call Extended "initialize"
        this.nodeType = "source";
        this.canvasElements.inputPort.visible = false;
    },
    
    evaluate: function() {
        this._updateProperties();
        var prop = this.getProperty("sourceValue");
        if (prop) this.result = prop.value;
        this._update();
    },
});

SimGraph.Nodes.Random = new Class({
    Extends: SimGraph.Nodes.Base,
    
    initialize: function(nodeStyle, propertiesContainerElement) {
        properties = [
            {
                "name": "nodeName",
                "value": "Random",
                "label": "Name",
                "type": "text",
            },
            {
                "name": "minValue",
                "value": 1,
                "label": "Min",
                "type": "number",
            },
            {
                "name": "maxValue",
                "value": 100,
                "label": "Max",
                "type": "number",
            },
            {
                "name": "decimalPlaces",
                "value": 0,
                "label": "Decimal Places",
                "type": "number",
            },
        ]
        
        this.parent(nodeStyle, properties, propertiesContainerElement); // Mootools method to call Extended "initialize"
        this.nodeType = "random";
        this.canvasElements.inputPort.visible = false;
    },
    
    evaluate: function() {
        this._updateProperties();
        var minVal = this.getProperty("minValue");
        var maxVal = this.getProperty("maxValue");
        var precision = this.getProperty("decimalPlaces");
        // if (minVal && maxVal) this.result = Number.random(minVal.value, maxVal.value);
        this.result = parseFloat(Math.min(minVal.value + (Math.random() * (maxVal.value - minVal.value)), maxVal.value).toFixed(precision.value));
        
        this._update();
        return this.result;
    },
});

SimGraph.Nodes.Sum = new Class({
    Extends: SimGraph.Nodes.Base,
    
    initialize: function(nodeStyle, propertiesContainerElement) {
        properties = [
            {
                "name": "nodeName",
                "value": "Sum",
                "label": "Name",
                "type": "text",
            },
            {
                "name": "displayPrecision",
                "value": 2,
                "label": "Display Precision",
                "type": "number",
            },
        ]
        
        this.parent(nodeStyle, properties, propertiesContainerElement); // Mootools method to call Extended "initialize"
        this.nodeType = "sum";
    },
    
    evaluate: function(inputValues) {
        this.result = 0;
        
        inputValues.each(function(val, idx) {
            this.result += val;
        }.bind(this));
        
        var displayPrecision = this.getProperty("displayPrecision");
        
        this._update(displayPrecision);
        return this.result;
    },
});

SimGraph.Nodes.Multiply = new Class({
    Extends: SimGraph.Nodes.Base,
    
    initialize: function(nodeStyle, propertiesContainerElement) {
        properties = [
            {
                "name": "nodeName",
                "value": "Multiply",
                "label": "Name",
                "type": "text",
            },
            {
                "name": "displayPrecision",
                "value": 2,
                "label": "Display Precision",
                "type": "number",
            },
        ]
        
        this.parent(nodeStyle, properties, propertiesContainerElement); // Mootools method to call Extended "initialize"
        this.nodeType = "multiply";
    },
    
    evaluate: function(inputValues) {
        var multResult = (inputValues.length < 2) ? 0 : 1;
        
        inputValues.each(function(val, idx) {
            multResult *= val;
        });
        this.result = multResult;
        var displayPrecision = this.getProperty("displayPrecision");
        
        this._update(displayPrecision);
        return this.result;
    },
});

// ------------- EDGES ------------------

SimGraph.Edges = new Object();

SimGraph.Edges.Edge = new Class({
    initialize: function(startPoint, endPoint) {
        this._signature = String.uniqueID();
        
        this.startPoint = startPoint;
        this.endPoint   = endPoint;
        
        // var pathStart = inNode.getOutputPortPosition();
        // var pathEnd   = outNode.getInputPortPosition();
        
        this._edge = new Path.Line(this.startPoint, this.endPoint);
        this._edge.strokeColor = new GrayColor(0.5);
        this._edge.strokeWidth = 2;
        
        // this._arrow = new Path();
        // this._arrow.strokeColor = 'black';
        // this._arrow.fillColor   = 'black';
        // this._arrow.add(new Point(10,10));
        // this._arrow.add(new Point(15,20));
        // this._arrow.add(new Point(5,20));
        // this._arrow.closePath();
        // this._arrow.position = pathEnd;
    },
    
    updateStartPoint: function(startPoint) {
        this.startPoint = startPoint;
        this._edge.segments[0].point = this.startPoint;
        // this._arrow.position = this._edge.segments[1].point;
    },
    
    updateEndPoint: function(endPoint) {
        this.endPoint = endPoint;
        this._edge.segments[1].point = this.endPoint;
        // this._arrow.position = this._edge.segments[1].point;
    },
    
    setHighlighted: function(bool, point) {
        this._edge.strokeColor = (bool) ? 'orange' : new GrayColor(0.5);
    },
    
});


// ------------- GRAPH ------------------

SimGraph.Graph = new Class({
    
    // Graph Storage Structure:
    // {
    //     nsig: {'node':nodeObject, 'inputs':['n_1_sig','n_2_sig']},
    //     nsig: {'node':nodeObject, 'inputs':['n_3_sig','n_4_sig']},
    // }
    // Edge Storage Structure:
    // {
    //     esig: {'edge':edgeObject, 'sourceNode':nodeSig, 'destNode':destSig},
    // }
    
    initialize: function(propertiesContainerElement) {
        this._graph = new Object; // Graph Storage
        this._edges = new Object; // Edge Storage
        
        this.moveNode = null;
        this.moveEdge = null;
        
        this.propertiesContainerElement = propertiesContainerElement;
        
        // var bounds = new Rectangle();
        // view.bounds
        // view.zoom = 1;
    },
    
    _visit: function(graph, sig, ORDER, dead) {
        if (dead[sig])
            return;
        
        dead[sig] = true;
        graph[sig].inputs.each(function(child, index) {
            this._visit(graph, graph[sig].inputs[index], ORDER, dead);
        }.bind(this));
        ORDER.push(sig);
    },
    
    _topoSort: function() {
        var dead  = {};
        var ORDER = [];
        
        for (var sig in this._graph)
            dead[sig] = false;
        
        for (var sig in this._graph)
            this._visit(this._graph, sig, ORDER, dead);
        
        return ORDER;
    },
    
    evaluateGraph: function() {
        var order = this._topoSort();
        console.log("- Evaluating");
        order.each(function(sig, idx) {
            var node = this._graph[sig].node;
            var inputValues = this._graph[sig].inputs.map(function(inNode, idx) {
                return this._graph[inNode].node.result;
            }.bind(this));
            node.evaluate(inputValues);
            console.log('eval: '+node.getProperty('nodeName').value+' '+node.result);
        }.bind(this));
        console.log("- Done");
        this.draw();
    },
    
    createNode: function(nodeType) {
        //var node = new SimGraph.Nodes.Base(nodeName, nodePos);
        var node = null;
        switch(nodeType) {
            case "Base":
                node = new SimGraph.Nodes.Base(BasicGreyNodeStyle, this.propertiesContainerElement);
                break;
            case "Source":
                node = new SimGraph.Nodes.Source(BasicGreyNodeStyle, this.propertiesContainerElement);
                break;
            case "Random":
                node = new SimGraph.Nodes.Random(BasicGreyNodeStyle, this.propertiesContainerElement);
                break;
            case "Sum":
                node = new SimGraph.Nodes.Sum(BasicGreyNodeStyle, this.propertiesContainerElement);
                break;
            case "Multiply":
                node = new SimGraph.Nodes.Multiply(BasicGreyNodeStyle, this.propertiesContainerElement);
                break;
        };
        
        this._graph[node._signature] = {'node': node, 'inputs': []};
        console.log("Created node: "+node.name);
        this.draw();
        this.evaluateGraph();
        return node
    },
    
    createEdge: function(pointA, pointB) {
        var edge = new SimGraph.Edges.Edge(pointA, pointB);
        return edge;
    },
    
    connectNodes: function(nodeA, nodeB) {
        // Test to ensure they aren't already connected to each other
        if (nodeA._signature === nodeB._signature) return false;
        if (!nodeB.canvasElements.inputPort.visible) return false;
        if (this._graph[nodeB._signature].inputs.contains(nodeA._signature)) return false;
        if (this._graph[nodeA._signature].inputs.contains(nodeB._signature)) return false;
        
        var edge = new SimGraph.Edges.Edge(nodeA.getOutputPortPosition(), nodeB.getInputPortPosition());
        
        // Add them to inputs of nodeA in the graph stack
        this._graph[nodeB._signature].inputs.push(nodeA._signature);
        this._edges[edge._signature] = {'edge': edge, 'sourceNode': nodeA._signature, 'destNode': nodeB._signature};
        this.evaluateGraph();
        return true;
    },
    
    removeConnection: function(edge) {
        var sourceNode = this._edges[edge._signature].sourceNode;
        var destNode = this._edges[edge._signature].destNode;
        
        var idx = this._graph[destNode].inputs.indexOf(sourceNode);
        if (idx != -1) {
            edge._edge.remove();
            var removed = this._graph[destNode].inputs.splice(idx, 1);
            if (removed) {
                this.evaluateGraph();
                return true;
            }
        }
        return false;
    },
    
    getAllNodes: function() {
        var nodes = new Array();
        Object.values(this._graph).each(function(entry, idx) {
            nodes.push(entry.node);
        });
        return nodes;
    },
    
    getSelectedNodes: function() {
        var selectedNodes = new Array();
        Object.values(this._graph).each(function(entry, idx) {
            if (entry.node.isSelected) selectedNodes.push(entry.node);
        });
        return selectedNodes;
    },
    
    getNodeBySignature: function(signature) {
        return this._graph[signature].node;
    },
    
    getAllEdges: function() {
        var edges = new Array();
        Object.values(this._edges).each(function(entry, idx) {
            edges.push(entry.edge);
        });
        return edges;
    },
    
    updateNodeEdges: function(node) {
        Object.values(this._edges).each(function(entry, idx) {
            if (node._signature === entry.sourceNode) {
                entry.edge.updateStartPoint(node.getOutputPortPosition());
            }
            if (node._signature === entry.destNode) {
                entry.edge.updateEndPoint(node.getInputPortPosition());
            }
        });
    },
    
    draw: function() {
        view.draw();
    },
    
    hitTest: function(point) {
        var result = false;
        var hitResult = project.hitTest(point, { fill: true, stroke: true, tolerance: true });
        if (hitResult) {
            this.getAllEdges().each(function(edge, idx) {
                if (hitResult.item._id === edge._edge._id) result = {"type": "edge", "result": edge};
                return;
            });
            this.getAllNodes().each(function(node, idx) {
                
                switch (hitResult.item._id) {
                    case node.canvasElements.body._id:
                        result = {"type": "node", "result": node};
                        return;
                    case node.canvasElements.outputPort._id:
                        result = {"type": "outputPort", "result": node};
                        return;
                    case node.canvasElements.inputPort._id:
                        result = {"type": "inputPort", "result": node};
                        return;
                }
            });
        }
        // console.log(result);
        return result;
    }
});



// ------------- APP Create ------------------

var simGraph = new SimGraph.Graph($("propertiesContainer")); // Only exists in this "paperScope"
window.simGraph = simGraph;          // Pushed to the global scope for external JS access

// ------------- App PaperScript Tools ------------------

function onMouseMove(event) {
    var hitResult = simGraph.hitTest(event.point);
    if (hitResult) {
        switch(hitResult.type) {
            case "node":
                var node = hitResult.result;
                node.setHighlighted(true);
                break;
            case "outputPort":
                break;
            case "edge":
                var edge = hitResult.result;
                edge.setHighlighted(true, event.point);
                break;
        }
    } else {
        simGraph.getAllNodes().each(function(node, idx) {
            node.setHighlighted(false);
        });
        simGraph.getAllEdges().each(function(edge, idx) {
            edge.setHighlighted(false);
        });
    }
}

function onMouseDown(event) {
    var hitResult = simGraph.hitTest(event.point);
    // console.log(hitResult);
    if (hitResult) {
        switch(hitResult.type) {
            case "node":
                var hitNode = hitResult.result;
                if (!event.modifiers.shift) {
                    simGraph.getAllNodes().each(function(node, idx) {
                        node.setSelected(false);
                    });
                }
                hitNode.setSelected(true);
                hitNode.showProperties();
                simGraph.moveNode = hitNode;
                break;
            case "outputPort":
                var hitNode = hitResult.result;
                var edge = simGraph.createEdge(hitNode.getOutputPortPosition(), event.point);
                simGraph.moveEdge = edge;
                break;
            case "edge":
                var edge = hitResult.result;
                var result = simGraph.removeConnection(edge);
                break;
        }
    } else {
        simGraph.getAllNodes().each(function(node, idx) {
            node.setSelected(false);
        });
    }
}

function onMouseDrag(event) {
    if (simGraph.moveNode) {
        simGraph.moveNode.setPosition(event.delta);
        simGraph.updateNodeEdges(simGraph.moveNode);
    }
    if (simGraph.moveEdge) {
        simGraph.moveEdge.updateEndPoint(event.point-3); // Push the line out from under the cursor. Use bigger than the line width.
    }
}

function onMouseUp(event) {
    if (simGraph.moveNode) simGraph.moveNode = null;
    
    if (simGraph.moveEdge) {
        var hitResult = simGraph.hitTest(event.point);
        if (hitResult) {
            if (hitResult.type === "inputPort" || hitResult.type === "node") {
                simGraph.moveEdge.updateEndPoint(hitResult.result.getInputPortPosition());
                var destNode   = hitResult.result;
                var edgeStart  = simGraph.hitTest(simGraph.moveEdge.startPoint-3);
                var sourceNode = null;
                if (edgeStart.type) sourceNode = edgeStart.result;
                if (sourceNode) simGraph.connectNodes(sourceNode, destNode);
            }
        }
        simGraph.moveEdge._edge.remove();
        simGraph.moveEdge = null;
    }
}


// ------------- Tests ------------------

// var node1 = simGraph.createNode('Source', 'Source1', [100,10]);
// node1.setValue(2);
// var node2 = simGraph.createNode('Source', 'Source2', [300,10]);
// node2.setValue(2);
// var node3 = simGraph.createNode('Sum', 'Add1', [200,150]);
// var node4 = simGraph.createNode('Multiply', 'Mult1', [300,300]);
// simGraph.connectNodes(node1, node3);
// simGraph.connectNodes(node2, node3);
// simGraph.connectNodes(node3, node4);
// simGraph.connectNodes(node2, node4);
// simGraph.evaluateGraph();

