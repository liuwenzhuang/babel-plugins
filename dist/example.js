var code = 'abc';
var arr = lwz.vector(1, 2, 3);
var obj = lwz.hashMap("name", 'jane', "age", 12);
lwz.assign(obj, "name", 'maria');
lwz.assign(obj, 'age', 15);
lwz.get(obj, "name");
lwz.get(obj, 'age');
mori.assign(obj, 'gender', 'male');
bala(square(double(2)));
jane('text');
double('bala');

const doubleAndSquare = x => square(double(x));

const fooAndBar = x => x & foo | bar;

import Toast from 'antd';
import Button from "antd/es/Button";
import Table from "antd/es/Table";
import Text, { Comment } from './Text';