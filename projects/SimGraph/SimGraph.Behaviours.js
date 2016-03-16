SimGraph.Behaviours = new Object;


//////// NODE BEHAVIOURS! ///////////
SimGraph.Behaviours.Nodes = {};

SimGraph.Behaviours.Nodes.Groups = {}; // To Hold SVG "Rapheal Sets" (i.e. rect & text)

/////// DRAG ////////
SimGraph.Behaviours.Nodes.drag = {}; // To Hold Drag Behaviours

SimGraph.Behaviours.Nodes.drag.start = function () {
    console.log("Drag Start: "+this.attr("x")+", "+this.attr("y"));
    SimGraph.Behaviours.Nodes.Groups[this._signature].each(function(item, idx) {
        item.ox = item.attr("x");
        item.oy = item.attr("y");
        // item.animate({opacity: .25}, 500, ">");
    });
};

SimGraph.Behaviours.Nodes.drag.move = function (dx, dy) {
    SimGraph.Behaviours.Nodes.Groups[this._signature].each(function(item, idx) {
        item.attr({x: item.ox + dx, y: item.oy + dy});
    });
};

SimGraph.Behaviours.Nodes.drag.up = function () {
    console.log('Drag End: '+this.attr("x")+", "+this.attr("y"));
    SimGraph.Behaviours.Nodes.Groups[this._signature].each(function(item, idx) {
        item.animate({opacity: 1}, 500, ">");
    });
};

/////// CLICK ////////
SimGraph.Behaviours.Nodes.click = {}; // To Hold Click Behaviours

SimGraph.Behaviours.Nodes.click.down = function() {
    console.log("Click");
};

SimGraph.Behaviours.Nodes.click.double = function() {
    console.log("Double Click");
};

/////// HOVER ////////
SimGraph.Behaviours.Nodes.hover = {};

SimGraph.Behaviours.Nodes.hover.in = function() {
    console.log("Hovering...");
    SimGraph.Behaviours.Nodes.Groups[this._signature].each(function(item, idx) {
        if (item.type == "secondary") {
            item.animate({opacity: 1}, 150, "<");   
        }
    });
};

SimGraph.Behaviours.Nodes.hover.out = function() {
    console.log("Not Hovering...");
    SimGraph.Behaviours.Nodes.Groups[this._signature].each(function(item, idx) {
        if (item.type == "secondary") {
            item.animate({opacity: 0}, 150, ">");
        }
    });
};