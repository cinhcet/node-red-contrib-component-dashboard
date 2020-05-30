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
import 'node-red-contrib-component-dashboard/coreWidgets/yad-ripple/yad-ripple.js';

const template = document.createElement('template');
template.innerHTML = /*html*/`
  <style>
    :host {
      display: inline-block;
      vertical-align: middle;
      box-sizing: border-box;
      width: 100%;
      position: relative;
      background-color: var(--yad-primary-color);
      color: var(--yad-primary-ontext-color);
      text-align: center;
      text-decoration: none;
      padding: 5px 15px;
      cursor: pointer;
      border-radius: 3px;
      box-shadow: 0 2px 2px 0 rgba(0, 0, 0, 0.14), 0 1px 5px 0 rgba(0, 0, 0, 0.12), 0 3px 1px -2px rgba(0, 0, 0, 0.2);
      user-select: none;
      -webkit-tap-highlight-color: transparent;
    }

    :host(:hover) {
      background-color: var(--yad-primary-color-light);
    }

  </style>
  <yad-ripple self-click></yad-ripple>
  <slot></slot>
`;

class Component extends HTMLElement {
  
  constructor() {
    super();
    YAD.initYadElement(this);
    this.attachShadow({mode: 'open'});
    this.shadowRoot.appendChild(template.content.cloneNode(true));
    this.addEventListener('click', this.press.bind(this));
  }

  connectedCallback() {
    this._connectedCallbackHelper(); 
  }

  press() {
    this._sendToNR({payload: true});
  }
}

window.customElements.define('yad-button', Component);
