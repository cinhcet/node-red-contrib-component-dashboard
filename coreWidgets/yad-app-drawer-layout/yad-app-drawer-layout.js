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
import { LitElement, html, css } from 'lit-element';
import 'yad-icons/components/yad-icon-mdi-menu.js';

function headerTemplate(pageNames) {
  return html`
    ${pageNames.map((pageName) => html`
      <div id="${pageName}__header" class="headerItem">
        <slot name="${pageName}__header"></slot>
      </div>
    `)}
  `;
}

function sidebarTemplate(pageNames) {
  return html`
    ${pageNames.map((pageName) => html`
      <div id="${pageName}__menu" class="sidebarItem" @click="${function(e) { this.selectPage(pageName); }}">
        <slot name="${pageName}__menu"></slot>
      </div>
    `)}
  `;
}

function contentTemplate(pageNames) {
  return html`
    ${pageNames.map((pageName) => html`
      <div id="${pageName}__content" class="contentItem">
        <slot name="${pageName}"></slot>
      </div>
    `)}
  `;
}

class Component extends LitElement {

  static get styles() {
    return css`
      :host {
        display: flex;
        flex-direction: column;
        width: 100%;
        height: 100%;
        overflow: hidden;
        -webkit-tap-highlight-color: transparent;
      }
      #header {
        display: flex;
        min-height: 40px;
        max-height: 40px;
        background-color: var(--yad-primary-color);
        color: var(--yad-primary-ontext-color);
        font-size: 18px;
        transition: height 0.5s;
        align-items: center;
      }
      .headerItem {
        display: none;
      }
      .headerItem.active {
        display: block;
      }
      #wrapper {
        flex-grow: 1;
        display: flex;
        overflow-y: auto;
      }
      #sidebar {
        position: static;
        width: 250px;
        transition: all 0.5s;
        overflow: hidden;
        flex-shrink: 0;
        background-color: white;
      }
      #sidebar.hidden {
        margin-left: -250px;
      }
      @media (max-width: 70em) { 
        #sidebar {
          margin-left: -250px;
          position:fixed;
          z-index: 1;
          height: 100%;
        }
      }
      .sidebarItem {
        background-color: white;
        padding: 12px 12px;
        cursor: pointer;
      }
      .sidebarItem:hover {
        background-color: var(--yad-item-hover-dark);
      }
      .sidebarItem.active {
        font-weight: bold;
        background-color: var(--yad-item-selected);
      }
      #content {
        flex-grow: 1;
        overflow-y: auto;
      }
      .contentItem {
        display: none;
        overflow-y: auto;
        overflow-x: hidden;
        height: 100%;
      }
      .contentItem.active {
        display: block;
      }
      .menuItem {
        fill: white;
        width: 24px;
        height: 24px;
        display: block;
        margin-left: 10px;
        margin-right: 10px;
        cursor: pointer;
      }
    `;
  }

  render() {
    return html`
      <div id="header">
        <yad-icon-mdi-menu class="menuItem" @click="${this.menuClick}"></yad-icon-mdi-menu>
        ${headerTemplate(this.pageNames)}
      </div>
      <div id="wrapper">
        <div id="sidebar">
          ${sidebarTemplate(this.pageNames)}
        </div>
        <div id="content">
          ${contentTemplate(this.pageNames)}
        </div>  
      </div>    
    `;
  }

  static get properties() {
    return {
      pageNames: { type: Array },
      initialPage: { type: Number } 
    };
  }

  selectPage(pageName) {
    if(this.mq.matches) {
      this.shadowRoot.getElementById('sidebar').style.marginLeft = '-250px';
      this.shadowRoot.getElementById('sidebar').style.width = '250px';
    }
    this.makePageInactive(this.currentPage);
    this.makePageActive(pageName);
    this.currentPage = pageName;
    this.notifyPageChange();
  }

  makePageActive(pageName) {
    this.shadowRoot.getElementById(pageName + '__menu').classList.add('active');
    this.shadowRoot.getElementById(pageName + '__header').classList.add('active');
    this.shadowRoot.getElementById(pageName + '__content').classList.add('active');
  }

  makePageInactive(pageName) {
    this.shadowRoot.getElementById(pageName + '__menu').classList.remove('active');
    this.shadowRoot.getElementById(pageName + '__header').classList.remove('active');
    this.shadowRoot.getElementById(pageName + '__content').classList.remove('active');
  }
  
  menuClick() {
    var sidebar = this.shadowRoot.getElementById('sidebar');
    if(getComputedStyle(sidebar).getPropertyValue('margin-left') === '0px') { //is open -- close it
      sidebar.style.marginLeft = '-250px';
      sidebar.style.width = '250px';
    } else { // is closed -- open it
      if(this.mq.matches) { // narrow
        sidebar.style.marginLeft = '0px';
        sidebar.style.width = '100vw';
      } else {
        sidebar.style.removeProperty('margin-left');
      }
    }
  }

  firstUpdated() {
    this.currentPage = this.pageNames[this.initialPage];
    this.makePageActive(this.currentPage);
  }

  notifyPageChange() {
    this.dispatchEvent(new CustomEvent('page-changed', {detail: this.currentPage}));
    var msg = {payload: this.currentPage, topic: 'pageChanged'};
    this._sendToNR(msg);
  }

  constructor() {
    super();
    YAD.initYadElement(this);
    this.pageNames = [];
    this.currentPage = null;
    this.initialPage = 0;
  }

  connectedCallback() {
    super.connectedCallback()
    this._connectedCallbackHelper();
    this.mq = window.matchMedia('(max-width: 70em)');
  }

  disconnectedCallback() {
    super.disconnectedCallback()
    this._disconnectedCallbackHelper();
  }

}

window.customElements.define('yad-app-drawer-layout', Component);
