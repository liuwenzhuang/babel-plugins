module.exports = function ({ types: t }) {
  const nestIdentifierVisitor = {
    Identifier: function (path) {
      const { node } = path;
      if (!node) return;
      if (node.name === this.paramName) {
        node.name = 'x';
      }
    }
  }

  const functionVisitor = {
    FunctionDeclaration: function (path) {
      const { node } = path;
      if (!node) return;
      const firstParam = node.params[0];
      const paramName = firstParam.name;
      firstParam.name = 'x';

      path.traverse(nestIdentifierVisitor, { paramName });  // 调用内层visitor，传入的参数在内层visitor中可以使用this访问
    }
  };
  return {
    visitor: functionVisitor
  };
}