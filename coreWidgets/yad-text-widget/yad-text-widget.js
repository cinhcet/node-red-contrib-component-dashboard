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

import YAD from 'node-red-contrib-component-dashboard/src/lib.js';

const template = document.createElement('template');
template.innerHTML = /*html*/`
  <style>
    :host {
      display: flex;
      justify-content: space-between;
    }
    .label {
      font-weight: bold;
      color: var(--yad-primary-color, #0d47a1);
      margin-right: 5px;
    }
  </style>
  <slot class="label"></slot>
  <div id="text"></div>
`;


class Component extends HTMLElement {
  
  constructor() {
    super();
    YAD.initYadElement(this);
    this.attachShadow({mode: 'open'});
    this.shadowRoot.appendChild(template.content.cloneNode(true));
  }

  connectedCallback() {
    this._connectedCallbackHelper(); 
  }

  nodeRedMsg(msg) {
    if(msg.hasOwnProperty('payload')) {
      this.shadowRoot.getElementById('text').innerHTML = msg.payload;
    }
  }
}

window.customElements.define('yad-text-widget', Component);
