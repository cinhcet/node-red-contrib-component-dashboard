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

const template = document.createElement('template');
template.innerHTML = /*html*/`
  <style>
    :host {
      position: absolute;
      width: 100%;
      height: 100%;
      top: 0;
      left: 0;
      bottom: 0;
      right: 0;
      overflow: hidden;
      display: none;
      -webkit-tap-highlight-color: transparent;
    }
    .ripple {
      position: absolute;
      border-radius: 50%;
      background-color: var(--yad-ripple-color, rgba(200, 200, 200, 0.8));
      width: 40px;
      height: 40px;
      margin-top: -20px;
      margin-left: -20px;
      opacity: 0;
      animation-duration: 0.5s;
    }
    @keyframes ripple {
      0% {
        opacity: 1;
        transform: scale(0);
      }
      100% {
        opacity: 0;
        transform: scale(10);
      }
    }
    @keyframes rippleUnbounded {
      0% {
        opacity: 1;
        transform: scale(0);
      }
      50% {
        opacity: 0.3;
        transform: scale(1);
      }
      100% {
        opacity: 0;
        transform: scale(1);
      }
    }
  </style>
`;


class Component extends HTMLElement {
  
  constructor() {
    super();
    this.attachShadow({mode: 'open'});
    this.shadowRoot.appendChild(template.content.cloneNode(true));
    this.setOfRippels = new Set();
    this._selfClick = false; 
    this._unboundedRipple = false;
    this.bindListener = this.ripple.bind(this);
  }

  get selfClick() {
    return this._selfClick;
  }

  set selfClick(b) {
    if(b) {
      this.setAttribute('self-click', '');
    } else {
      this.removeAttribute('self-click');
    }
  }

  get unboundedRipple() {
    return this._unboundedRipple;
  }

  set unboundedRipple(b) {
    if(b) {
      this.setAttribute('unbounded-ripple', '');
    } else {
      this.removeAttribute('unbounded-ripple');
    }
  }

  static get observedAttributes() {
    return ['self-click', 'unbounded-ripple'];
  }

  attributeChangedCallback(attrName, oldValue, newValue) {
    var b = newValue !== null;
    if(attrName === 'self-click') {
      if(this._selfClick != b) {
        this._selfClick = b;
        if(b) {
          this.style.display = 'block';
          this.addEventListener('click', this.bindListener); 
        } else {
          this.style.display = 'none';
          this.removeEventListener('click', this.bindListener); 
        }
      }
    } else if(attrName === 'unbounded-ripple') {
      this._unboundedRipple = b;
      if(b) {
        this.style.overflow = 'visible';
      } else {
        this.style.overflow = 'hidden';
      }
    }
  }
  
  ripple(e) {
    var s = document.createElement('span');
    
    if(!this._selfClick) {
      this.style.display = 'block';
      this.setOfRippels.add(s);
    }

    var rect = this.getBoundingClientRect();
    var x, y;
    if(e && !this._unboundedRipple) {
      x = e.x - rect.left;
      y = e.y - rect.top;
    } else {
      x = rect.width/2;
      y = rect.height/2;
    }
    
    this.shadowRoot.appendChild(s);
    s.style.left = x + 'px';
    s.style.top = y + 'px';
    s.className = 'ripple';
    if(this._unboundedRipple) {
      s.style.animationName = 'rippleUnbounded';
    } else {
      s.style.animationName = 'ripple';
    }
    
    setTimeout(function() {
      s.remove();
      if(!this._selfClick) {
        this.setOfRippels.delete(s);
        this.checkSetOfRippels();  
      }
    }.bind(this), 500);
  }

  checkSetOfRippels() {
    if(this.setOfRippels.size == 0) {
      this.style.display = 'none';
    }
  }
}

window.customElements.define('yad-ripple', Component);
