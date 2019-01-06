import '@polymer/paper-icon-button/paper-icon-button.js';
import '@polymer/paper-styles/color.js';
import '@polymer/iron-icons/iron-icons.js';
import '@polymer/iron-icons/av-icons.js';
import { html } from '@polymer/polymer/lib/utils/html-tag.js';
import { PolymerElement } from '@polymer/polymer/polymer-element.js';

import YAD from 'node-red-contrib-component-dashboard/src/lib.js'

class YadPaperIconButton extends PolymerElement {
  static get template() {
    return html`
    <style>
    </style>
    <paper-icon-button icon="[[icon]]" style\$="color:[[iconColor]];" on-click="press"></paper-icon-button>
    `;
  }

  static get is() { return 'yad-paper-icon-button'; }
  static get properties() {
    return {
      icon: {
        type: String,
        value: 'menu'
      },
      iconColor: {
        type: String,
        value: 'black'
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

  nodeRedMsg(msg) {}
  press() {
    this._sendToNR({payload:true});
  }
}
window.customElements.define(YadPaperIconButton.is, YadPaperIconButton);
