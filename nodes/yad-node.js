module.exports = function(RED) {
  "use strict";
  function yadNode(config) {
    RED.nodes.createNode(this, config);
    var node = this;
    node.yad = RED.nodes.getNode(config.yad);

    node.elementID = config.elementID;

    node.yad.addElementNode(node);

    node.on('input', function(m) {
      node.yad.sendMessage(node, m);
    });

    node.on('close', function() {
      node.yad.removeElementNode(node);
    });
  }

  yadNode.prototype.recMessage = function(m) {
    var node = this;
    node.send(m);
  }

  RED.nodes.registerType("yad-node", yadNode);
}
