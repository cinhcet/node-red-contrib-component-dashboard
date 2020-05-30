import YAD from 'node-red-contrib-component-dashboard/src/lib.js';

const template = document.createElement('template');
template.innerHTML = /*html*/`
  <style>
  </style>
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
    // this is called when the correspondning node gets a message as input
  }
  
}

window.customElements.define('my-component', Component);

//use this._sendToNR(msg); to send message to Node-RED