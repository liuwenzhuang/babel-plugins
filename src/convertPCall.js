module.exports = function ({ types: t }) {
    let isHandled = false;
    let backPath = null;
    return {
        visitor: {
            Program: {
                exit() {
                    if (isHandled) {
                        isHandled = false;
                        backPath && backPath.remove();
                    }
                }
            },
            VariableDeclaration: function (path) {
                const { node } = path;
                if (!node) return;

                const { declarations } = node;
                if (
                    declarations.length === 1 &&
                    declarations[0].id.name === '_p' &&
                    declarations[0].init &&
                    declarations[0].init.properties &&
                    declarations[0].init.properties.length === 0
                ) {
                    let parentPath = path.parentPath;
                    if (parentPath.key !== 'program') {
                        return;
                    }
                    parentPath.traverse({
                        MemberExpression: function (innerPath) {
                            const node = innerPath.node;
                            const innerParent = innerPath.parent;
                            if (node.object.name === '_p') {
                                let propertyName = node.property.name;
                                if (propertyName) {
                                    propertyName = propertyName.replace(/^_\$\$/, '');
                                }
                                // 父级是赋值语句
                                if (t.isAssignmentExpression(innerParent) && innerParent.right.callee) {
                                    const isInComp =
                                        innerParent.right.callee.object &&
                                        innerParent.right.callee.object.name === 'Regular';
                                    const isInLayout =
                                        innerParent.right.callee.property &&
                                        innerParent.right.callee.property.name === '_$klass';
                                    if (isInComp || isInLayout) {
                                        const replace = t.variableDeclaration('const', [
                                            t.variableDeclarator(
                                                t.identifier(propertyName),
                                                innerParent.right
                                            )
                                        ]);
                                        if (innerPath.parentPath.parentPath && innerPath.parentPath.parentPath.node) {
                                            innerPath.parentPath.parentPath.node.leadingComments
                                                ? (replace.leadingComments =
                                                      innerPath.parentPath.parentPath.node.leadingComments.concat([]))
                                                : undefined;
                                            innerPath.parentPath.parentPath.node.trailingComments
                                                ? (replace.trailingComments =
                                                      innerPath.parentPath.parentPath.node.trailingComments)
                                                : undefined;
                                        }
                                        innerPath.parentPath.insertAfter(replace);
                                        innerPath.parentPath.remove();
                                    }
                                } else {
                                    innerPath.replaceWith(t.identifier(propertyName));
                                }
                                isHandled = true;
                                backPath = path;
                            }
                        }
                    });
                }
            }
        }
    };
};
