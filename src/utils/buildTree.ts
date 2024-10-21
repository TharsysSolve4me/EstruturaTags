import { TreeNode } from '../interfaces/TreeNode';
import { Tree } from '../interfaces/Tree';
import { TreeData } from '../interfaces/TreeData';

export function buildTree(data: TreeNode[]): Tree[] {
  const nameMapping: { [key: string]: Tree } = {};
  const rootNodes: Tree[] = [];

  // cria todos os nós
  data.forEach(node => {
    nameMapping[node.tag] = {
      id: node.id,
      name: node.tag,
      parentId: node.parentId,
      children: []
    };
  });

  // conecta as tags aos pais
  data.forEach(node => {
    const treeNode = nameMapping[node.tag];
    if (!node.parentId || node.parentId === '') {
      // Se não houver parentId, é um nó raiz
      rootNodes.push(treeNode);
    } else if (Array.isArray(node.parentId)) {
      // tag com múltiplos pais
      node.parentId.forEach(parentTag => {
        const parent = nameMapping[parentTag];
        if (parent) {
          // Clona a tag para anexar aos múltiplos pais, mas compartilha o array 'children'
          const clonedNode = { ...treeNode };
          parent.children.push(clonedNode);
        }
      });
    } else {
      const parent = nameMapping[node.parentId];
      if (parent) {
        parent.children.push(treeNode);
      }
    }
  });

  return rootNodes;
}


{/*import { TreeNode } from '../interfaces/TreeNode';
import { Tree } from '../interfaces/Tree';
import { TreeData } from '../interfaces/TreeData';

export function buildTree(data: TreeNode[]): Tree[] {
  const nameMapping: { [key: string]: Tree } = {};
  const rootNodes: Tree[] = [];

  // cria todos a arvore
  data.forEach(node => {
    nameMapping[node.tag] = {
      id: node.id,
      name: node.tag,
      parentId: node.parentId,
      children: []
    };
  });

  //conecta as tags aos pais
  data.forEach(node => {
    const treeNode = nameMapping[node.tag];
    if (!node.parentId || node.parentId === '') {
      // Se não houver parentId, é o masterchef
      rootNodes.push(treeNode);
    } else if (Array.isArray(node.parentId)) {
      // tag com múltiplos pais
      node.parentId.forEach(parentTag => {
        const parent = nameMapping[parentTag];
        if (parent) {
          // Clona a tag para anexar aos multiplos pais
          const clonedNode = { ...treeNode, children: treeNode.children.slice() };
          parent.children.push(clonedNode);
        }
      });
    } else {
      const parent = nameMapping[node.parentId];
      if (parent) {
        parent.children.push(treeNode);
      }
    }
  });

  return rootNodes;
}*/}