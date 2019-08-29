const babylon = require('babylon');                  // 解析源码，生成ast
const traverse = require('babel-traverse').default;  // 用来遍历ast
const t = require('babel-types');                    // ast辅助方法
let generator = require('babel-generator');          // 将ast转换回代码
if (generator.__esModule) {                          // 此种方法判断当前模块是否是模块，如果是，使用default导入
  console.log(`babel-generator is esModule, use default module`);
  generator = generator.default;
}

const template = require('babel-template');          // 编写字符串形式且带有占位符的代码来代替手动编码， 尤其是生成的大规模 AST的时候

const sourceCode = `export default function square(x) {
    return x * x;
}`;

const sourceAst = babylon.parse(sourceCode, {
  sourceType: 'module'
});

traverse(sourceAst, {
  enter(path) {
    /* if (path.node.type === 'Identifier' && path.node.name === 'x') {
      path.node.name = 'n';
    } */
    // 上面的代码可使用`babel-types`里的函数重写：
    if (t.isIdentifier(path.node, {
      name: 'x'
    })) {
      path.node.name = 'n';
    }
  }
});

const traverseCode = generator(sourceAst, {}, sourceCode).code;
console.log(`code with babel-traverse: ${traverseCode}`);


/** 使用babel-template生成ast */

const buildRequire = template(`
  var IMPORT_NAME = require(SOURCE)
`);

const buildAst = buildRequire({
  IMPORT_NAME: t.identifier('MyModule'),
  SOURCE: t.stringLiteral('my-module')
});

const buildCode = generator(buildAst).code;
console.log(`code with babel-template: ${buildCode}`);
