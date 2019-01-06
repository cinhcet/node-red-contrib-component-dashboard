import '@polymer/paper-icon-button/paper-icon-button.js';
import '@polymer/paper-styles/color.js';
import '@polymer/iron-icons/iron-icons.js';
import '@polymer/iron-icons/av-icons.js';
import { html } from '@polymer/polymer/lib/utils/html-tag.js';
import { PolymerElement } from '@polymer/polymer/polymer-element.js';

import YAD from 'node-red-contrib-component-dashboard/src/lib.js'

class YadToggleIconButton extends PolymerElement {
  static get template() {
    return html`
    <style>
    </style>
    <paper-icon-button icon="[[icon]]" style\$="color:[[iconColor]];" on-click="press"></paper-icon-button>
    `;
  }

  static get is() { return 'yad-toggle-icon-button'; }
  static get properties() {
    return {
      icon: {
        type: String,
        computed: 'computeIcon(state)'
      },
      iconOn: {
        type: String,
        value: 'av:play-arrow'
      },
      iconOff: {
        type: String,
        value: 'av:pause'
      },
      iconColor: {
        type: String,
        computed: 'computeColor(state)'
      },
      iconColorOn: {
        type: String,
        value: 'black'
      },
      iconColorOff: {
        type: String,
        value: 'black'
      },
      state: {
        type: Boolean,
        value: false
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

  computeIcon(state) {
    if(state) {
      return this.iconOn;
    } else {
      return this.iconOff;
    }
  }
  computeColor(state) {
    if(state) {
      return this.iconColorOn;
    } else {
      return this.iconColorOff;
    }
  }
  nodeRedMsg(msg) {
    if(msg.payload === true) {
      this.state = true;
    } else if(msg.payload === false) {
      this.state = false;
    }
  }
  nodeRedInitMsgOnConnect(msg) {
    if(msg.iconOn) this.iconOn = msg.iconOn;
    if(msg.iconOff) this.iconOff = msg.iconOff;
    if(msg.iconColorOn) this.iconColorOn = msg.iconColorOn;
    if(msg.iconColorOff) this.iconColorOff = msg.iconColorOff;
  }
  press() {
    this._sendToNR({payload: !this.state});
  }
}
window.customElements.define(YadToggleIconButton.is, YadToggleIconButton);
