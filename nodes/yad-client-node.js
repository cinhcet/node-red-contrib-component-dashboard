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

module.exports = function(RED) {
  "use strict";

  function yadNode(config) {
    RED.nodes.createNode(this, config);
    var node = this;
    node.config = config;
    
    function registerClientEventHandlers(yadConfiguration) {
      function sendConnectionMessage(message) {
        node.send({
          payload: 'newClientConnected',
          _dashboard: yadConfiguration.name,
          ...message
        });
      }
  
      function sendDisconnectionMessage(message) {
        node.send({
          payload: 'clientDisconnected',
          _dashboard: yadConfiguration.name,
          ...message
        });
      }
  
      yadConfiguration.eventEmitter.on('newClientConnected', sendConnectionMessage);
      yadConfiguration.eventEmitter.on('clientDisconnected', sendDisconnectionMessage);
  
      node.on('close', function() {
        yadConfiguration.eventEmitter.removeListener('newClientConnected', sendConnectionMessage);
        yadConfiguration.eventEmitter.removeListener('clientDisconnected', sendDisconnectionMessage);
      });
    }

    if(node.config.yad) {
      var yadConfiguration = RED.nodes.getNode(node.config.yad);
      registerClientEventHandlers(yadConfiguration);
    } else {
      RED.nodes.eachNode(function(n) {
        if(n.type === 'yad-configuration') {
          var yadConfiguration = RED.nodes.getNode(n.id);
          registerClientEventHandlers(yadConfiguration);
        }
      });
    }
  }

  RED.nodes.registerType("yad-client-node", yadNode);
}
