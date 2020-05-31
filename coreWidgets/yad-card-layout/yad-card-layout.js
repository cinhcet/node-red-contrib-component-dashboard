const template = document.createElement('template');
template.innerHTML = /*html*/`
  <style>
    :host {
      display: flex;
      justify-content: center;
      align-items: flex-start;
    }
    .column {
      min-width: 380px;
      max-width: 480px;
      flex-grow: 1;
      /* margin-right: 3px; */
      /* margin-left: 3px; */
      flex-basis: var(--yad-card-layout-column-flex-basis, auto);
    }
  </style>
  <slot style="display: none;"></slot>
`;

class Component extends HTMLElement {
  
  constructor() {
    super();
    this.attachShadow({mode: 'open'});
    this.shadowRoot.appendChild(template.content.cloneNode(true));
    this._timer = null;
    this.numberOfColumns = 0;
    this.columns = [];

    let slot = this.shadowRoot.querySelector('slot');
    let slotChangeCallback = function() {
      slot.removeEventListener('slotchange', slotChangeCallback); 
      setTimeout(this.distributeItems.bind(this));
    }.bind(this);
    slot.addEventListener('slotchange', slotChangeCallback);

    this.resizeObserver = new ResizeObserver(function() {
      this.throttle(100, this.distributeItems.bind(this));
    }.bind(this));
    this.resizeObserver.observe(this);
  }

  distributeItems() {
    let width = this.getBoundingClientRect().width;
    if(width == 0) return;

    let numberOfColumns = Math.floor(width / 380);

    if(numberOfColumns > this.children.length) {
      numberOfColumns = this.children.length;
    }

    if(numberOfColumns == this.numberOfColumns) return;
    this.numberOfColumns = numberOfColumns;

    while(this.columns.length > numberOfColumns) {
      this.columns.pop().remove();
    }
    for(let i = this.columns.length; i < numberOfColumns; i++) {
      let div = document.createElement('div');
      div.classList.add('column');
      let slot = document.createElement('slot');
      slot.setAttribute('name', i);
      div.appendChild(slot);
      this.columns.push(div);
      this.shadowRoot.appendChild(div);
    }
  
    let items = this.children;
    for(let i = 0; i < items.length; i++) {
      items[i].removeAttribute('slot');
    }
    for(let i = 0; i < items.length; i++) {
      let columnIndex = i % this.numberOfColumns;
      let index = this.findIndex(columnIndex, this.numberOfColumns, this.columns);
      items[i].setAttribute('slot', index);
    }
  }

  findIndex(columnIndex, numberOfColumns, columns) {
    let heightCurrentColumn = columns[columnIndex].getBoundingClientRect().height;
    let heightNextColumn = columns[(columnIndex + 1) % numberOfColumns].getBoundingClientRect().height;
    if(heightCurrentColumn > heightNextColumn) {
      return this.findIndex((columnIndex + 1) % numberOfColumns, numberOfColumns, columns);
    } else {
      return columnIndex;
    }
  }
  
  throttle(ms, fn) {
    if(this._timer) return;
    this._timer = setTimeout(function() {
      fn.bind(this)();
      this._timer = null;
    }.bind(this), ms);
  }
}

window.customElements.define('yad-card-layout', Component);



/*
findIndex(columnIndex, numberOfColumns, columns) {
  let heightCurrentColumn = columns[columnIndex].getBoundingClientRect().height;
  for(let i = 1; i < numberOfColumns; i++) {
    let heightNextColumn = columns[(columnIndex + i) % numberOfColumns].getBoundingClientRect().height;
    if(heightCurrentColumn > heightNextColumn) {
      return this.findIndex((columnIndex + i) % numberOfColumns, numberOfColumns, columns);
    }
  }
  return columnIndex;
}
*/
