/**
 * Copyright (c) 2018 cinhcet@gmail.com
 * Copyright (c) 2017 Sebastian Raff
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

var initialized = false;

module.exports = function(RED) {
  var serveStatic = require('serve-static');
  var socketIO = require('socket.io');
  var path = require('path');
  var fs = require('fs');

  function yad(config) {
    RED.nodes.createNode(this, config);
    var node = this;

    node.elementNodes = {};

    var server = RED.server;
    node.app = RED.httpNode || RED.httpAdmin;

    node.yadPath = 'yad';

    var fullPath = join(RED.settings.httpNodeRoot, node.yadPath);
    var socketIoPath = join(fullPath, 'socket.io');
    node.io = socketIO(server, {path: socketIoPath});

    node.socketList = {};

    node.app.use(join(node.yadPath), serveStatic(path.join(__dirname, "src")));
    node.log("YAD started at " + fullPath);

    node.app.get(join(node.yadPath) + '/requests', function (req, res) {
      var msg = req.query;
      if(msg.hasOwnProperty('id')) {
        if(node.elementNodes.hasOwnProperty(msg.id)) {
          if(typeof node.elementNodes[msg.id].recAjax === 'function') {
            node.elementNodes[msg.id].recAjax(req, res);
          }
        }
      }
    });

    node.io.on('connection', function(socket) {
      node.socketList[socket.id] = socket;

      socket.on('toNR', function(msg) {
        if(msg.hasOwnProperty('elementID') && msg.hasOwnProperty('msg')) {
          if(node.elementNodes.hasOwnProperty(msg.elementID)) {
            node.elementNodes[msg.elementID].recMessage(msg.msg);
          }
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
        node.socketList[socketID].disconnect();
      });

      // TODO properly close socketIO?
      // TODO properly close app.use serve static stuff?

      node.app._router.stack.forEach(function(route,i,routes) {
        if (route.route && route.route.path === (join(node.yadPath) + '/requests') && route.route.methods['get']) {
          routes.splice(i,1);
        }
      });
    });
  }

  yad.prototype.sendMessage = function(elementNode, msg) {
    var node = this;
    var sendMsg = {elementID: elementNode.elementID, msg: msg};
    node.io.emit('fromNR', JSON.stringify(sendMsg));
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

  RED.nodes.registerType("yad-configuration", yad);
}


//from http://stackoverflow.com/a/28592528/3016654
function join() {
  var trimRegex = new RegExp('^\\/|\\/$','g'),
  paths = Array.prototype.slice.call(arguments);
  return '/' + paths.map(function(e){return e.replace(trimRegex,"");}).filter(function(e){return e;}).join('/');
}
