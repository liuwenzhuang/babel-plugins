module.exports = function ({ types: t }) {
  return {
    visitor: {
      VariableDeclaration: function (path) {
        const parent = path.parent
        const node = path.node
        if (node._isHandled || node.declare) {
          return
        }
        if (t.isExportNamedDeclaration(parent)) {
          return
        }
        if (t.isForInStatement(parent)) {
          return
        }
        if (t.isForStatement(parent)) {
          return
        }
        const declarations = path.node.declarations
        if (declarations && declarations[0] && declarations[0].id.type === 'ObjectPattern') {
          return
        }
        const replaceValues = declarations.map(item => {
          const bindings = path.scope.bindings
          let isConstant = false
          const identifier = item.id.name
          if (!bindings[identifier]) {
            let parentPath = path.context.parentPath
            while (parentPath) {
              if (parentPath.scope && parentPath.scope.bindings && parentPath.scope.bindings[identifier]) {
                isConstant = parentPath.scope.bindings[identifier].constant
                break
              }
              parentPath = parentPath.context.parentPath
            }
          } else {
            isConstant = bindings[identifier].constant
          }
          const type = isConstant ? 'const' : 'let'
          const result = t.variableDeclaration(type, [item])
          result._isHandled = true
          return result
        })
        path.replaceWithMultiple(replaceValues)
      }
    }
  }
}
