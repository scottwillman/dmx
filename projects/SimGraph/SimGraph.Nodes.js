// SimGraph.Nodes
// SimGraph.Nodes._Node
// SimGraph.Nodes.SourceNode
// SimGraph.Nodes.SumNode
// SimGraph.Nodes.Behaviours

SimGraph.Nodes = new Object; // "Nodes" Namespace


SimGraph.Nodes.Connector = new Class({
    initialize: function(canvas) {
        this._signature = String.uniqueID();
        this.canvas = canvas;
    },
    
    draw: function(startPosX, startPosY, endPosX, endPosY) {
        this.startPosX = startPosX;
        this.startPosY = startPosY;
        this.endPosX   = endPosX;
        this.endPosY   = endPosY;
        
        var pathString = "M "+this.startPosX+" "+this.startPosY+" l "+this.endPosX+" "+this.endPosY;
        this.canvas.path(pathString);
    }
});



SimGraph.Nodes._Node = new Class({
    // Node Behaviours: 
    //          Dragging
    //          Deleting
    //          Selecting (for connections and properties)
    
    _buildSVG: function(canvas) {
        this.svg = new Object;
        
        var nodeBody = canvas.rect(this.style.xpos, this.style.ypos, this.style.width, this.style.height, this.style.cornerRadius);
        nodeBody.attr({fill: this.style.defaultColor, stroke: this.style.stroke});
        nodeBody._signature = this._signature;
        nodeBody.type = "primary";
        
        // nodeBody.drag(SimGraph.Behaviours.Nodes.drag.move, SimGraph.Behaviours.Nodes.drag.start, SimGraph.Behaviours.Nodes.drag.up);
        // nodeBody.click(SimGraph.Behaviours.Nodes.click.down);
        nodeBody.dblclick(SimGraph.Behaviours.Nodes.click.double);
        nodeBody.hover(SimGraph.Behaviours.Nodes.hover.in, SimGraph.Behaviours.Nodes.hover.out);
        

        var dragHandleWidth = 10;
        var nodeDragHandle = canvas.rect(this.style.xpos - dragHandleWidth, this.style.ypos, dragHandleWidth, this.style.height, this.style.cornerRadius);
        nodeDragHandle.attr({fill: "red", stroke: this.style.stroke, opacity: 0});
        nodeDragHandle._signature = this._signature;
        nodeDragHandle.type = "secondary";
        nodeDragHandle.drag(SimGraph.Behaviours.Nodes.drag.move, SimGraph.Behaviours.Nodes.drag.start, SimGraph.Behaviours.Nodes.drag.up);
        nodeDragHandle.hover(SimGraph.Behaviours.Nodes.hover.in, SimGraph.Behaviours.Nodes.hover.out);

        var portHeight = 10;
        var nodeOutPort = canvas.rect(this.style.xpos, this.style.ypos + this.style.height, this.style.width, portHeight, this.style.cornerRadius);
        nodeOutPort.attr({fill: this.style.defaultColor, stroke: this.style.stroke, opacity: 0});
        nodeOutPort._signature = this._signature;
        nodeOutPort.type = "secondary";
        nodeOutPort.hover(SimGraph.Behaviours.Nodes.hover.in, SimGraph.Behaviours.Nodes.hover.out);
        nodeOutPort.click(SimGraph.Behaviours.Nodes.click.down);

        var nodeInPort = canvas.rect(this.style.xpos, this.style.ypos - portHeight, this.style.width, portHeight, this.style.cornerRadius);
        nodeInPort.attr({fill: this.style.defaultColor, stroke: this.style.stroke, opacity: 0});
        nodeInPort._signature = this._signature;
        nodeInPort.type = "secondary";
        nodeInPort.hover(SimGraph.Behaviours.Nodes.hover.in, SimGraph.Behaviours.Nodes.hover.out);
        nodeInPort.click(SimGraph.Behaviours.Nodes.click.down);

        var nodeName = canvas.text(this.style.xpos + (this.style.width / 2), this.style.ypos + (this.style.height / 3), this.name);
        nodeName._signature = this._signature;
        nodeName.type = "primary";
        nodeName.hover(SimGraph.Behaviours.Nodes.hover.in, SimGraph.Behaviours.Nodes.hover.out);
        nodeName.dblclick(SimGraph.Behaviours.Nodes.click.double);

                
        var nodeValue = canvas.text(this.style.xpos + (this.style.width / 2), this.style.ypos + (this.style.height / 3 * 2), this.result);
        nodeValue._signature = this._signature;
        nodeName.type = "primary";
        // result.drag(SimGraph.Behaviours.Nodes.drag.move, SimGraph.Behaviours.Nodes.drag.start, SimGraph.Behaviours.Nodes.drag.up);
        // result.click(SimGraph.Behaviours.Nodes.click.down);
        
        // this.svg.nodes = [rect, name, result];
        this.svg.nodes = [nodeBody, nodeDragHandle, nodeName, nodeValue, nodeInPort, nodeOutPort];
        SimGraph.Behaviours.Nodes.Groups[this._signature] = this.svg.nodes;
    }
});


SimGraph.Nodes.SourceNode = new Class({
    Implements: [Options, SimGraph.Nodes._Node],
    
    options: {
        name: "",
        defaultValue: 1,
        style: {
            xpos: 50,
            ypos: 50,
            width: 200,
            height: 40,
            cornerRadius: 0,
            stroke: 1,
            defaultColor: "#fff",
        },
    },
    
    initialize: function(canvas, options) {
        this._signature = String.uniqueID();
        this.type       = "Source";
        
        this.setOptions(options);
        this.style  = this.options.style;
        this.name   = this.options.name;
        this.result = this.options.defaultValue;
        
        this._buildSVG(canvas);
    },
    
    compute: function() {
        return true;
    },
});


SimGraph.Nodes.SumNode = new Class({
    Implements: [Options, SimGraph.Nodes._Node],
    
    options: {
        name: "",
        style: {
            xpos: 50,
            ypos: 50,
            width: 80,
            height: 30,
            cornerRadius: 3,
            defaultColor: "#666",
        },
    },
    
    initialize: function(canvas, options) {
        this._signature = String.uniqueID();
        this.type       = "Sum";
        
        this.setOptions(options);
        this.style  = this.options.style;
        this.name   = this.options.name;
        this.result = 0;
        
        this._buildSVG(canvas);
    },
    
    compute: function(inputValues) {
        this.result = 0;
        inputValues.each(function(val, idx) {
            this.result += val;
        }.bind(this));
        return true;
    },
});
