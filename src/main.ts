import { SimpleLexer, dump } from './SimpleLexer';
import { SimpleCalculator, dumpAST } from './SimpleCalculator';

const calcualtor = new SimpleCalculator();
const lexer = new SimpleLexer();

let script = 'int a = b + 3;';
// const script = 'int age = 45;';
console.log(`parse: ${script}`);
const tokens = lexer.tokenize(script);
// dump(tokenReader);

try {
    const node = calcualtor.intDeclare(tokens);
    if (node !== undefined) {
        dumpAST(node, '');
    }
} catch (err) {
    console.log(err.message);
}

script = '2+3*5';
console.log('计算： ' + script + ", 看上去一切正常。");
calcualtor.evaluate(script);

script = '2+';
console.log(`${script}, 应该有语法错误。`)
calcualtor.evaluate(script);

script = '2+3+4';
console.log(`${script}, 出现结合性错误。`)
calcualtor.evaluate(script);
