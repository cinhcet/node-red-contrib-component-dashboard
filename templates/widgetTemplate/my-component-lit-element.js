import YAD from 'node-red-contrib-component-dashboard/src/lib.js';
import { LitElement, html, css } from 'lit-element';

class Component extends LitElement {

  static get styles() {
    return css`
      
    `;
  }

  render() {
    return html`
          
    `;
  }

  static get properties() {
    return {
       
    };
  }

  constructor() {
    super();
    YAD.initYadElement(this);
  }

  connectedCallback() {
    super.connectedCallback();
    this._connectedCallbackHelper();
  }

  nodeRedMsg(msg) {
    // this is called when the correspondning node gets a message as input
  }
}

window.customElements.define('my-component', Component);

//use this._sendToNR(msg); to send message to Node-RED