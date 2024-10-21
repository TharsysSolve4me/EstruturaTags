export interface Tree {
  id: number;
  name: string;
  parentId: string | string[];
  children: Tree[];
}
