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
      display: block;
      height: 20px;
      width: 100%;
      vertical-align: middle;
      box-sizing: border-box;
      position: relative;
      text-decoration: none;
      cursor: pointer;
      -webkit-tap-highlight-color: transparent;
      /* user-select: none; */
    }
    #wrapper {
      position: relative;
      margin: 0 10px;
    }
    #bar {
      box-sizing: border-box;
      position: relative;
      top: 6px;
      height: 8px;
      margin: 0 -4px;
      border-radius: 4px;
      background-color: var(--yad-slider-bar-color, rgb(180, 180, 180));
    }
    #barValue {
      box-sizing: border-box;
      position: absolute;
      top: 6px;
      width: 0;
      height: 8px;
      margin: 0 -4px;
      border-radius: 4px;
      background-color: var(--yad-primary-color-light);
    }
    #button {
      position: absolute;
      height: 20px;
      width: 20px;
      margin-left: -10px;
      top: 0px;
      left: 0px;
      border-radius: 50%;
      box-shadow: 0 1px 5px 0 rgba(0, 0, 0, 0.7);
      background-color: var(--yad-primary-color);
    }
    .tooltip {
      box-sizing: border-box;
      position: absolute;
      background-color: white;
      top: 10px;
      left: 10px;
      width: 0;
      height: 0;
      opacity: 0;
      border-radius: 50%;
      transition: all 0.2s ease-in-out;
      overflow: hidden;
      border: solid;
      border-size: 4px;
      border-color: var(--yad-primary-color);
      box-shadow: 0 1px 5px 0 rgba(0, 0, 0, 0.7);
      display: flex;
      justify-content: center;
      align-items: center;
    }
    .active {
      top: -25px;
      width: 40px;
      height: 40px;
      left: 50%;
      margin-left: -20px;
      margin-top: -20px;
      opacity: 1;
    }
    #tooltipText {

    }
  </style>
  <div id="wrapper">
    <div id="bar"></div>
    <div id="barValue"></div>
    <div id="button">
      <div id="tooltip" class="tooltip"><span id="tooltipText"></span></div>
    </div>
  </div>
`;

class Component extends HTMLElement {
  
  constructor() {
    super();
    YAD.initYadElement(this);
    this.attachShadow({mode: 'open'});
    this.shadowRoot.appendChild(template.content.cloneNode(true));

    this.addEventListener('mousedown', this.mouseDownListener.bind(this));
    this.addEventListener('touchstart', this.mouseDownListener.bind(this));
    this._mouseMoveListener = this.mouseMoveListener.bind(this);
    this._mouseUpListener = this.mouseUpListener.bind(this);
    this._wrapper = this.shadowRoot.getElementById('wrapper');
    this._button = this.shadowRoot.getElementById('button');
    this._barValue = this.shadowRoot.getElementById('barValue');
    this._tooltip = this.shadowRoot.getElementById('tooltip');
    this._tooltipText = this.shadowRoot.getElementById('tooltipText');

    this._isDragging = false;

    this._min = 0;
    this._max =  100;
    this._step = 1;

    this._value = this._min;
    
    this._nocont = false;

    this._tooltipTimeout = null;
    this._timePressed = 0;
  }

  connectedCallback() {
    this._connectedCallbackHelper();
    if(!this.hasAttribute('min')) this.setAttribute('min', this._min);
    if(!this.hasAttribute('max')) this.setAttribute('max', this._max);
    if(!this.hasAttribute('step')) this.setAttribute('step', this._step);
    if(!this.hasAttribute('value')) this.setAttribute('value', this._value);
    // this.moveSliderToValue();
  }

  static get observedAttributes() {
    return ['min', 'max', 'step', 'value', 'no-cont'];
  }

  attributeChangedCallback(attrName, oldValue, newValue) {
    if(oldValue === newValue) return;
    if(attrName === 'value') {
      let n = Number(newValue);
      if(this._value != n) {
        this.value = n;
      }
    } else if(attrName === 'min') {
      this._min = Number(newValue);
      this.moveSliderToValue();
    } else if(attrName === 'max') {
      this._max = Number(newValue);
      this.moveSliderToValue();
    } else if(attrName === 'step') {
      this._step = Number(newValue);
      this.setValue(this._value);
      this.moveSliderToValue();
    } else if(attrName === 'no-cont') {
      this._nocont = newValue !== null;
    }
  }

  get min() { return this._min; }
  set min(x) { this.setAttribute('min', x); }
  get max() { return this._max; }
  set max(x) { this.setAttribute('max', x); }
  get step() { return this._step; }
  set step(x) { this.setAttribute('step', x); }
  get nocont() { return this._nocont; }
  set nocont(b) { b ? this.setAttribute('nocont', '') : this.removeAttribute('nocont'); }

  get value() { return this._value; } 
  set value(x) {
    if(!this._isDragging) {
      this.updateValue(x, false);
    }
  }
  
  setValue(x) {
    this._value = this._min + Math.round((x - this._min) / this._step)*this._step;
    if(x == this._max) this._value = this._max;

    if((this._value > this._max && this._max >= this._min) || (this._value < this._max && this._max < this._min)) {
      this._value = this._max;
    } else if((this._value < this._min && this._max >= this._min) || (this._value > this._min && this._max < this._min)) {
      this._value = this._min;
    }
  }

  updateValue(value, send) {
    let oldValue = this._value;
    this.setValue(value);
    if(oldValue != this._value) { 
      this.moveSliderToValue();
      this.setAttribute('value', this._value);
      if(send) this._sendToNR({payload: this._value});
    }
  }

  mouseDownListener(e) {  
    clearTimeout(this._tooltipTimeout);
    this._timePressed = new Date();
    this.setPosition(e);
    window.addEventListener('mousemove', this._mouseMoveListener);
    window.addEventListener('touchmove', this._mouseMoveListener);
    window.addEventListener('mouseup', this._mouseUpListener);
    window.addEventListener('touchend', this._mouseUpListener);
    this._tooltip.classList.add('active');
    this._isDragging = true;
  }
  mouseUpListener() {
    this._isDragging = false;
    window.removeEventListener('mousemove', this._mouseMoveListener);
    window.removeEventListener('touchmove', this._mouseMoveListener);
    window.removeEventListener('mouseup', this._mouseUpListener);
    window.removeEventListener('touchend', this._mouseUpListener);
    this._sendToNR({payload: this._value, finished: true});
    
    if(new Date() - this._timePressed < 200) {
      this._tooltipTimeout = setTimeout(function() {
        this._tooltip.classList.remove('active');
      }.bind(this), 800);
    } else {
      this._tooltip.classList.remove('active');
    }
    
  }
  mouseMoveListener(e) {
    if(this._isDragging) {
      this.setPosition(e);
    }
  }

  setPosition(e) {
    e.preventDefault();

    let rect = this._wrapper.getBoundingClientRect();
    let x;
    if(e.touches) {
      x = e.touches[0].clientX;
    } else {
      x = e.x;
    }
    let xAbs = x - rect.left;
    if(xAbs > rect.width) xAbs = rect.width;
    if(xAbs < 0) xAbs = 0;
    let xRel = xAbs/rect.width;
    let value = (this._max - this._min)*xRel + this._min;
    this.updateValue(value, !this._nocont);
  }

  moveSliderToValue() {
    let xRel = (this._value - this._min)/(this._max - this._min);
    this._button.style.left = xRel*100 + '%';
    this._barValue.style.width = xRel*100 + '%';
    this._tooltipText.innerHTML = this._value;
  }

  nodeRedMsg(msg) {
    if(msg.hasOwnProperty('payload') && !this._isDragging) {
      let value = Number(msg.payload);
      this.updateValue(value, false);
    }
  }
}

window.customElements.define('yad-slider', Component);

/* <><> */
