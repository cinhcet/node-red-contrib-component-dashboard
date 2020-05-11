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
import JustGage from 'justgage/justgage.js'; 

const template = document.createElement('template');
template.innerHTML = /*html*/`
  <style>
    :host {
      display: block;
      width: 100%;
    }
    .title {
      text-align: center;
      font-size: var(--yad-justgage-title-font-size, 16px);
      color: var(--yad-primary-text-color, black);
    }
    .gauge {
      margin-top: 3%;
    }
  </style>
  <div class="title"><slot></slot></div>
  <div id="gauge" class="gauge"></div>
`;


class Component extends HTMLElement {
  
  constructor() {
    super();
    YAD.initYadElement(this);
    this.attachShadow({mode: 'open'});
    this.shadowRoot.appendChild(template.content.cloneNode(true));
    this._options = {};
    this.gauge = null;
  }

  connectedCallback() {
    this._connectedCallbackHelper();
    if(!this.hasAttribute('options')) {
      this.renderGauge();
    }
  }

  disconnectedCallback() {
    this._disconnectedCallbackHelper();
  }

  renderGauge() {
    if(this.gauge) {
      this.gauge.destroy();
    }
    var defaultOptions = {
      parentNode: this.shadowRoot.getElementById('gauge'),
      showInnerShadow: true
    }
    var gaugeOptions = Object.assign(defaultOptions, this._options);
    this.gauge = new JustGage(gaugeOptions);
  }

  nodeRedMsg(msg) {
    if(msg.hasOwnProperty('payload')) {
      this.gauge.refresh(msg.payload);
    }
  }

  static get observedAttributes() {
    return ['options'];
  }

  attributeChangedCallback(attrName, oldValue, newValue) {
    if(attrName === 'options') {
      if(oldValue !== newValue) {
        this._options = JSON.parse(this.getAttribute('options'));
        this.renderGauge();
      }
    }
  }

  get options() {
    return this._options;
  }

  set options(opts) {
    this.setAttribute('options', JSON.stringify(opts));
  }

}

window.customElements.define('yad-justgage', Component);
