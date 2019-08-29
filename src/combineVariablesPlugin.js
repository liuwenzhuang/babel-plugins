module.exports = function ({ types: t }) {
  return {
    pre(state) {  // 先于visitor执行，做一些准备工作
      this.cache = {};
    },
    post(state) {  // 后于visitor执行，做一些清理工作
      this.cache = {};
    },
    visitor: {
      FunctionDeclaration: function (path, state) {
        console.log(`this.cache: ${this.cache}`);
        // throw path.buildCodeFrameError("Error message here");  // 用于在特定条件抛出错误，会之时错误位置
        /**
         * path            当前路径 replaceWith replaceWithMultiple remove
         * path.parentPath 父路径
         * path.scope      当前路径作用域 hasBinding hasOwnBinding generateUidIdentifier generateUidIdentifierBasedOnNode rename
         *
         * state
         * state.opts      配置插件时，为其提供的配置项，如[combineVariablesPlugin, { option1: true, option2: 'bala' }]中的{ option1: true, option2: 'bala' }部分
         */
        path.traverse({
          VariableDeclaration: function (path) {
            if (path.node._clean) {
              console.log(`path已处理`);
              if (path.node._delete) {
                path.remove();
              }
              return;
            }
            // if (path.node.kind !== 'var') return;
            if (path.inList) {
              let declarators = [];
              path.container.forEach((item) => {
                if (!t.isVariableDeclaration(item, { kind: path.node.kind })) return;  // 类型相同的合并
                item._clean = true;
                item._delete = true;  // 兄弟节点已被处理，下次需要被移除，否则会重复
                declarators = declarators.concat(item.declarations);
              });
              const replaceDeclaration = t.variableDeclaration(path.node.kind, declarators);
              replaceDeclaration._clean = true;
              path.replaceWith(replaceDeclaration);
            }
          }
        })
      }
    }
  }
}