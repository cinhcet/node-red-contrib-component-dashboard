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
    this.connected = false;
  }

  addYadElement(yadElement) {
    var elementID = yadElement.elementId;
    (this.yadElements[elementID] || (this.yadElements[elementID] = [])).push(yadElement);
  }

  removeYadElement(yadElement) {
    var elementID = yadElement.elementId;
    var elementBucket = this.yadElements[elementID];
    if(elementBucket) {
      var elementIndex = elementBucket.indexOf(yadElement);
      if(elementIndex >= 0) {
        elementBucket.splice(elementIndex, 1);
        if(elementBucket.length === 0) {
          delete this.yadElements[elementID];
        }
      }
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
    console.log('initializing YAD...');

    this.socket = io({path: location.pathname + 'socket.io'});
    this.socket.on('connect', function () {
      console.log('YAD connected to server');
      window.clearTimeout(self.reconnectTimer);
      self.connected = true;
      Object.values(self.yadElements)
        .flat()
        .forEach(function(yadElement) {
          self.sendElementInitMsgToNR(yadElement);
        });
      Object.values(self.yadElements)
        .flat()
        .filter(function(yadElement) {
          return typeof yadElement._onSocketConnected === 'function';
        })
        .forEach(function(yadElement) {
          yadElement._onSocketConnected();
        });
    });

    this.socket.on('disconnect', function () {
      console.log('YAD disconnected from server');
      self.connected = false;
      self.reconnectTimer = window.setTimeout(function() {
        console.log('YAD attempting to reconnect to server...');
        self.socket.close();
        self.socket.connect();
      }, 1000);
      Object.values(self.yadElements)
        .flat()
        .filter(function(yadElement) {
          return typeof yadElement._onSocketDisconnected === 'function';
        })
        .forEach(function(yadElement) {
          yadElement._onSocketDisconnected();
        });
    });

    this.socket.on('reconnect_attempt', function () {
      console.log('YAD attempting to reconnect to server...');
    });

    this.socket.on('fromNR', function(msg) {
      msg = JSON.parse(msg);
      if(msg.hasOwnProperty('elementID') && msg.hasOwnProperty('msg') && msg.hasOwnProperty('type')) {
        if(self.yadElements.hasOwnProperty(msg.elementID)) {
          for(const yadElement of self.yadElements[msg.elementID]) {
            if(msg.type === 'msg' || msg.type === 'replayMsg') {
              if(typeof yadElement.nodeRedMsg === 'function') {
                yadElement.nodeRedMsg(msg.msg);
              }
            } else if(msg.type === 'initMsgOC') {
              if(typeof yadElement.nodeRedInitMsgOnConnect === 'function') {
                yadElement.nodeRedInitMsgOnConnect(msg.msg);
              }
            }
          }
        } else {
          console.log('No element registered with either id or yad-id ' + msg.elementID);
          // TODO send message to node-red in this case!
          // TODO general check for all ids of node-red also??!??
        }
      }
    });
  }

  initYadElement(yadElement) {
    var self = this;

    yadElement._yadConnectedInit = false;

    Object.defineProperty(yadElement, 'elementId', {
      get: function () {
        if(yadElement.hasAttribute('yad-id')) {
          return yadElement.getAttribute('yad-id');
        } else if(yadElement.parentId === '') {
          return yadElement.id;
        } else {
          return yadElement.parentId + '_' + yadElement.id;
        }
      }
    });
    Object.defineProperty(yadElement, 'parentId', {
      get: function () {
        return yadElement.getAttribute('parentId') || '';
      }
    });
    Object.defineProperty(yadElement, 'noMsg', {
      get: function () {
        return yadElement.hasAttribute('no-msg');
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
      if(yadElement._yadConnectedInit) {
        return;
      }
      yadElement._yadConnectedInit = true;
      if(!yadElement.noMsg) {
        if(yadElement.id === '' && !yadElement.hasAttribute('yad-id')) {
          console.log('Please specify either id or yad-id attribute for element', yadElement);
        } else {
          self.addYadElement(yadElement);
          if(self.connected) {
            self.sendElementInitMsgToNR(yadElement);
          }
        }
      }
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
