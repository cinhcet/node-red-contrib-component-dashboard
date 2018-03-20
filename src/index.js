var socket;

function sendMessageToNR(elementID, msg) {
  socket.emit('toNR', {elementID: elementID, msg: msg});
}

window.addEventListener('WebComponentsReady', function (e) {
  socket = io({path: location.pathname + 'socket.io'});
  socket.on('connect', function () {
    
  });

  socket.on('disconnect', function () {

  });

  socket.on('fromNR', function(msg) {
    msg = JSON.parse(msg);
    if(msg.hasOwnProperty('elementID') && msg.hasOwnProperty('msg')) {
      document.getElementById(msg.elementID).nodeRedMsg(msg.msg);
    }
  });
});
