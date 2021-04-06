/**
 * @fileoverview 将
 * import { userToken } from 'Global/constant'
 * 转换为：
 * import constant from 'Global/constant';
 * const { userToken } = constant;
 */

module.exports = function ({ types: t }) {
  let hasUserTokenImport = false;
  let defaultImportIdentifier = '';
  return {
    visitor: {
      Program: {
        exit(path) {
          if (!hasUserTokenImport || !defaultImportIdentifier) {
            return;
          }
          const children = path.node.body;
          const firstNotImportIndex = children.findIndex(item => item.type !== 'ImportDeclaration');

          if (firstNotImportIndex !== -1) {
            // 后面不是import 语句，插入 const { userToken: userToken } = constant;
            const declaration = t.variableDeclaration('const', [
              t.variableDeclarator(
                t.objectPattern([t.objectProperty(t.identifier('userToken'), t.identifier('userToken'), false, true)]),
                t.identifier(defaultImportIdentifier)
              )
            ]);
            children.splice(firstNotImportIndex, 0, declaration);
          }

          hasUserTokenImport = false;
          defaultImportIdentifier = '';
        }
      },
      ImportDeclaration: {
        enter(path) {
          const { node } = path;
          if (!node) return;

          const { source, specifiers = [] } = node;
          const { value } = source;
          const isUserTokenImport = specifiers.some(
            item => item.type === 'ImportSpecifier' && item.local.name === 'userToken'
          );
          const isImportFromConstant = value.toLowerCase().indexOf('global/constant') !== -1;
          if (isUserTokenImport && isImportFromConstant) {
            hasUserTokenImport = true;
            const hasOtherImport = specifiers.length > 1; // 仍有其他的引入，替换
            let defaultImport;
            if (hasOtherImport) {
              const defaultSpecifier = specifiers.find(item => item.type === 'ImportDefaultSpecifier');
              if (defaultSpecifier) {
                defaultImportIdentifier = defaultSpecifier.local.name;
              }
              defaultImport = t.importDeclaration(
                specifiers.filter(item => !(item.type === 'ImportSpecifier' && item.local.name === 'userToken')),
                t.stringLiteral('Global/constant')
              );
            } else {
              // 没有其他引入
              defaultImport = t.importDeclaration(
                [t.importDefaultSpecifier(t.identifier('constant'))],
                t.stringLiteral('Global/constant')
              );
              defaultImportIdentifier = 'constant';
            }
            path.replaceWith(defaultImport);
          }
        }
      }
    }
  };
};
