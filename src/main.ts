import { SimpleLexer, dump } from './SimpleLexer';

const lexer = new SimpleLexer();

const script = 'int age = 45;';
console.log(`parse: ${script}`);
const tokenReader = lexer.tokenize(script);
console.log(JSON.stringify(tokenReader));
dump(tokenReader);
