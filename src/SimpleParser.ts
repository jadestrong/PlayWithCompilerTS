import SimpleASTNode from './SimpleASTNode';
import { TokenReader } from './TokenReader';
import { TokenType } from './TokenType';
import ASTNodeType from './ASTNodeType';

class SimpleParser {
    tokens: TokenReader | undefined;

    /**
     * 解析赋值表达式
     * assignmentStatement ::= Identifier '=' additiveExpression ';'
     * @return
     */
    private assignmentStatement(): SimpleASTNode | undefined {
        let node: SimpleASTNode | undefined;

        let token = this.tokens.peek();
        if (token !== null && token.getType() === TokenType.Identifier) {
            token = this.tokens.read(); // 读取标识符
            node = new SimpleASTNode(ASTNodeType.AssignmentStmt, token.getText());
            token = this.tokens.peek();
            if (token !== null && token.getType() === TokenType.Assignment) {
                this.tokens.read(); // 取出等号
                const child = this.additive(this.tokens);
                if (child !== undefined) { // 等号后面没有一个合法的表达式
                    throw new Error('invalide assignment statement, expecting an expression');
                } else {
                    node.addChild(child); // 添加子节点
                    token = this.tokens.peek(); // 预读，看看后面是不是分号
                    if (token !== null && token.getType() === TokenType.SemiColon) {
                        this.tokens.read(); // 消耗掉这个分号
                    } else { // 报错，缺少分号
                        throw new Error('invalid statement, expecting semicolon');
                    }
                }
            } else {
                this.tokens.unread();
                node = null;
            }
        }
        return node;
    }

    private additive(tokens: TokenReader): SimpleASTNode | undefined {
        let child1 = this.multiplicative(tokens); // 先解析一个字符并记录
        let node = child1; // 然后检查后续字符
        if (child1 !== undefined) {
            while (true) {
                let token = tokens.peek();
                // 期望后面是一个 + 或 - 号，满足就是一个加法表达式，就继续进行
                if (token !== null && (token.getType() === TokenType.Plus || token.getType() === TokenType.Minus)) {
                    token = tokens.read(); // 消耗掉这个符号
                    let child2 = this.multiplicative(tokens); // 期望后面还有一个乘法表达式（包含一个数字的情况）
                    if (child2 !== undefined) {
                        // 上面都满足，代表这就是一个加法表达式，所以创建一个 AST 节点
                        node = new SimpleASTNode(ASTNodeType.Additive, token!.getText());
                        node.addChild(child1); // 保证运算先后顺序
                        node.addChild(child2);
                        child1 = node; // 尾递归的状态保存
                    }
                } else {
                    // 如果上面不满足，结束循环
                    break;
                }
            }
        }
        return node;
    }

    private multiplicative(tokens: TokenReader): SimpleASTNode | undefined {
        SimpleASTNode
    }
}
