var fs = require('fs');
var path = require('path');
var babel = require('@babel/core');

var typescriptSynaxPlugin = require('@babel/plugin-syntax-typescript');
var optionalChainingPlugin = require('@babel/plugin-proposal-optional-chaining');
var dynamicImportPlugin = require('@babel/plugin-syntax-dynamic-import');
var modulePlugin = require('./src/modulePlugin');
var pipePlugin = require('./src/pipePlugin');
var importPlugin = require('./src/importPlugin');
var renamePlugin = require('./src/renamePlugin');
var combinePlugin = require('./src/combineVariablesPlugin');
var convertVar = require('./src/convertVar');
var combineVariablesPlugin = require('./src/combineVariablesPlugin');
var removeLodashAllImport = require('./src/removeLodashAllImport');
var checkNoLodashImport = require('./src/checkNoLodashImport');
var convertPCall = require('./src/convertPCall');
var removeUnUsedValue = require('./src/removeUnUsedValue');

// read the filename from the command line arguments
var fileName = process.argv[2];
console.log(fileName);

// read the code from this file
fs.readFile(fileName, function (err, data) {
    if (err) throw err;

    // convert from a buffer to a string
    var src = data.toString();

    // use our plugin to transform the source
    babel.transform(
        src,
        {
            // plugins: [typescriptSynaxPlugin, checkNoLodashImport, removeLodashAllImport]
            plugins: [typescriptSynaxPlugin, optionalChainingPlugin, dynamicImportPlugin, removeUnUsedValue]
            // retainLines: true
        },
        function (err, result) {
            if (err) {
                console.log(fileName, err);
                return;
            }
            let lines = result.code.split(/\n/);
            lines = lines.map(line => {
                const blank = /^(\s+)\S/.exec(line);
                if (blank && blank[1]) {
                    const prepend = blank[1];
                    return `${prepend}${line}`;
                } else {
                    return line;
                }
            });
            const resultStr = lines.join('\n') + '\n';
            // write transformed code to dist/example.js
            fs.writeFileSync(path.resolve(__dirname, './dist/example.ts'), resultStr);
        }
    );
});
