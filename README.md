# Yet Another Node-Red Dashboard (yad)
A node-red dashboard based on polymer web-components

The main motivation of this dashboard is that users can contribute widgets and their accompanying nodes, just like contrib nodes for node-red itself, but this time for the dashboard!

This is realized via web-components based on [polymer](https://www.polymer-project.org/).

The dashboard itself is then built from simple html tags which automatically send and receive messages to/from node-red.

This also allows that widgets are combined with a node-red node which acts as a backend.

## Note
This is a very early proof of concept. Everything can change all the time. Feedback/discussion appreciated.

## Contributions/discussion
If someone thinks this is interesting, I would be pleased to discuss and receive contributions. Even if you think that another route could be more sensible, let me know!

# Install
Go to your node-red home-home directory (e.g. `~/.node-red`) and run
```
npm install https://github.com/cinhcet/node-red-contrib-component-dashboard.git
```
Then go to `node_modules/node-red-contrib-component-dashboard/src` and run `bower install` (you need to have bower installed).

# Create the UI
Modify `src/index.html` to generate your dashboard. You are completely free to use any layout/css you like. A widget like a button is then just a simple html tag like
```html
<yad-paper-button id="paperButton1">Click Me</yad-paper-button>
```
Ensure that the widget is imported in the header, e.g. `<link rel="import" href="elements/yad-paper-button.html">`.

Now use a yad-paper-button node in the flow editor and specify the `elementID` to be `paperButton1`. Whenever the button is pressed, this node sends a message. This way, the node and the widget are coupled.
Note that for each widget a unique id has to be defined.

Each node requires a config node. At the moment, just create one and use them on all nodes. It is planned that each config node corresponds to an independent dashboard with its own url.

Further note that at the moment you have to reload the page after each deploy of node-red, otherwise, nothing will work (this is to be fixed).

The power of web-components can be seen for example by using `<yad-music-control id="musicControl1"></yad-music-control>`, which will create a music control widget by just importing one single html tag.

# Create Widgets
The creation of custom widgets consists of two parts, the widget itself which is a polymer web-component and a node-red node accompanying the widget, which is optional. In the folder `templateForWidgets`, you will find two folders.
#### Elements:
To create a widget, look at the template `yad-node-element.html` in `src/templateForWidgets/elements` and make yourself familiar with the basics of [polymer](https://www.polymer-project.org/2.0/docs/devguide/feature-overview).

The function `nodeRedMsg(msg)` is called from node-red whenever a message is injected into the node with the id of the element. Use this to modify your widget data (e.g. text, chart etc.).

When the widget contains control elements like a button, use `this._sendToNR({payload: 'message'});` to send a message back to node-red.

#### Node
If you think that the widget needs further processing/storing/what ever on the server side, you can create a node for this widget.

The basic template can be found in `src/templateForWidgets/nodes`. Please refer to [node-red creating nodes](https://nodered.org/docs/creating-nodes/) for details how to generate nodes in general.

To make a node work with your widget, mainly two parts are important. The function `yadNode.prototype.recMessage = function(m)` is called from the ui widget to send messages from the ui to node-red.

In return, use `node.yad.sendMessage(node, m);` to send the message `m` to the ui widget from node-red. Look at the existing nodes for an example.

The basic yad-node already allows to communicate with all widgets, so creating a node for each widget is not necessary. However, this is recommended to create a node for each widget (maybe widget group) to perform validation/security checks.

# TODO
* Auto refresh and reconnect after node-red is deployed
* Message replay to update ui when a client connects
* Multiple pages for multiple config nodes
* Layout widget to create a simple node-red-dashboard like ui layout
* more widgets, more widgets, more widgets....
* etc.
