import { Token } from './Token';

/**
 * 一个Token流。由Lexer生成。Parser可以从中获取Token.
 */
export interface TokenReader {
    /**
     * 返回Token流中下一个Token，并从流中取出。如果流已经为空，返回null
     */
    read(): Token | null;
    /**
     * 返回Token流中下一个Token，但不从流中取出。如果流已经为空，返回null
     */
    peek(): Token | null;
    /**
     * Token流回退一步。恢复原来的Token。
     */
    unread(): void;
    /**
     * 获取Token流当前的读取位置
     */
    getPosition(): number;
    /**
     * 设置Token流当前的读取位置
     * @params position
     */
    setPosition(position: number): void;
}
