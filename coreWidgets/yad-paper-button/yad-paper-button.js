import '@polymer/paper-button/paper-button.js';
import '@polymer/paper-styles/color.js';
import { html } from '@polymer/polymer/lib/utils/html-tag.js';
import { PolymerElement } from '@polymer/polymer/polymer-element.js';

import YAD from 'node-red-contrib-component-dashboard/src/lib.js';

class YadPaperButtonElement extends PolymerElement {
  static get template() {
    return html`
    <style>
      paper-button {
        font-family: 'Roboto', 'Noto', sans-serif;
        font-weight: normal;
        font-size: 14px;
        -webkit-font-smoothing: antialiased;
      }
      paper-button.indigo {
        background-color: var(--paper-indigo-500);
        color: white;
      }
      paper-button.indigo:hover {
        background-color: var(--paper-indigo-400);
      }
    </style>
    <paper-button raised="" class="indigo" on-click="press"><slot></slot></paper-button>
    `;
  }

  static get is() { return 'yad-paper-button'; }
  static get properties() {
    return {};
  }
  constructor() {
    super();
    YAD.initYadElement(this);
  }

  connectedCallback() {
    super.connectedCallback();
    this._connectedCallbackHelper();
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    this._disconnectedCallbackHelper();
  }

  nodeRedMsg(msg) {}

  press() {
    var msg = {payload: true};
    this._sendToNR(msg);
  }
}
window.customElements.define(YadPaperButtonElement.is, YadPaperButtonElement);
