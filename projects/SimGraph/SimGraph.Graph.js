// SimGraph.Graph.style {}
// 
// SimGraph.Graph.getNode
// SimGraph.Graph.getAllNodes
// SimGraph.Graph._createNode
// SimGraph.Graph.createSourceNode
// SimGraph.Graph.createSumNode
// 
// SimGraph.Graph.createConnection
// SimGraph.Graph._visit
// SimGraph.Graph._topoSort
// SimGraph.Graph.evaluateGraph


// Graph Storage Structure:
// {
//     nsig: {'node':nodeObject, 'inputs':['n_1_sig','n_2_sig']},
//     nsig: {'node':nodeObject, 'inputs':['n_3_sig','n_4_sig']},
// }
// Connector Storage Structure:
// {
//     csig: {'connector':connectorObject, 'sourceNode':nodeSig, 'destNode':destSig},
// }

SimGraph.Graph = new Class({
    
    Implements: Options,
    
    options: {
        elementId: "",
        style: {
            size: {
                width: 500,
                hieght: 500,
            },
            defaultNodeSpacing: {
                x: 50,
                y: 50,
            },
        },
    },
    
    initialize: function(options) {
        this.setOptions(options);
        
        this.style         = this.options.style;
        this._graph        = new Object; // Graph Structure
        this._connectors   = new Object;
        this._domContainer = $(this.options.elementId);
        this._canvas       = Raphael(this._domContainer, this.style.size.width, this.style.size.height);
    },
    
    createConnection: function(sourceNode, destNode) {
        this.graph[destNode._signature].inputs.push(sourceNode._signature);
        
        var connector = new Connector(this._canvas);
        var csig = connector._signature;
        
        connector.draw(sourceNode.style.xpos, sourceNode.style.ypos, destNode.style.xpos, destNode.style.ypos);
        
        // if the connector signature doesn't exist in the graph, add it.
        if (csig in this._connectors) {
            return false;
            
        } else {
            this._connectors[csig] = {'connector':connector, 'sourceNode': sourceNode, 'destNode': destNode};
            console.log("Created Connector from: "+sourceNode.name+" to "+destNode.name);
            return true;
        }
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
        console.log(order);
        order.each(function(sig, idx) {
            var node = this._graph[sig].node;
            var inputValues = this._graph[sig].inputs.map(function(inNode, idx) {
                return this._graph[inNode].node.result;
            }.bind(this));
            
            node.compute(inputValues);
            console.log(node.result);
            
        }.bind(this));
    },
    
    clearGraph: function() {
        this._graph = {};
        this._canvas.clear();
    },
    
    getNode: function() {
        
    },
    
    getAllNodes: function() {
        
    },
    
    createNode: function(nodeType, opts) {
        var node = null;
        switch(nodeType) {
            case "Source":
                node = new SimGraph.Nodes.SourceNode(this._canvas, opts);
                break;
            case "Sum":
                node = new SimGraph.Nodes.SumNode(this._canvas, opts);
                break;
        };
        
        var nsig = node._signature;
        
        // if the node signature doesn't exist in the graph, add it.
        if (nsig in this._graph) {
            return false;
            
        } else {
            this._graph[nsig] = {'node': node, 'inputs': []};
            console.log("Added Node: "+node.name+" ("+node._signature+")");
            return true;
        }
        
    },
    
});