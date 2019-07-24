/**
 * convert `2 | multiply | divide | bala` => `bala(divide(multiply(2)))`
 */

module.exports = function ({ types: t }) {
  return {
    visitor: {
      BinaryExpression: function (path) {
        const { node } = path;
        if (!node) return;
        if (node.operator !== '|') return;  // 只处理"|"操作
        let left = node.left;
        const right = node.right;
        const rightValues = [];
        rightValues.push(right);
        while(true) {
          if (!t.isBinaryExpression(left)) {
            break;
          }
          if (left.operator !== '|') return;  // 只处理"|"操作
          rightValues.unshift(left.right);                 // 保存右侧值
          left = left.left;                                // 最左边的值，即最内层参数
        }
        let replaceExpr;
        rightValues.forEach((item, index) => {
          if (index === 0) {                               // 首个函数，处理的是最左侧的值
            replaceExpr = t.callExpression(item, [left]);
          } else {
            replaceExpr = t.callExpression(item, [replaceExpr]);
          }
        });
        path.replaceWith(replaceExpr);
      }
    }
  };
}
