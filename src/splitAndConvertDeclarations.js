/**
 * 转换var => let/const
 * 将同行多次声明转换为单次声明 var a = 1, b = 2; => const a = 1; const b = 2;
 */
module.exports = function ({types: t}) {
  return {
    visitor: {
      VariableDeclaration: (path) => {
        const { node } = path;
        if (!node || node._isHandled) {
          return;
        }
        // 当前作用域下的绑定信息object，以标识符的name作为key
        const bindings = path.scope.bindings;
        const declarations = node.declarations;
        const replaceValue = declarations.map((item) => {
          const kind = bindings[item.id.name]['constant'] ? 'const' : 'let';
          const replaceItem = t.variableDeclaration(kind, [item]);
          replaceItem._isHandled = true;
          return replaceItem;
        });
        path.replaceWithMultiple(replaceValue);
      }
    }
  };


}
