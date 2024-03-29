import { TokenType } from './TokenType';

export interface Token {
    // text: string;
    // type: TokenType;
    getText: () => string;
    getType: () => TokenType;
}
