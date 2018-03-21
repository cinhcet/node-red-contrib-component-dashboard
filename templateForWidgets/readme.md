These are the templates for creating new widgets.

In the "elements" folder, the polymer web-component skeleton can be found.
Use the function "sendMessageToNR(this.id, {payload: 'message!'});" to send something to node-red.
Inside nodeRedMsg(msg), handle incoming messages.

In the "nodes" folder, the template to generate the accompanying node can be found.
Inside "yadNode.prototype.recMessage = function(m)" process messages from the widgets.
Use "node.yad.sendMessage(node, m);" to send messages to the widget.
