// TODO refactor in closure

var socket;
var reconnectTimer;

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
    if(msg.hasOwnProperty('elementID') && msg.hasOwnProperty('msg')) {
      document.getElementById(msg.elementID).nodeRedMsg(msg.msg);
    }
  });
});
