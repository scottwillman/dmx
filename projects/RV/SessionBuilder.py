#! /Applications/RV64.app/Contents/MacOS/py-interp

import sys
sys.path.append("/Applications/RV64.app/Contents/src/python/rvSession")

import gto
import gtoContainer as gc



def getAttrType(attr):
    t = type(attr)
    if t == str:
        return gto.STRING
    elif t == int:
        return gto.INT
    elif t == float:
        return gto.FLOAT
    elif t == list:
        if len(attr) > 0:
            return getAttrType(attr[0])

def getAttrSize(attr):
    if type(attr) == list:
        return len(attr)
    else:
        return 1



class Session:
    
    def __init__(self, fps=24):
        
        self._session = gc.gtoContainer()
        
        self._session.rv = gc.Object("rv", "RVSession", 4)
        self._session.rv.append(gc.Component("session", "compinterp"))
        
        fps = gc.Property("fps", gto.FLOAT, size=1, width=1, data=float(fps))
        self._session.rv.session.append(fps)
        
        self.__source_counter = 0
        self.__sequence_counter = 0
        
        self._connections = []
    
    
    def addNode(self, node, counter=None):
        if counter != None:
            output = node.build(counter)
        else:
            output = node.build(self.__source_counter)
        setattr(self._session, node.nodeName, output)
        self.__source_counter += 1
    
    
    def addConnection(self, fromNode, toNode):
        self._connections.append((fromNode, toNode))
    
    
    def write(self, filename):
        # Wire up the graph connections
        self._session.connections = gc.Object("connections", "connection", 4)
        
        self._session.connections.append(gc.Component("evaluation", "compinterp"))
        # eval_data = [[x[0].nodeName, x[1].nodeName] for x in self._connections]
        # eval_prop = gc.Property("connections", gto.STRING, size=len(eval_data), width=2, data=eval_data)
        # self._session.connections.evaluation.append(eval_prop)
        
        lh_data = [x[0].nodeName for x in self._connections]
        lhs = gc.Property("lhs", gto.STRING, size=len(lh_data), width=1, data=lh_data)
        self._session.connections.evaluation.append(lhs)
        
        rh_data = [x[1].nodeName for x in self._connections]
        rhs = gc.Property("rhs", gto.STRING, size=len(rh_data), width=1, data=rh_data)
        self._session.connections.evaluation.append(rhs)
        
        top_nodes =  [x[0].nodeName for x in self._connections]
        top_nodes += [x[1].nodeName for x in self._connections]
        self._session.connections.append(gc.Component("top", "compinterp"))
        top_prop = gc.Property("nodes", gto.STRING, size=len(top_nodes), width=1, data=top_nodes)
        self._session.connections.top.append(top_prop)
        
        self._session.write(filename, 2)


class Node:
    
    def __init__(self):
        self.name = None
        self.typeName = None
        self._cmpts = []
        self._nodeType = None
        self._properties = {}
    
    def _constructNodeName(self, counter):
        nodeName = "%s%06d_%s" % (self.name, counter, self.typeName)
        return nodeName
    
    def build(self, counter):
        self.nodeName = self._constructNodeName(counter)
        # print self.nodeName
        # print self._properties
        for cmpt in self._properties.keys():
            
            c = gc.Component(cmpt, "compinterp")
            for prop in self._properties[cmpt]:
                val = self._properties[cmpt][prop]
                p = gc.Property(prop, getAttrType(val), size=getAttrSize(val), width=1, data=self._properties[cmpt][prop])
                c.append(p)
                
            self._cmpts.append(c)
        
        obj = gc.Object(self.nodeName, self._nodeType, 1)
        
        for cmpt in self._cmpts:
            setattr(obj, cmpt.name(), cmpt)
        
        return obj


class Group(Node):
    def __init__(self):
        Node.__init__(self)
        self.name = None
        self.typeName = None
        self._cmpts = []
        self._nodeType = None
        self._properties = {}
        
    def _constructNodeName(self, counter=None):
        nodeName = "%s%06d" % (self.name, counter)
        return nodeName


class Source(Node):
    
    def __init__(self, path, name="sourceGroup", typeName="source"):
        Node.__init__(self)
        self.name = name
        self.typeName = typeName
        self._nodeType = "RVFileSource"
        self.__addMedia(path)
    
    def __addMedia(self, path):
        self._properties["media"] = {"movie": path}


class SourceGroup(Group):
    
    def __init__(self, ui_name="", fps=24):
        Group.__init__(self)
        self.name = "sourceGroup"
        self._nodeType = "RVSourceGroup"
        
        self._properties['ui'] = {'name': ui_name}


class Sequence(Node):
    
    def __init__(self, name="sequence", typeName="sequence", edl=None):
        Node.__init__(self)
        self.name = name
        self.typeName = typeName
        self._nodeType = "RVSequence"
        
        self._properties['mode'] = {
            'autoEDL': 0,
            'useCutInfo': 0,
        }
        
        formatted_edl = {
            'source': [],
            'frame': [],
            'in': [],
            'out': [],
        }
        if edl:
            for event in edl:
                formatted_edl["source"].append(event["source_index"])
                formatted_edl["frame"].append(event["rec_in"])
                formatted_edl["in"].append(event["source_in"])
                formatted_edl["out"].append(event["source_out"])
                
        # self._properties['edl'] = {
        #     'source': [0, 0, 0, 0],
        #     'frame': [1, 11, 21, 31],
        #     'in': [1000, 1500, 1800, 0],
        #     'out': [1010, 1510, 1810, 0],
        # }
        self._properties['edl'] = formatted_edl


class SequenceGroup(Group):
    
    def __init__(self, ui_name="", fps=24):
        Group.__init__(self)
        self.name = "sequenceGroup"
        self._nodeType = "RVSequenceGroup"
        
        self._properties['ui'] = {'name': ui_name}


class LayoutGroup(Group):
    
    def __init__(self, ui_name="", fps=24):
        Group.__init__(self)
        self.name = "layoutGroup"
        self._nodeType = "RVLayoutGroup"
        
        self._properties['ui'] = {'name': ui_name}


if __name__ == '__main__':
    
    s = Session()
    
    src = Source("/Users/scott/Desktop/GRAVITY_TRAILER.mov")
    # src = Source("/Users/dh5-vfx/Desktop/131028_Test_vA_SW_L.mov")
    s.addNode(src, 0)
    
    srcGrp = SourceGroup(ui_name="gravity trailer")
    s.addNode(srcGrp, 0)
    
    
    edl = [
        {
            'source_index': 0,
            'rec_in': 100,
            'source_in': 1000,
            'source_out': 1010,
        },
        {
            'source_index': 0,
            'rec_in': 110,
            'source_in': 1110,
            'source_out': 1120,
        },
        {
            'source_index': 0,
            'rec_in': 121,
            'source_in': 1500,
            'source_out': 1510,
        },
        {
            'source_index': 0,
            'rec_in': 131,
            'source_in': 1820,
            'source_out': 1900,
        },
        {
            'source_index': 0,
            'rec_in': 211,
            'source_in': 0,
            'source_out': 0,
        },
    ]
    
    seq = Sequence(name="sequenceGroup", edl=edl)
    s.addNode(seq, 1)
    
    seqGrp = SequenceGroup(ui_name="Gravity")
    s.addNode(seqGrp, 1)
    
    s.addConnection(srcGrp, seqGrp)
    
    s.write("test.rv")
    