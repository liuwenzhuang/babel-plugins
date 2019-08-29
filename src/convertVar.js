module.exports = function ({ types: t }) {
  const nestVariableDeclarationVisitor = {
    VariableDeclaration: function (path) {
      const { node } = path;
      if (!node) return;
      if (node.kind !== 'var') return;
      const declarations = node.declarations;
      const siblings = path.container;
      console.log(siblings);
      if (!Array.isArray(siblings)) {
        return;
      }
      let _handled = false;
      (siblings || []).forEach(item => {
        if (item === node) {
          return;
        }
        console.log('type is --->', item.type);
        if (item.type !== 'ExpressionStatement') {
          return;
        }
        const expression = item.expression;
        if (expression.type === 'AssignmentExpression') {
          const isRefered = declarations.some(declaration => {
            return declaration.id.name === expression.left.name;
          });
          console.log(`isRefered is: ${isRefered}`);

          node.kind = isRefered ? 'let' : 'const';
          _handled = true;
        }
      });
      if (!_handled) {
        node.kind = 'const';
      }
    }
  }

  const functionVisitor = {
    FunctionDeclaration: function (path) {
      const { node } = path;
      if (!node) return;

      path.traverse(nestVariableDeclarationVisitor);  // 调用内层visitor，传入的参数在内层visitor中可以使用this访问
      /* setTimeout(() => {
        path.traverse(nestExpressionStatementVisitor);
      }, 1000); */
    },
    ObjectMethod: function (path) {
      const { node } = path;
      if (!node) return;

      path.traverse(nestVariableDeclarationVisitor);  // 调用内层visitor，传入的参数在内层visitor中可以使用this访问
    },
    FunctionExpression: function (path) {
      const { node } = path;
      if (!node) return;

      path.traverse(nestVariableDeclarationVisitor);  // 调用内层visitor，传入的参数在内层visitor中可以使用this访问
    }
  };
  return {
    visitor: functionVisitor
  };
}