var fs = require('fs');
var path = require('path');

const myWidgetsFolderName = 'myWidgets';
const myWidgetsFolder = path.join(__dirname, myWidgetsFolderName);

const widgetsJSFile_FileName = path.join(__dirname, 'widgets.js');

const nativeTemplateFileName = 'node-red-contrib-component-dashboard/templates/widgetTemplate/my-component-native.js';
const litElementTemplateFileName = 'node-red-contrib-component-dashboard/templates/widgetTemplate/my-component-lit-element.js';

if(process.argv.length == 2) {
  console.error("Please specify a widget name");
  process.exit(1);
}

let widgetName = process.argv[2];

if(!checkWidgetFileName(widgetName)) {
  console.error("widget name not adhering to rules");
  process.exit(1);
}

let widgetFileName = widgetName + '.js';

if(fs.existsSync(path.join(myWidgetsFolder, widgetFileName))) {
  console.error("widget", widgetName, "already exists - please choose another name");
  process.exit(1);
}

if(!fs.existsSync(myWidgetsFolder)) {
  fs.mkdirSync(myWidgetsFolder);
}

let templateFileName;
if(process.argv.length == 3) {
  templateFileName = nativeTemplateFileName;
} else {
  let optionsArray = process.argv.slice(3);
  if(optionsArray.includes('lit-element')) {
    templateFileName = litElementTemplateFileName;
  } else if(optionsArray.includes('native')) {
    templateFileName = nativeTemplateFileName;
  } else {
    console.error('I do not understand the options');
    process.exit(1);
  }
}

let template = fs.readFileSync(require.resolve(templateFileName), 'utf8');
template = template.replace('my-component', widgetName);

fs.writeFileSync(path.join(myWidgetsFolder, widgetFileName), template);

fs.appendFileSync(widgetsJSFile_FileName, "import './" + myWidgetsFolderName + "/" + widgetName + ".js';\n");


function checkWidgetFileName(n) {
  if(n !== n.toLowerCase()) return false;
  if(n.includes("_")) return false;
  if(!n.includes("-")) return false;
  return true;
}