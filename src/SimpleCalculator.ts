import ASTNode from './ASTNode';
import ASTNodeType from './ASTNodeType';
import { SimpleLexer } from './SimpleLexer';
import { TokenReader} from './TokenReader';
import { TokenType } from './TokenType';

class SimpleASTNode implements ASTNode {
    parent: ASTNode | undefined;
    children: Array<ASTNode> = [];
    readonlyChildren: ReadonlyArray<ASTNode> = this.children;

    constructor(public nodeType:ASTNodeType, public text:string) {}

    getParent() {
        return this.parent!;
    }

    getChildren() {
        return this.readonlyChildren as any;
    }

    getText() {
        return this.text;
    }

    addChild(child: SimpleASTNode) {
        this.children.push(child as any);
        child.parent = this as any;
    }

    getType() {
        return this.nodeType;
    }
}

export class SimpleCalculator {
    /**
     * 执行脚本，并打引输出AST和求值过程
     * @param script
     */
    evaluate(script: string): void {
        try {
            const tree = this.parse(script);

            dumpAST(tree, '');
            this._evaluate(tree, '');
        } catch (err) {
            console.error(err.message);
        }
    }
    /**
     * 执行脚本，并返回根节点
     * @param code
     * @return
     */
    parse(code: string): ASTNode {
        const lexer = new SimpleLexer();
        const tokens = lexer.tokenize(code);

        const rootNode = this.prog(tokens);

        return rootNode;
    }

    private _evaluate(node: ASTNode, indent: string): number {
        let result = 0;
        console.log(`${indent}Calculating: ${ASTNodeType[node.getType()]}`);

        switch (node.getType()) {
            case ASTNodeType.Programm:
                for (let child of node.getChildren()) {
                    result = this._evaluate(child, indent + '\t');
                }
                break;
            case ASTNodeType.Additive:
                let child1 = node.getChildren()[0];
                let value1 = this._evaluate(child1, indent + '\t');
                let child2 = node.getChildren()[1];
                let value2 = this._evaluate(child2, indent + '\t');

                if (node.getText() === '+') {
                    result = value1 + value2;
                } else {
                    result = value1 - value2;
                }
                break;
            case ASTNodeType.Multiplicative:
                child1 = node.getChildren()[0];
                value1 = this._evaluate(child1, indent + '\t');
                child2 = node.getChildren()[1];
                value2 = this._evaluate(child2, indent + '\t');
                if (node.getText() === '*') {
                    result = value1 * value2;
                } else {
                    result = value1 / value2;
                }
                break;
            case ASTNodeType.IntLiteral:
                result = Number(node.getText()); //TODO 验证小数是否正确
                break;
            default:
                break;
        }
        console.log(indent + 'Result: ' + result);
        return result;
    }

    /**
     * 语法解析： 根节点
     * @return
     */
    prog(tokens: TokenReader): SimpleASTNode {
        const node = new SimpleASTNode(ASTNodeType.Programm, 'Calculator');

        const child = this.additive(tokens);

        if (child !== undefined) {
            node.addChild(child);
        }
        return node;
    }

    intDeclare(tokens: TokenReader): SimpleASTNode | undefined {
        let node: SimpleASTNode | undefined;
        let token = tokens.peek();
        if (token !== null && token.getType() === TokenType.Int) {
            token = tokens.read();
            if (tokens.peek()!.getType() === TokenType.Identifier) {
                token = tokens.read();
                node = new SimpleASTNode(ASTNodeType.IntDeclaration, token!.getText());
                token = tokens.peek();
                if (token !== null && token.getType() === TokenType.Assignment) {
                    tokens.read();
                    const child = this.additive(tokens);
                    if (child === undefined) {
                        throw new Error('invalid variable initialization, expecting an expression');
                    } else {
                        node.addChild(child);
                    }
                }
            } else {
                throw new Error('variable name expected');
            }

            if (node !== undefined) {
                token = tokens.peek();
                if (token !== null && token.getType() === TokenType.SemiColon) {
                    tokens.read();
                } else {
                    throw new Error('invalid statement, expecting semicolon');
                }
            }
        }
        return node;
    }

    /**
     * 语法解析：加法表达式
     * @return
     * @throws Error
     */
    private additive(tokens: TokenReader): SimpleASTNode | undefined {
        const child1 = this.multiplicative(tokens);
        let node = child1;

        let token = tokens.peek();
        if (child1 !== undefined && token !== null) {
            if (token.getType() === TokenType.Plus || token.getType() === TokenType.Minus) {
                token = tokens.read();
                let child2 = this.additive(tokens);
                if (child2 !== undefined) {
                    node = new SimpleASTNode(ASTNodeType.Additive, token!.getText());
                    node.addChild(child1);
                    node.addChild(child2);
                } else {
                    throw new Error('invalid additive expression, expecting the right part.');
                }
            }
        }
        return node;
    }

    /**
     * 语法解析： 乘法表达式
     * @return
     * @throws Error
     */
    private multiplicative(tokens: TokenReader): SimpleASTNode | undefined {
        let child1 = this.primary(tokens);
        let node = child1;

        let token = tokens.peek();
        if (child1 !== undefined && token !== null) {
            if (token.getType() === TokenType.Star || token.getType() === TokenType.Slash) {
                token = tokens.read();
                let child2 = this.primary(tokens);
                if (child2 !== undefined) {
                    node = new SimpleASTNode(ASTNodeType.Multiplicative, token!.getText());
                    node.addChild(child1);
                    node.addChild(child2);
                } else {
                    throw new Error('invalid multiplicative expression, expecting the right part.');
                }
            }
        }
        return node;
    }

    /**
     * 语法解析：基础表达式
     * @return
     * @throw Error
     */
    private primary (tokens: TokenReader): SimpleASTNode | undefined {
        let node: SimpleASTNode | undefined;
        let token = tokens.peek();
        if (token !== null) {
            if (token.getType() === TokenType.IntLiteral) {
                token = tokens.read();
                node = new SimpleASTNode(ASTNodeType.IntLiteral, token!.getText());
            } else if (token.getType() === TokenType.Identifier) {
                token = tokens.read();
                node = new SimpleASTNode(ASTNodeType.Identifier, token!.getText());
            } else if (token.getType() === TokenType.LeftParen) {
                tokens.read();
                node = this.additive(tokens);
                if (node !== undefined) {
                    token = tokens.peek();
                    if (token !== null && token.getType() === TokenType.RightParen) {
                        tokens.read();
                    } else {
                        throw new Error('expecting right parenthesis');
                    }
                } else {
                    throw new Error('expecting an additive expression inside parenthesis');
                }
            }
        }
        return node; // 这个方法也做了AST的简化，就是不用构造一个 primary 节点，直接返回子结点。因为它只有一个子节点。
    }
}



export function dumpAST(node: ASTNode, indent: string) {
    console.log(`${indent}${ASTNodeType[node.getType()]} ${node.getText()}`);
    for (let child of node.getChildren()) {
        dumpAST(child, indent + '\t');
    }
}
