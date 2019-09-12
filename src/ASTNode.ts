import ASTNodeType from './ASTNodeType';

interface ASTNode {
    // 父结点
    getParent(): ASTNode;
    // 子结点
    getChildren(): Array<ASTNode>;
    // AST类型
    getType(): ASTNodeType;
    // 文本值
    getText(): string;
}

export default ASTNode;
