module.exports = function (babel) {
  const t = babel.types;
  function lwzMethod (name) {
    var expr = t.memberExpression(
      t.identifier('lwz'),
      t.identifier(name)
    );
    expr._clean = true;  // 经过转换的代码，不需要再次处理
    return expr;
  }
  return {
    visitor: {
      ArrayExpression: function (path) {
        const replaceValue = t.callExpression(lwzMethod('vector'), path.node.elements);
        path.replaceWith(replaceValue);
      },
      ObjectExpression: function (path) {
        const args = [];
        path.node.properties.forEach((property) => {
          args.push(t.stringLiteral(property.key.name), property.value);
        });
        const replaceValue = t.callExpression(lwzMethod('hashMap'), args);
        path.replaceWith(replaceValue);
      },
      AssignmentExpression: function (path) {
        const left = path.node.left;
        const right = path.node.right;
        const args = [];
        if (t.isMemberExpression(left)) {
          args.push(left.object);
          if (left.computed) { // a['b']的形式
            args.push(left.property);
          } else {             // a.b的形式
            args.push(t.stringLiteral(left.property.name));
          }
          args.push(right);
          path.replaceWith(t.callExpression(
            lwzMethod('assign'),
            args
          ));
        }
      },
      MemberExpression: function (path) {
        if (path.node._clean) return;
        if (t.isCallExpression(path.parent)) {
          console.log('MemberExpression is in a CallExpression');
          return;
        }
        if(t.isAssignmentExpression(path.parent)) return;  // 赋值语句使用 AssignmentExpression 拦截，不在此处处理
        const args = [path.node.object];
        if (path.node.computed) {
          args.push(path.node.property);
        } else {
          args.push(t.stringLiteral(path.node.property.name));
        }
        path.replaceWith(t.callExpression(
          lwzMethod('get'),
          args
        ));
      }
    }
  };
}
