var fs = require('fs');
var path = require('path');
var babel = require('@babel/core');

var modulePlugin = require('./src/modulePlugin');
var pipePlugin = require('./src/pipePlugin');
var importPlugin = require('./src/importPlugin');
var renamePlugin = require('./src/renamePlugin');
var combinePlugin = require('./src/combineVariablesPlugin');
var convertVar = require('./src/convertVar');

// read the filename from the command line arguments
var fileName = process.argv[2];
console.log(fileName);

// read the code from this file
fs.readFile(fileName, function(err, data) {
  if(err) throw err;

  // convert from a buffer to a string
  var src = data.toString();

  // use our plugin to transform the source
  var out = babel.transform(src, {
    plugins: [convertVar]
  });

  // print the generated code to screen
  console.log(`transformed code is:`);
  console.log(out.code);

  // write transformed code to dist/example.js
  fs.writeFileSync(path.resolve(__dirname, './dist/example.js'), out.code);
});
