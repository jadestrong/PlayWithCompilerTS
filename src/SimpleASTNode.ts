import ASTNode from './ASTNode';
import ASTNodeType from './ASTNodeType';

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

export default SimpleASTNode;
