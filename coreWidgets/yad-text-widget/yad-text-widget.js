import YAD from 'node-red-contrib-component-dashboard/src/lib.js';

import { html } from '@polymer/polymer/lib/utils/html-tag.js';
import { PolymerElement } from '@polymer/polymer/polymer-element.js';

import '@polymer/paper-styles/color.js';


class YadTextWidget extends PolymerElement {
  static get template() {
    return html`
    <style>
      .container {
        display: flex;
        justify-content: space-between;
      }
      .label {
        font-family: 'Roboto', 'Noto', sans-serif;
        font-weight: bold;
        font-size: 16px;
        -webkit-font-smoothing: antialiased;
        color: var(--paper-indigo-500);
      }
    </style>
    <div class="container">
      <div class="label">
        <slot></slot>
      </div>
      <div>[[text]]</div>
    </div>
    `;
  }

  static get properties() {
    return {
      text: {
        type: String,
        value: ''
      }
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

  disconnectedCallback() {
    super.disconnectedCallback();
    this._disconnectedCallbackHelper();
  }

  nodeRedMsg(msg) {
    this.text = msg.payload;
  }
  nodeRedInitMsgOnConnect(msg) {
    this.text = msg.text;
  }
}

window.customElements.define('yad-text-widget', YadTextWidget);
