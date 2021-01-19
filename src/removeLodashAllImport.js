const { uniqBy, sortBy } = require('lodash')

module.exports = function ({ types: t }) {
  let isHandled = false
  return {
    visitor: {
      Program: {
        exit() {
          isHandled = false
        }
      },
      ImportDeclaration: function (path) {
        const { node } = path
        if (!node) return

        const { source, specifiers } = node
        const { value } = source
        if (value === 'lodash' && specifiers.some(specifier => {
          return specifier.local.name === '_'
        })) {
          // 存在全局导入lodash，从Program级别开始替换类似_.merge操作，并替换全局导入
          let parentPath = path.parentPath
          while (parentPath.key !== 'program') {
            parentPath = parentPath.parentPath
          }
          parentPath.traverse({
            CallExpression: function (innerPath) {
              const node = innerPath.node
              if (node.callee && node.callee.object && node.callee.object.name === '_') {
                const identifier = t.identifier(node.callee.property.name)
                // const replace = t.callExpression.apply(identifier, node.arguments, undefined, undefined, node.typeParameters)
                // 保留如findIndex<{id: number}>()的类型信息
                const replace = Object.assign(t.callExpression(identifier, node.arguments), {
                  typeArguments: node.typeParameters
                })
                innerPath.replaceWith(replace)

                const importSpecifier = t.importSpecifier(identifier, identifier)
                let importSpecifiers = [importSpecifier]
                if (isHandled) {
                  importSpecifiers = [...importSpecifiers, ...path.node.specifiers]
                }
                const key = 'local.name'
                importSpecifiers = sortBy(uniqBy(importSpecifiers, key), key)
                const parentReplace = t.importDeclaration(importSpecifiers, t.stringLiteral('lodash'))
                path.replaceWith(parentReplace)
                isHandled = true
              }
            }
          })
        }
      }
    }
  }
}
