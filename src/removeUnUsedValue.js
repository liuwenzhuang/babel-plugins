const { uniqBy, sortBy } = require('lodash');

module.exports = function ({ types: t }) {
    let isHandled = false;
    return {
        visitor: {
            Program: {
                exit() {
                    isHandled = false;
                }
            },
            VariableDeclaration: function (path) {
                const node = path.node;
                const parent = path.parent;
                if (!node || node.declare) {
                    return;
                }
                if (t.isExportNamedDeclaration(parent)) {
                    return;
                }
                if (t.isForInStatement(parent)) {
                    return;
                }
                if (t.isForStatement(parent)) {
                    return;
                }
                const parentPath = path.parentPath;
                const parentBindings = parentPath.scope.bindings;
                let regularCmp = null;
                const newDeclarations = node.declarations.filter(declaration => {
                    const isRegularCmp =
                        declaration.init &&
                        declaration.init.callee &&
                        declaration.init.callee.property &&
                        declaration.init.callee.property.name === 'extend';
                    if (t.isArrayPattern(declaration.id)) {
                        const elements = declaration.id.elements.filter(element => {
                            return parentBindings[element.name].referenced;
                        });
                        if (elements.length === 0) {
                            return false;
                        } else {
                            declaration.id.elements = elements;
                            return true;
                        }
                    } else if (t.isObjectPattern(declaration.id)) {
                        const properties = declaration.id.properties.filter(property => {
                            let localVar;
                            if (t.isAssignmentPattern(property.value)) {
                                localVar = property.key.name;
                            } else {
                                localVar = property.value.name;
                            }
                            return parentBindings[localVar].referenced;
                        });
                        if (properties.length === 0) {
                            return false;
                        } else {
                            declaration.id.properties = properties;
                            return true;
                        }
                    } else {
                        const referenced = parentBindings[declaration.id.name].referenced;
                        if (isRegularCmp && !referenced) {
                            regularCmp = declaration.init;
                        }
                        return referenced || isRegularCmp;
                    }
                }, this);
                if (regularCmp) {
                    path.replaceWith(regularCmp);
                } else if (newDeclarations.length === 0) {
                    path.remove();
                } else {
                    node.declarations = newDeclarations;
                }
            },
            'FunctionDeclaration|FunctionExpression|ArrowFunctionExpression|ClassMethod|ObjectMethod': function (path) {
                const { node } = path;
                if (!node) return;
                const params = node.params;
                const bindings = path.scope.bindings;
                if (!bindings || !params.length === 0) {
                    return;
                }
                const backParams = params.concat();
                let index = backParams.length - 1;
                while (backParams.length) {
                    const param = backParams.pop();
                    if (bindings[param.name] && bindings[param.name].referenced === false) {
                        index -= 1;
                        continue;
                    } else {
                        backParams.push(param);
                        break;
                    }
                }
                node.params = backParams.map((param, innerIndex) => {
                    if (innerIndex >= index) {
                        return param;
                    }
                    if (bindings[param.name] && bindings[param.name].referenced === false) {
                        param.name = param.name.startsWith('_') ? param.name : `_${param.name}`;
                        return param;
                    }
                    return param;
                });
            }
        }
    };
};
