var fs = require('fs').promises;
var path = require('path');
var babel = require('@babel/core');
var typescriptSynaxPlugin = require('@babel/plugin-syntax-typescript');
var optionalChainingPlugin = require('@babel/plugin-proposal-optional-chaining');
var dynamicImportPlugin = require('@babel/plugin-syntax-dynamic-import');

var splitDeclars = require('./src/combineVariablesPlugin');
var removeLodashAllImport = require('./src/removeLodashAllImport');
var checkNoLodashImport = require('./src/checkNoLodashImport');
var convertPCall = require('./src/convertPCall');

// read the filename from the command line arguments
var sourcePath = path.join(__dirname, './source/src');

async function* getFiles(dir) {
    const dirents = await fs.readdir(dir, { withFileTypes: true });
    for (const dirent of dirents) {
        const res = path.resolve(dir, dirent.name);
        if (dirent.isDirectory()) {
            yield* getFiles(res);
        } else {
            const extName = path.extname(dirent.name);
            if (extName !== '.js' && extName !== '.ts') {
                continue;
            }
            yield res;
        }
    }
}

function convert(fileName) {
    // read the code from this file
    fs.readFile(fileName)
        .then(data => {
            var src = data.toString();

            // use our plugin to transform the source
            babel.transform(
                src,
                {
                    // plugins: [typescriptSynaxPlugin, splitDeclars], // 拆分当行内多个声明
                    // plugins: [typescriptSynaxPlugin, removeLodashAllImport], // 去除lodash的全局导入
                    // plugins: [typescriptSynaxPlugin, optionalChainingPlugin, dynamicImportPlugin, checkNoLodashImport, removeLodashAllImport], // 检查是否使用了lodash但没引入
                    plugins: [typescriptSynaxPlugin, optionalChainingPlugin, dynamicImportPlugin, convertPCall], // 去除const _p = {};
                },
                (err, result) => {
                    if (err) {
                        console.log(fileName, err.message);
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

                    const dist = fileName.substr(path.join(__dirname, './source').length);
                    fs.writeFile(path.join(__dirname, './dest', dist), resultStr, {
                        flag: 'w'
                    })
                        .then(() => {
                            // console.log(`write ${fileName} done`)
                        })
                        .catch(console.error);
                }
            );
        })
        .catch(console.error);
}

(async () => {
    for await (const f of getFiles(sourcePath)) {
        convert(f);
    }
})();
