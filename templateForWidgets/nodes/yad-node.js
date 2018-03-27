module.exports = function(RED) {
  "use strict";

  function yadNode(config) {
    RED.nodes.createNode(this, config);
    var node = this;
    node.yad = RED.nodes.getNode(config.yad);

    node.elementID = config.elementID;

    node.yad.addElementNode(node);

    node.resObjects = {};

    node.on('input', function(m) {
      if(m.hasOwnProperty('yadSessionID')) {
        if(node.resObjects.hasOwnProperty(m.yadSessionID)) {
          node.resObjects[m.yadSessionID].send(JSON.stringify({payload: m.payload}));
          delete node.resObjects[m.yadSessionID];
        }
      } else {
        node.yad.sendMessage(node, m);
      }
    });

    node.on('close', function() {
      node.yad.removeElementNode(node);
    });
  }

  yadNode.prototype.recMessage = function(m) {
    var node = this;
    node.send(m);
  }

  yadNode.prototype.recAjax = function(req, res) {
    var node = this;
    var mId = RED.util.generateId();
    console.log(mId);
    node.resObjects[mId] = res;
    // TODO add timeout to delete res.Objects[mId] to avoid memory leak.
    // TODO refactor in yad.js or by abstract class to remove boilderplate
    node.send({payload: 'ajaxRequest', params: req.query, yadSessionID: mId});
  }

  RED.nodes.registerType("yad-node", yadNode);
}
