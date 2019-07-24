/**
 * convert import { Button } from 'antd' => import Button from 'antd/es/Button'
 *
 * .babelrc
 * {
 *   plugins: [
 *     ['./src/importPlugin', { libraryName: 'antd' }]
 *   ]
 * }
 */
module.exports = function ({types: t}) {
    return {
        visitor: {
            ImportDeclaration: function (path, { opts = {} }) {
                const { node } = path;
                if (!node) return;

                const { source, specifiers } = node;
                const { value } = source;
                if (specifiers.every((specifier) => t.isImportDefaultSpecifier(specifier))
                  || opts.libraryName !== value) {  // 都已经转换过 或 libraryName不对应
                    return;
                }
                const replaceValues = specifiers.map((specifier) => {
                    let ret;
                    if (t.isImportDefaultSpecifier(specifier)) {  // 本身是default导入的
                        ret = t.importDeclaration(
                            [t.importDefaultSpecifier(specifier.local)],
                            source
                        )
                    } else {  // 非default导入
                        ret = t.importDeclaration(
                            [t.importDefaultSpecifier(specifier.imported)],
                            t.StringLiteral(`${value}/es/${specifier.imported.name}`)
                        );
                    }
                    return ret;
                });
                path.replaceWithMultiple(replaceValues);
            }
        }
    }
}