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
      /*vertical-align: middle;*/
      width: 100%;
      box-sizing: border-box;
      position: relative;
      text-decoration: none;
      cursor: pointer;
      -webkit-tap-highlight-color: transparent;
      /* user-select: none; */
    }
    #on:not(.plain) {
      display: block;
      transition: all .35s ease-in-out;
      position: absolute;
      left: 0;
      top: 0;
      right: 0;
      bottom: 0;
    }
    #off:not(.plain) {
      display: block;
      transition: all .35s ease-in-out;
      position: relative;
    }
    #on:not(.plain):not(.active), #off:not(.plain):not(.active) {
      opacity: 0;
    }
    #on.plain, #off.plain {
      display: block;
    }
    #on.plain:not(.active), #off.plain:not(.active) {
      display: none;
    }
  </style>
  <slot name="on" id="on"></slot>
  <slot id="off" class="active"></slot>
`;

class Component extends HTMLElement {
  
  constructor() {
    super();
    YAD.initYadElement(this);
    this.attachShadow({mode: 'open'});
    this.shadowRoot.appendChild(template.content.cloneNode(true));
    this._clickListener = this.press.bind(this);
    this.addEventListener('click', this._clickListener);
    this.onSlot = this.shadowRoot.getElementById('on');
    this.offSlot = this.shadowRoot.getElementById('off');
    this._state = false;
    this._rippleElement = null;
    this._coupled = false;
    this._noClick = false;
    this._oneWay = 0;
  }

  connectedCallback() {
    this._connectedCallbackHelper();
    if(!this.noRipple) {
      this.createRippleElement(!this.containedRipple);
    } 
  }

  disconnectedCallback() {
    this._disconnectedCallbackHelper();
  }

  static get observedAttributes() {
    return ['checked', 'no-ripple', 'contained-ripple', 'no-animation', 'coupled', 'no-click', 'one-way'];
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
          this.createRippleElement(true);
        }
      }
    } else if(attrName === 'contained-ripple') {
      if(b) {
        if(this._rippleElement === null) {
          this.createRippleElement(false);
        } else {
          this._rippleElement.removeAttribute('unbounded-ripple');
        }
      } else {
        this.removeRippleElement();
      }
    } else if(attrName === 'no-animation') {
      if(b) {
        this.shadowRoot.getElementById('on').classList.add('plain');
        this.shadowRoot.getElementById('off').classList.add('plain');
      } else {
        this.shadowRoot.getElementById('on').classList.remove('plain');
        this.shadowRoot.getElementById('off').classList.remove('plain');
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
    } else if(attrName === 'one-way') {
      if(newValue === null) {
        this._oneWay = 0;
      } else if(newValue === 'on') {
        this._oneWay = 1;
      } else if(newValue === 'off') {
        this._oneWay = 2;
      }
    }
  }

  get checked() { return this._state; }
  set checked(b) { b ? this.setAttribute('checked', '') : this.removeAttribute('checked'); }

  get noRipple() { return this.hasAttribute('no-ripple'); }
  set noRipple(b) { b ? this.setAttribute('no-ripple', '') : this.removeAttribute('no-ripple'); }
  
  get containedRipple() { return this.hasAttribute('contained-ripple'); }
  set containedRipple(b) { b ? this.setAttribute('contained-ripple', '') : this.removeAttribute('contained-ripple'); }

  get noAnimation() { return this.hasAttribute('no-animation'); }
  set noAnimation(b) { b ? this.setAttribute('no-animation', '') : this.removeAttribute('no-animation'); }

  get coupled() { return this._coupled; }
  set coupled(b) { b ? this.setAttribute('coupled', '') : this.removeAttribute('coupled'); }

  get noClick() { return this._noClick; }
  set noClick(b) { b ? this.setAttribute('no-click', '') : this.removeAttribute('no-click'); }

  get oneWay() { return this._oneWay; }
  set oneWay(x) {
    if(x === null) {
      this.removeAttribute('one-way');
    } else {
      this.setAttribute('one-way', x);
    }
  }

  createRippleElement(unbounded) {
    this._rippleElement = document.createElement('yad-ripple');
    this.shadowRoot.appendChild(this._rippleElement);
    this._rippleElement.setAttribute('self-click', '');
    if(unbounded) this._rippleElement.setAttribute('unbounded-ripple', '');
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
      this.onSlot.classList.add('active');
      this.offSlot.classList.remove('active');
    } else {
      this.offSlot.classList.add('active');
      this.onSlot.classList.remove('active');
    }
  }

  press() {
    let newState;
    if(this._oneWay == 0) {
      newState = !this._state;
    } else {
      newState = this._oneWay == 1;
    }
    var msg = {payload: newState};
    this._sendToNR(msg);
    if(this._coupled) {
      this.checked = newState;
    }
  }

  nodeRedMsg(msg) {
    this.checked = (msg.payload === true);
  }
}

window.customElements.define('yad-toggle', Component);