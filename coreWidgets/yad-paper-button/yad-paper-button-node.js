module.exports = function(RED) {
  "use strict";
  function yadPaperButton(config) {
    RED.nodes.createNode(this, config);
    var node = this;
    node.config = config;
    node.yad = RED.nodes.getNode(node.config.yad);

    node.yad.initElementNode(node);

    node.on('input', function(m) {
      //node.yad.sendMessage(node, m);
    });

    node.on('close', function() {
      node.yad.closeElementNode(node);
    });
  }

  yadPaperButton.prototype.recMessage = function(m) {
    var node = this;
    var msg = {payload: true};
    node.send(msg);
  }

  RED.nodes.registerType("yad-paper-button", yadPaperButton);
}
