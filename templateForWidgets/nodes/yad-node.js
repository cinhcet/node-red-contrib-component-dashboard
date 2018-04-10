module.exports = function(RED) {
  "use strict";

  function yadNode(config) {
    RED.nodes.createNode(this, config);
    var node = this;
    node.config = config;
    node.yad = RED.nodes.getNode(node.config.yad);

    node.yad.initElementNode(node);


    node.on('input', function(m) {
      if(m.hasOwnProperty('yadSessionID')) {
        node.yad.ajaxResponse(m.yadSessionID, node, {payload: m.payload});
      } else {
        node.yad.sendMessage(node, m);
      }
    });

    node.on('close', function() {
      node.yad.closeElementNode(node);
    });
  }

  yadNode.prototype.recMessage = function(m) {
    var node = this;
    node.send(m);
  }

  yadNode.prototype.recAjax = function(params, mId) {
    var node = this;
    node.send({payload: 'ajaxRequest', params: params, yadSessionID: mId});
  }

  RED.nodes.registerType("yad-node", yadNode);
}
