// import * as json1 from 'ot-json1';
const json1 = require('ot-json1');
const modifyNameOP = json1.replaceOp(['name'], true, 'newname');
const modifyName2OP = json1.replaceOp(['name'], true, 'other');

const op = json1.type.compose(modifyNameOP, modifyName2OP);
