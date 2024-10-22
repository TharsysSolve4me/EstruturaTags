import { Tree } from '../interfaces/Tree';

interface ExportTreeNode {
  name: string;
  childrens?: ExportTreeNode[];
}

export function stripTree(tree: Tree[]): ExportTreeNode[] {
  return tree.map(node => ({
    name: node.name,
    childrens: node.children.length > 0 ? stripTree(node.children) : [],
  }));
}
