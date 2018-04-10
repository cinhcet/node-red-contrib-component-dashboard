// TODO refactor in closure

var socket;
var reconnectTimer;

var yadElements = {};

function addYadElement(yadElement) {
  var elementID = yadElement.elementId;
  if(!yadElements.hasOwnProperty(elementID)) {
    yadElements[elementID] = yadElement;
  } else {
    console.log('There is an element with elementID ' + elementID + ' already!');
  }
}

function removeYadElement(yadElement) {
  var elementID = yadElement.elementId;
  if(yadElements.hasOwnProperty(elementID)) {
    delete yadElements[elementID];
  }
}

function sendMessageToNR(elementID, msg) {
  socket.emit('toNR', {elementID: elementID, msg: msg});
}

window.addEventListener('WebComponentsReady', function (e) {
  socket = io({path: location.pathname + 'socket.io'});
  socket.on('connect', function () {
    console.log('connected');
    window.clearTimeout(reconnectTimer);
  });

  socket.on('disconnect', function () {
    console.log('disconnected');
    reconnectTimer = window.setTimeout(function() {
      socket.close();
      socket.connect();
      console.log('reconnect attempt');
    }, 1000);
  });

  socket.on('reconnect_attempt', function () {
    console.log('reconnect attempt');
  });

  socket.on('fromNR', function(msg) {
    msg = JSON.parse(msg);
    if(msg.hasOwnProperty('elementID') && msg.hasOwnProperty('msg') && msg.hasOwnProperty('type')) {
      var elementID = msg.elementID;
      if(yadElements.hasOwnProperty(elementID)) {
        var yadElement = yadElements[elementID];
        var type = msg.type;
        if(type === 'msg') {
          if(typeof yadElement.nodeRedMsg === 'function') {
            yadElement.nodeRedMsg(msg.msg);
          }
        } else if(type === 'initMsgOC') {
          if(typeof yadElement.nodeRedInitMsgOnConnect === 'function') {
            yadElement.nodeRedInitMsgOnConnect(msg.msg);
          }
        }
      } else {
        console.log('No element with elemID ' + elementID + ' registered');
        // TODO send message to node-red in this case!
        // TODO general check for all ids of node-red also??!??
      }
    }
  });
});
