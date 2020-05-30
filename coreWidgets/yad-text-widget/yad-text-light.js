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

class Component extends HTMLElement {
  
  constructor() {
    super();
    YAD.initYadElement(this);
  }

  connectedCallback() {
    this._connectedCallbackHelper(); 
  }

  nodeRedMsg(msg) {
    if(msg.hasOwnProperty('payload')) {
      this.innerHTML = msg.payload;
    }
  }
}

window.customElements.define('yad-text-light', Component);
