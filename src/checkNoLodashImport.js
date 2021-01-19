const lodash = require('lodash')

module.exports = function ({ types: t }) {
  let hasLodashImport = false
  let insertedLodashImport = false
  return {
    visitor: {
      Program: {
        exit() {
          hasLodashImport = false
          insertedLodashImport = false
        }
      },
      ImportDeclaration: function (path) {
        const { node } = path
        if (!node) return

        const { source } = node
        const { value } = source
        if (value === 'lodash') {
          hasLodashImport = true
        }
      },
      CallExpression: function (path) {
        if (insertedLodashImport) {
          return
        }
        const node = path.node
        if (node.callee && node.callee.object && node.callee.object.name === '_') {
          if (typeof lodash[node.callee.property.name] === 'function' && !hasLodashImport) {
            // throw new Error('存在loadsh方法引用，但未引入')
            let parentPath = path.parentPath
            while (parentPath.key !== 'program') {
              parentPath = parentPath.parentPath
            }
            const lodashImport = t.importDeclaration(
              [t.importDefaultSpecifier(t.identifier('_'))],
              t.stringLiteral('lodash')
            )
            const firstNodePath = parentPath.get('body')[0]
            firstNodePath.insertBefore(lodashImport)
            insertedLodashImport = true
          }
        }
      },
    }
  }
}