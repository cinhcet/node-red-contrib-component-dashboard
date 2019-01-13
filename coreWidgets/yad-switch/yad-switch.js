import '@polymer/paper-toggle-button/paper-toggle-button.js';
import { html } from '@polymer/polymer/lib/utils/html-tag.js';
import { PolymerElement } from '@polymer/polymer/polymer-element.js';

import YAD from 'node-red-contrib-component-dashboard/src/lib.js';

class YadSwitch extends PolymerElement {
  static get template() {
    return html`
    <style>
      .overlay-item {
        position: absolute;
        width: 100%;
        height: 100%;
        top: 0;
        left: 0;
        bottom: 0;
        right: 0;
        cursor: pointer;
      }
      .container {
        display: flex;
        justify-content: space-between;
        position: relative;
      }
      paper-toggle-button {
        --paper-toggle-button-checked-ink-color: var(--yad-primary-color, #0d47a1);
        --paper-toggle-button-checked-button-color: var(--yad-primary-color, #0d47a1);
        --paper-toggle-button-checked-bar-color: var(--yad-primary-color, #0d47a1);
      }
    </style>
    <div class="container">
      <slot></slot>
      <paper-toggle-button id="switch"></paper-toggle-button>
      <div class="overlay-item" id="switchClickArea"></div>
      <!-- <paper-ripple></paper-ripple> -->
    </div>
    `;
  }

  static get is() { return 'yad-switch'; }
  static get properties() {
    return {
      decouple: {
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

  ready() {
    super.ready();
    var swCA = this.$.switchClickArea;
    var sw = this.$.switch;
    swCA.addEventListener('click', function(e) {
      this._sendToNR({payload: !sw.checked});
      if(!this.decouple) {
        sw.checked = !sw.checked;
      }
    }.bind(this));
  }
  nodeRedMsg(msg) {
    if(msg.payload === true) {
      this.$.switch.checked = true;
    } else if(msg.payload === false) {
      this.$.switch.checked = false;
    }
  }
}
window.customElements.define(YadSwitch.is, YadSwitch);
