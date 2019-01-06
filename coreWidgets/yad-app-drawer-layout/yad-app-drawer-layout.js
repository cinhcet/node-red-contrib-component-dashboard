import '@polymer/iron-flex-layout/iron-flex-layout-classes.js';
import '@polymer/app-layout/app-layout.js';
import '@polymer/paper-tabs/paper-tabs.js';
import '@polymer/app-route/app-route.js';
import '@polymer/app-route/app-location.js';
import '@polymer/iron-pages/iron-pages.js';
import '@polymer/paper-item/all-imports.js';
import '@polymer/paper-listbox/paper-listbox.js';
import { html } from '@polymer/polymer/lib/utils/html-tag.js';
import { PolymerElement } from '@polymer/polymer/polymer-element.js';

import YAD from 'node-red-contrib-component-dashboard/src/lib.js'

class YadAppDrawerLayout extends PolymerElement {
  static get template() {
    return html`
    <style include="iron-flex iron-flex-alignment">
      app-header {
        background-color: var(--paper-blue-900);
        color: #fff;
      }

      app-drawer-layout {
        --app-drawer-layout-content-transition: margin 0.2s;
      }

      app-drawer {
        /*
        --app-drawer-content-container: {
          background-color: #eee;
        }*/
      }

      app-toolbar {
        height: 54px;
      }

      .drawer-paper-listbox {
        --paper-item-selected: {
          /*color: var(--paper-blue-900);*/
          background-color: var(--paper-blue-100);
        };
        --paper-item-focused-before: {
          background-color: transparent;
        };
      }
      .drawer-paper-item:hover {
        background-color: var(--paper-indigo-200);
      }

      .drawer-content {
        margin-top: 46px;
        height: calc(100% - 46px);
        overflow: auto;
      }

      .overlay-item {
        position: absolute;
        width: 100%;
        height: 100%;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        cursor: pointer;
      }
    </style>

    <app-location use-hash-as-path="" route="{{route}}"></app-location>
    <app-route route="{{route}}" pattern="/:page" data="{{pageRoute}}"></app-route>

    <app-header-layout fullbleed="">

      <app-header slot="header" id="header" reveals="">
        <app-toolbar>
          <paper-icon-button icon="menu" on-click="drawerClick"></paper-icon-button>
          <div main-title>
            <iron-pages selected="[[pageRoute.page]]" attr-for-selected="page">
              <template is="dom-repeat" items="[[pageNames]]">
                <div page="[[item]]">
                  <slot name="[[computeHeaderTitleName(item)]]">
                  </slot>
                </div>
              </template>
            </iron-pages>
          </div>
        </app-toolbar>
      </app-header>

      <app-drawer-layout id="drawerLayout" on-narrow-changed="appDrawerNarrowChanged">
        <app-drawer id="drawer" slot="drawer">
          <div class="drawer-content">
            <paper-listbox id="drawerList" class="drawer-paper-listbox" selected="[[pageRoute.page]]" attr-for-selected="page" on-selected-changed="drawerSelected" fallback-selection="[[computeFallback()]]">
              <template is="dom-repeat" items="[[pageNames]]">
                <paper-item class="drawer-paper-item" page="[[item]]">
                  <slot name="[[computeMenuName(item)]]">
                  </slot>
                  <div class="overlay-item">
                  </div>
                </paper-item>
              </template>
            </paper-listbox>
          </div>
        </app-drawer>

        <iron-pages selected="[[pageRoute.page]]" attr-for-selected="page">
          <template is="dom-repeat" items="[[pageNames]]">
            <div page="[[item]]">
              <slot name="[[item]]">
              </slot>
            </div>
          </template>
        </iron-pages>

      </app-drawer-layout>
    </app-header-layout>
    `;
  }

  static get is() { return 'yad-app-drawer-layout'; }
  static get properties() {
    return {
      pageNames: {
        type: Array
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

  computeMenuName(item) {
    return item + '__menu';
  }
  computeHeaderTitleName(item) {
    return item + '__headerTitle';
  }

  computeFallback() {
    return this.pageNames[0];
  }

  /*
  setHeaderTitle() {
    var slot = this.shadowRoot.querySelector('slot[name=' + this.computeHeaderTitleName(this.$.drawerList.selected) + ']');
    var nodes = slot.assignedNodes();
    this.$.headerTitle.innerHTML = nodes[0].innerHTML;
  }
  */

  drawerClick(e) {
    var drawerLayout = this.$.drawerLayout;
    if(drawerLayout.forceNarrow || !drawerLayout.narrow) {
      drawerLayout.forceNarrow = !drawerLayout.forceNarrow;
    } else {
      drawerLayout.drawer.toggle();
    }
  }
  drawerSelected(e) {
    var drawerLayout = this.$.drawerLayout;
    location.hash = '/' + this.$.drawerList.selected;
    if(!(drawerLayout.forceNarrow || !drawerLayout.narrow)) {
      drawerLayout.drawer.close();
    }
  }
  appDrawerNarrowChanged(e) {
    var drawerLayout = this.$.drawerLayout;
    this.$.header.fixed = (drawerLayout.forceNarrow || !drawerLayout.narrow);
  }
  nodeRedMsg(msg) {
  }
}
window.customElements.define(YadAppDrawerLayout.is, YadAppDrawerLayout);

/* <> */
