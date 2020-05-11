/**
 * Copyright (c) 2020 cinhcet
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 **/

import io from 'socket.io-client';

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
        let elementID = msg.elementID;
        if(self.yadElements.hasOwnProperty(elementID)) {
          let yadElement = self.yadElements[elementID];
          let type = msg.type;
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
    Object.defineProperty(yadElement, 'elementId', {
      get: function () {
        if(yadElement.parentId === '') {
          return yadElement.id;
        } else {
          return yadElement.parentId + '_' + yadElement.id;
        }
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
 
    yadElement._sendToNR = function(msg) {
      if(!yadElement.noMsg) {
        self.sendMessageToNR(yadElement.elementId, msg);
        // TODO maybe also dispatch event in this case?
      } else {
        yadElement.dispatchEvent(new CustomEvent('element-event', {detail: msg}));
      }
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


  // AJAX related methods
  ajaxCall(yadElement, params, callback) {
    var s = location.pathname + 'requests?elementId=' + encodeURIComponent(yadElement.elementId);
    Object.keys(params).forEach(function(key) {
      s += '&' + encodeURIComponent(key) + '=' + encodeURIComponent(params[key]);
    });
    fetch(s)
      .then((response) => {
        return response.json();
      })
      .then((data) => {
        if(callback) callback(data);
      });
  }

}

var YAD = new YADClass();
window.YAD = YAD;
export default YAD;
