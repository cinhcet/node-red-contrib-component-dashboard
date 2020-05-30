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


"use strict";

var AJAX_TIMEOUT = 20000;

var socketIOInstances = new Map();

module.exports = function(RED) {
  var serveStatic = require('serve-static');
  var socketIO = require('socket.io');
  var path = require('path');
  var fs = require('fs');
  var Events = require('events');

  var userDirNR = RED.settings.userDir

  function yad(config) {
    RED.nodes.createNode(this, config);
    var node = this;

    node.elementNodes = {};
    node.eventEmitter = new Events.EventEmitter();
    node.eventEmitter.setMaxListeners(0);

    var server = RED.server;
    node.app = RED.httpNode || RED.httpAdmin;

    node.yadPath = config.name;

    node.yadFolder = null;

    var success = node.createFolderStructure();
    if(!success) {
      node.error('YAD will not start because of folder creation error');
      return;
    }

    var fullPath = join(RED.settings.httpNodeRoot, node.yadPath);
    var socketIoPath = join(fullPath, 'socket.io');

    if(!socketIOInstances.has(node.yadPath)) {
      let socketIOInstance = socketIO(server, {path: socketIoPath});
      socketIOInstance.use(function(socket, next) {
        if(socket.handshake.xdomain === false) {
          return next();
        } else {
          socket.disconnect(true);
        }
      });
      socketIOInstances.set(node.yadPath, socketIOInstance);
    }
    node.io = socketIOInstances.get(node.yadPath);

    node.socketList = {};

    node.staticName = 'yadStatic_' + node.yadPath;

    node.app.use(join(node.yadPath), createServeStaticName(node.staticName, serveStatic(path.join(node.yadFolder, "dist"))));
    node.log("YAD started at " + fullPath);

    node.app.get(join(node.yadPath) + '/requests', function(req, res) {
      var msg = req.query;
      if(msg.hasOwnProperty('elementId')) {
        if(node.elementNodes.hasOwnProperty(msg.elementId)) {
          var elementNode = node.elementNodes[msg.elementId];
          if(typeof elementNode.recAjax === 'function') {
            var mId = RED.util.generateId();
            elementNode.resObjects[mId] = res;
            elementNode.resObjectsTimeouts[mId] = setTimeout(function() {
              elementNode.resObjects[mId].status(504).end();
              delete elementNode.resObjects[mId];
              delete elementNode.resObjectsTimeouts[mId];
              elementNode.warn('Timeout for ajax request');
            }, AJAX_TIMEOUT);

            elementNode.recAjax(msg, mId);
          } else {
            node.warn('node does not implement recAjax function');
          }
        } else {
          node.warn('no node with elementId ' + msg.elementId);
        }
      } else {
        node.warn('malformed ajax request params, no elementId');
      }
    });

    node.io.on('connection', function(socket) {
      node.socketList[socket.id] = socket;

      // emit event when new ui client connects
      node.eventEmitter.emit('newClientConnected');

      // receive message from ui
      socket.on('toNR', function(msg) {
        if(msg.hasOwnProperty('elementID') && msg.hasOwnProperty('msg')) {
          if(node.elementNodes.hasOwnProperty(msg.elementID)) {
            node.elementNodes[msg.elementID].recMessage(msg.msg);
          }
        }
      });

      // element has been initialized in the browser
      socket.on('elementInitToNR', function(msg) {
        if(node.elementNodes.hasOwnProperty(msg.elementID)) {
          var elementNode = node.elementNodes[msg.elementID];

          // Init message when a new ui client connects
          if(Object.keys(elementNode.initMessageOnConnect)) {
            var sendMsg = {elementID: elementNode.elementID, msg: elementNode.initMessageOnConnect, type: 'initMsgOC'};
            socket.emit('fromNR', JSON.stringify(sendMsg));
          }

          // Replay messages
          var sendMsg = {elementID: elementNode.elementID, type: 'replayMsg'};
          Object.keys(elementNode.replayMessages).forEach(function(replayMsgId) {
            sendMsg.msg = elementNode.replayMessages[replayMsgId];
            socket.emit('fromNR', JSON.stringify(sendMsg));
          });
        } else {
          //node.warn('There is an element with id ' + msg.elementID + ' which does not have a node');
        }
      });

      socket.on('disconnect', function() {
        delete node.socketList[socket.id];
      });
    });

    node.io.on('error', function (error) {
      node.warn('YAD socket io error', error);
    });

    node.on('close', function() {
      Object.keys(node.socketList).forEach(function(socketID) {
        node.socketList[socketID].disconnect(true);
      });

      node.io.removeAllListeners();

      var routes = node.app._router.stack;
      for(var i = routes.length - 1; i >= 0; i--) {
        var route = routes[i];
        if(route.name && route.name === node.staticName) {
          routes.splice(i, 1);
        } else if(route.route && route.route.path === (join(node.yadPath) + '/requests') && route.route.methods['get']) {
          routes.splice(i, 1);
        }
      }
    });
  }

  yad.prototype.sendMessage = function(elementNode, msg, replayMsgId) {
    var node = this;
    var sendMsg = {elementID: elementNode.elementID, msg: msg, type: 'msg'};
    node.io.emit('fromNR', JSON.stringify(sendMsg));

    // optional save message for replay when a new client connects
    if(replayMsgId) {
      if(typeof replayMsgId === 'string') {
        elementNode.replayMessages[replayMsgId] = msg;
      } else {
        elementNode.warn('replayMsgId is not a string');
      }
    }
  }

  yad.prototype.addElementNode = function(elementNode) {
    var node = this;
    if(node.elementNodes.hasOwnProperty(elementNode.elementID)) {
      node.error('Element ID ' + elementNode.elementID + ' already taken! Not going to add this node');
    } else {
      node.elementNodes[elementNode.elementID] = elementNode;
    }
  }

  yad.prototype.removeElementNode = function(elementNode) {
    var node = this;
    if(node.elementNodes.hasOwnProperty(elementNode.elementID)) {
      delete node.elementNodes[elementNode.elementID];
    }
  }

  // must be called from every yad-node
  yad.prototype.initElementNode = function(elementNode) {
    elementNode.elementID = elementNode.config.elementID;

    // storage for the ajax response method
    elementNode.resObjects = {};
    elementNode.resObjectsTimeouts = {};

    elementNode.initMessageOnConnect = {};
    elementNode.replayMessages = {};

    elementNode.yad.addElementNode(elementNode);
  }

  // must be called by every yad-node in its close handler
  yad.prototype.closeElementNode = function(elementNode) {
    Object.keys(elementNode.resObjectsTimeouts).forEach(function(key) {
      clearTimeout(elementNode.resObjectsTimeouts[key]);
    });
    elementNode.yad.removeElementNode(elementNode);
  }

  yad.prototype.ajaxResponse = function(mId, elementNode, message) {
    if(elementNode.resObjects.hasOwnProperty(mId)) {
      clearTimeout(elementNode.resObjectsTimeouts[mId]);
      if(message !== null) {
        elementNode.resObjects[mId].json(message);
      } else {
        elementNode.resObjects[mId].status(200).end();
      }
      delete elementNode.resObjects[mId];
      delete elementNode.resObjectsTimeouts[mId];
    } else {
      elementNode.warn('Ajax response called with non exisiting res object id');
    }
  }

  yad.prototype.createManifestJSON = function() {
    var node = this;
    var manifest = {
      "name": node.yadPath,
      "short_name": node.yadPath,
      "start_url": "/" + node.yadPath,
      "display": "standalone"
    };
    var dest = path.join(node.yadFolder, 'manifest.webmanifest');
    if(!fs.existsSync(dest)) {
      fs.writeFileSync(dest, JSON.stringify(manifest, null, 2));
    }
  }

  yad.prototype.copySrcFile = function(file) {
    var node = this;
    var dest = path.join(node.yadFolder, path.basename(file));
    if(!fs.existsSync(dest)) {
      fs.copyFileSync(path.join(__dirname, file), dest, fs.constants.COPYFILE_EXCL);
    }
  }

  yad.prototype.createFolderStructure = function() {
    var node = this;
    // TODO the following is not very nodejs like...
    try {
      var yadRootFolderPath = path.join(userDirNR, 'yad');
      if(!fs.existsSync(yadRootFolderPath)) {
        fs.mkdirSync(yadRootFolderPath);
      }
      var yadFolder = path.join(yadRootFolderPath, node.yadPath);
      if(!fs.existsSync(yadFolder)) {
        fs.mkdirSync(yadFolder);
      }
      node.yadFolder = yadFolder;

      node.copySrcFile('../templates/main.js');
      node.copySrcFile('../templates/bundle.js');
      node.copySrcFile('../templates/createWidget.js');
      node.copySrcFile('../templates/bareboneDashboardTemplate/index.html');
      node.copySrcFile('../templates/bareboneDashboardTemplate/widgets.js');
      node.copySrcFile('../templates/bareboneDashboardTemplate/style.css');
      
      node.createManifestJSON();

    } catch(e) {
      node.error('yad error creating files', e);
      return false;
    }
    return true;
  }

  RED.nodes.registerType("yad-configuration", yad);
}

// from http://stackoverflow.com/a/28592528/3016654
function join() {
  var trimRegex = new RegExp('^\\/|\\/$','g'),
  paths = Array.prototype.slice.call(arguments);
  return '/' + paths.map(function(e){return e.replace(trimRegex,"");}).filter(function(e){return e;}).join('/');
}

// from http://atom0s.com/forums/viewtopic.php?t=101
// https://stackoverflow.com/questions/5871040/how-to-dynamically-set-a-function-object-name-in-javascript-as-it-is-displayed-i/22880379#22880379
function createServeStaticName(name, func) {
  return(new Function(`return function(call) {
    return function ${name} () {
      return call(this, arguments);
    }
  }`)())(Function.apply.bind(func));
}
