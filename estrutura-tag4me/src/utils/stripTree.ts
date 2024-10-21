import { Tree } from '../interfaces/Tree';

interface ExportTreeNode {
  name: string;
  children?: ExportTreeNode[];
}

export function stripTree(tree: Tree[]): ExportTreeNode[] {
  return tree.map(node => ({
    name: node.name,
    children: node.children.length > 0 ? stripTree(node.children) : [],
  }));
}
