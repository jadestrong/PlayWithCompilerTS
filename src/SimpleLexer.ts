import { Token } from './Token';
import { TokenReader } from './TokenReader';
import { TokenType } from './TokenType';

enum DfaState {
    Initial,
    If, Id_if1, Id_if2, Else, Id_else1, Id_else2, Id_else3, Id_else4, Int, Id_int1, Id_int2, Id_int3, Id, GT, GE,

    Assignment,

    Plus, Minus, Star, Slash,

    SemiColon,
    LeftParen,
    RightParen,

    IntLiteral
}

export class SimpleLexer {
    private tokenText: Array<string> = [];
    private tokens: Array<Token> = [];
    private token: SimpleToken | undefined;

    // 是否是字母
    private isAlpha(ch: string): boolean {
        const chCode = ch.charCodeAt(0);
        return chCode >= 'a'.charCodeAt(0) && chCode <= 'z'.charCodeAt(0) || chCode >= 'A'.charCodeAt(0) && chCode <= 'Z'.charCodeAt(0);
    }

    // 是否是数字
    private isDigit(ch: string): boolean {
        const chCode = ch.charCodeAt(0);
        return chCode >= '0'.charCodeAt(0) && chCode < '9'.charCodeAt(0);
    }

    // 是否是空白字符
    private isBlank(ch: string): boolean {
        const chCode = ch.charCodeAt(0);
        return chCode === ' '.charCodeAt(0) || chCode === '\t'.charCodeAt(0) || chCode === '\n'.charCodeAt(0);
    }

    private initToken(ch: string): DfaState {
        let token = this.token!;
        if (this.tokenText.length > 0) {
            token.text = this.tokenText.join('');
            this.tokens.push(token);

            this.tokenText = [];
            token = this.token = new SimpleToken();
        }

        let newState = DfaState.Initial;
        if (this.isAlpha(ch)) {
            if (ch === 'i') {
                newState = DfaState.Id_int1;
            } else {
                newState = DfaState.Id; // 进入Id状态
            }
            token.type = TokenType.Identifier;
            this.tokenText.push(ch);
        } else if (this.isDigit(ch)) {
            newState = DfaState.IntLiteral;
            token.type = TokenType.IntLiteral;
            this.tokenText.push(ch);
        } else if (ch === '>') {
            newState = DfaState.GT;
            token.type = TokenType.GT;
            this.tokenText.push(ch);
        } else if (ch === '+') {
            newState = DfaState.Plus;
            token.type = TokenType.Plus;
            this.tokenText.push(ch);
        } else if (ch === '-') {
            newState = DfaState.Minus;
            token.type = TokenType.Minus;
            this.tokenText.push(ch);
        } else if (ch === '/') {
            newState = DfaState.Slash;
            token.type = TokenType.Slash;
            this.tokenText.push(ch);
        } else if (ch === ';') {
            newState = DfaState.SemiColon;
            token.type = TokenType.SemiColon;
            this.tokenText.push(ch);
        } else if (ch === '(') {
            newState = DfaState.LeftParen;
            token.type = TokenType.LeftParen;
            this.tokenText.push(ch);
        } else if (ch === ')') {
            newState = DfaState.RightParen;
            token.type = TokenType.RightParen;
            this.tokenText.push(ch);
        } else if (ch === '=') {
            newState = DfaState.Assignment;
            token.type = TokenType.Assignment;
            this.tokenText.push(ch);
        } else {
            newState = DfaState.Initial;
        }
        return newState;
    }

    tokenize(code: string): SimpleTokenReader {
        this.tokens = [];
        const iterator = createStringIterator(code);
        this.tokenText = [];
        this.token = new SimpleToken();
        let ich: IteratorResult<string>;
        let ch: string = '';
        let state: DfaState = DfaState.Initial;
        try {
            while(!(ich = iterator.next()).done) {
                ch = ich.value;
                switch(state) {
                    case DfaState.Initial:
                        state = this.initToken(ch);
                        break;
                    case DfaState.Id:
                        console.log('Id1', ch);
                        if (this.isAlpha(ch) || this.isDigit(ch)) {
                            this.tokenText.push(ch);
                        } else {
                            state = this.initToken(ch);
                        }
                        break;
                    case DfaState.GT:
                        if (ch === '=') {
                            this.token.type = TokenType.GE; // 转换成GE
                            state = DfaState.GE;
                            this.tokenText.push(ch);
                        } else {
                            state = this.initToken(ch);
                        }
                        break;
                    case DfaState.GE:
                    case DfaState.Assignment:
                    case DfaState.Plus:
                    case DfaState.Minus:
                    case DfaState.Star:
                    case DfaState.Slash:
                    case DfaState.SemiColon:
                    case DfaState.LeftParen:
                    case DfaState.RightParen:
                        state = this.initToken(ch); // 退出当前状态，并保存Token
                        break;
                    case DfaState.IntLiteral:
                        if (this.isDigit(ch)) {
                            this.tokenText.push(ch); // 继续保持在数字字面量状态
                        } else {
                            state = this.initToken(ch); // 退出当前状态，并保存Token
                        }
                        break;
                    case DfaState.Id_int1:
                        if (ch === 'n') {
                            state = DfaState.Id_int2;
                            this.tokenText.push(ch);
                        } else if (this.isDigit(ch) || this.isAlpha(ch)) {
                            state = DfaState.Id;
                            this.tokenText.push(ch);
                        } else {
                            state = this.initToken(ch);
                        }
                        break;
                    case DfaState.Id_int2:
                        if (ch === 't') {
                            state = DfaState.Id_int3;
                            this.tokenText.push(ch);
                        } else if (this.isDigit(ch) || this.isAlpha(ch)) {
                            state = DfaState.Id;
                            this.tokenText.push(ch);
                        } else {
                            state = this.initToken(ch);
                        }
                        break;
                    case DfaState.Id_int3:
                        if (this.isBlank(ch)) {
                            this.token.type = TokenType.Int;
                            state = this.initToken(ch);
                        } else {
                            state = DfaState.Id;
                            this.tokenText.push(ch);
                        }
                        break;
                    default:
                        break;
                }
            }
            if (this.tokenText.length > 0) {
                this.initToken(ch);
            }
        } catch (err) {
            console.error(err);
        }
        return new SimpleTokenReader(this.tokens);
    }
}

function *createStringIterator(code: string) {
    for (let c of code) {
        yield c;
    }
}
// const code = '1 + 2 = a';
// const iterator = createStringIterator(code);
// let ch: IteratorResult<string, void>;
// while(!(ch = iterator.next()).done) {
//     console.log(ch);
// }

export class SimpleTokenReader implements TokenReader {
    tokens: Array<Token> = [];
    pos: number = 0;

    constructor(tokens: Array<Token>) {
        this.tokens = tokens;
    }

    read () {
        if (this.pos < this.tokens.length) {
            return this.tokens[this.pos++];
        }
        return null;
    }

    peek () {
        const { pos, tokens } = this;
        if (pos < tokens.length) {
            return tokens[pos];
        }
        return null;
    }

    unread () {
        if (this.pos > 0) {
            this.pos--;
        }
    }

    getPosition () {
        return this.pos;
    }

    setPosition (position: number) {
        if (position > 0 && position < this.tokens.length) {
            this.pos = position;
        }
    }
}

class SimpleToken implements Token {
    type: TokenType | undefined;
    text: string | undefined;

    getType(): TokenType {
        return this.type!;
    }

    getText(): string {
        return this.text!;
    }
}

export function dump(tokenReader: SimpleTokenReader): void {
    console.log('text\ttype');
    let token: Token | null;
    while (!!(token = tokenReader.read())) {
        console.log(token.getText() + '\t' + token.getType());
        // console.log(`${token.getText()}${token.getType()}`)
    }
}
