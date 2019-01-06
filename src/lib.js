import io from 'socket.io-client';
//import '@webcomponents/webcomponentsjs/webcomponents-loader.js';
import 'web-animations-js/web-animations-next-lite.min.js';

class YADClass {
  constructor() {
    this.socket = null;
    this.reconnectTimer = null;
    this.yadElements = {};
  }

  addYadElement(yadElement) {
    var elementID = yadElement.elementId;
    if(!this.yadElements.hasOwnProperty(elementID)) {
      this.yadElements[elementID] = yadElement;
    } else {
      console.log('There is an element with elementID ' + elementID + ' already!');
    }
  }

  removeYadElement(yadElement) {
    var elementID = yadElement.elementId;
    if(this.yadElements.hasOwnProperty(elementID)) {
      delete this.yadElements[elementID];
    }
  }

  sendMessageToNR(elementID, msg) {
    this.socket.emit('toNR', {elementID: elementID, msg: msg});
  }

  sendElementInitMsgToNR(yadElement) {
    this.socket.emit('elementInitToNR', {elementID: yadElement.elementId});
  }

  initializeApp() {
    var self = this;
    console.log('initApp');

    this.socket = io({path: location.pathname + 'socket.io'});
    this.socket.on('connect', function () {
      console.log('connected');
      window.clearTimeout(self.reconnectTimer);
    });

    this.socket.on('disconnect', function () {
      console.log('disconnected');
      self.reconnectTimer = window.setTimeout(function() {
        self.socket.close();
        self.socket.connect();
        console.log('reconnect attempt');
      }, 1000);
    });

    this.socket.on('reconnect_attempt', function () {
      console.log('reconnect attempt');
    });

    this.socket.on('fromNR', function(msg) {
      msg = JSON.parse(msg);
      if(msg.hasOwnProperty('elementID') && msg.hasOwnProperty('msg') && msg.hasOwnProperty('type')) {
        var elementID = msg.elementID;
        if(self.yadElements.hasOwnProperty(elementID)) {
          var yadElement = self.yadElements[elementID];
          var type = msg.type;
          if(type === 'msg' || type === 'replayMsg') {
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
  }

  initYadElement(yadElement) {
    var self = this;
    Object.defineProperty(yadElement, 'id', {
      get: function () {
        return yadElement.getAttribute('id');
      }
    });
    Object.defineProperty(yadElement, 'elementId', {
      get: function () {
        return yadElement._computeElementID(yadElement.parentId, yadElement.id)
      }
    });
    Object.defineProperty(yadElement, 'parentId', {
      get: function () {
        if(yadElement.hasAttribute('parentId')) {
          return yadElement.getAttribute('parentId');
        } else {
          return '';
        }
      }
    });
    Object.defineProperty(yadElement, 'noMsg', {
      get: function () {
        if(yadElement.hasAttribute('no-msg')) {
          return true;
        } else {
          return false;
        }
      }
    });

    yadElement._computeElementID = function(parentId, id) {
      if(parentId === '') {
        return id;
      } else {
        return parentId + '_' + id;
      }
    }
    yadElement._sendToNR = function(msg) {
      if(!yadElement.noMsg) {
        self.sendMessageToNR(yadElement.elementId, msg);
        // TODO maybe also dispatch event in this case?
      } else {
        yadElement.dispatchEvent(new CustomEvent('element-event', {detail: msg}));
      }
    }

    // AJAX related methods
    yadElement._getAJAXURL = function() {
      return location.pathname + 'requests';
    }
    yadElement._getAJAXParams = function(params) {
      var rMsg = {elementId: yadElement.elementId};
      Object.assign(rMsg, params);
      return rMsg;
    }

    yadElement._connectedCallbackHelper = function() {
      if(!yadElement.noMsg) {
        if(yadElement.id === '') {
          console.log('Please specify an ID for that element!');
        } else {
          self.addYadElement(yadElement);
          self.sendElementInitMsgToNR(yadElement);
        }
      }
    }
    yadElement._disconnectedCallbackHelper = function() {
      self.removeYadElement(yadElement);
    }
  }
}

var YAD = new YADClass();
export default YAD;
