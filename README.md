# babel plugin

babel plugin测试工程，详见[来源](https://www.sitepoint.com/understanding-asts-building-babel-plugin/)。

实现：

- 文中已实现的替换功能plugin [./src/modulePlugin.js](./src/modulePlugin.js)
- 文中遗留问题，转换 | 功能plugin [./src/pipePlugin.js](./src/pipePlugin.js)

## 测试

在[./example.js](./example.js)中添加需要转换的代码，然后执行`npm start`，在控制台会打印出转换后代码、[./dist/example.js](./dist/example.js)也会生成转换后的代码。
