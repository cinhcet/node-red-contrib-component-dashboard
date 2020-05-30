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
      display: block;
      height: 20px;
      width: 36px;
      vertical-align: middle;
      box-sizing: border-box;
      position: relative;
      text-decoration: none;
      cursor: pointer;
      -webkit-tap-highlight-color: transparent;
      /* user-select: none; */
    }
    #bar {
      position: absolute;
      top: 3px;
      width: 36px;
      height: 14px;
      border-radius: 8px;
      opacity: 0.4;
      background-color: #000000;
      transition: background-color linear 0.2s;
    }
    #bar.active {
      background-color: var(--yad-primary-color);
    }
    #button {
      position: absolute;
      height: 20px;
      width: 20px;
      border-radius: 50%;
      box-shadow: 0 1px 5px 0 rgba(0, 0, 0, 0.7);
      background-color: white;
      transition: transform linear .2s, background-color linear .2s;
    }
    #button.active {
      background-color: var(--yad-primary-color);
      transform: translate(16px, 0);
    }
  </style>
  <div id="bar"></div>
  <div id="button"></div>
`;

class Component extends HTMLElement {
  
  constructor() {
    super();
    YAD.initYadElement(this);
    this.attachShadow({mode: 'open'});
    this.shadowRoot.appendChild(template.content.cloneNode(true));
    this._clickListener = this.press.bind(this);
    this.addEventListener('click', this._clickListener);
    this._state = false;
    this._rippleElement = null;
    this._coupled = false;
    this._noClick = false;
  }

  connectedCallback() {
    this._connectedCallbackHelper();
    if(!this._rippleElement && !this.noRipple) {
      this.createRippleElement();
    } 
  }

  static get observedAttributes() {
    return ['checked', 'no-ripple', 'coupled', 'no-click'];
  }

  attributeChangedCallback(attrName, oldValue, newValue) {
    if(oldValue === newValue) return;
    var b = newValue !== null;
    if(attrName === 'checked') {
      this.changeState(b);
    } else if(attrName === 'no-ripple') {
      if(b) {
        this.removeRippleElement();
      } else {
        if(this._rippleElement === null) {
          this.createRippleElement();
        }
      }
    } else if(attrName === 'coupled') {
      this._coupled = b;
    } else if(attrName === 'no-click') {
      this._noClick = b;
      if(b) {
        this.style.cursor = 'default';
        this.removeEventListener('click', this._clickListener);
        this.setAttribute('no-ripple', '');
      } else {
        this.style.cursor = 'pointer';
        this.addEventListener('click', this._clickListener);
        this.removeAttribute('no-ripple');
      }
    }
  }

  get checked() { return this._state; }
  set checked(b) { b ? this.setAttribute('checked', '') : this.removeAttribute('checked'); }

  get noRipple() { return this.hasAttribute('no-ripple'); }
  set noRipple(b) { b ? this.setAttribute('no-ripple', '') : this.removeAttribute('no-ripple'); }
  
  get coupled() { return this._coupled; }
  set coupled(b) { b ? this.setAttribute('coupled', '') : this.removeAttribute('coupled'); }

  get noClick() { return this._noClick; }
  set noClick(b) { b ? this.setAttribute('no-click', '') : this.removeAttribute('no-click'); }

  createRippleElement() {
    this._rippleElement = document.createElement('yad-ripple');
    this.shadowRoot.getElementById('button').appendChild(this._rippleElement);
    this._rippleElement.setAttribute('unbounded-ripple', '');
  }

  removeRippleElement() {
    if(this._rippleElement) {
      this._rippleElement.remove();
      this._rippleElement = null;
    }
  }

  changeState(state) {
    this._state = state;
    if(state) {
      this.shadowRoot.getElementById('button').classList.add('active');
      this.shadowRoot.getElementById('bar').classList.add('active');
    } else {
      this.shadowRoot.getElementById('button').classList.remove('active');
      this.shadowRoot.getElementById('bar').classList.remove('active');
    }
  }

  press() {
    if(this._rippleElement) this._rippleElement.ripple();
    var msg = {payload: !this._state};
    this._sendToNR(msg);
    if(this._coupled) {
      this.checked = !this._state;
    }
  }

  nodeRedMsg(msg) {
    this.checked = (msg.payload === true);
  }
}

window.customElements.define('yad-switch', Component);

/* <><> */
