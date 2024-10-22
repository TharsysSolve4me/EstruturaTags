import express, { Request, Response } from 'express';
import Tag from './domains/Tags';
import connection from './infra/ConnectionDatabase';  // Importando a função de conexão

const app = express();

app.use(express.json());

app.post("/api/v1/tag", async (req: Request, res: Response) => {
  try {
      const tag: Tag = req.body
      const db = await connection();
      const collection = db.collection("tags");

      // Buscar documentos da coleção
      const documents = await collection.insertOne(tag);

      res.json(documents);
  } catch (error) {
      console.error("Erro ao buscar dados:", error);
      res.status(500).send("Erro ao buscar dados");
  }
});

export function buildTree(data: Tag[]): any[] {
  const nameMapping: { [key: string]: any } = {};
  const rootNodes: any[] = [];

  // Cria todos os nós
  data.forEach(node => {
    nameMapping[node.id] = {
      id: node.id,
      name: node.tag,
      parentId: node.parentId,
      count: node.count,
      children: []
    };
  });

  // Conecta as tags aos pais
  data.forEach(node => {
    const treeNode = nameMapping[node.id];
    
    // Converter parentId para número (caso ele seja uma string)
    const parentIdNumber = Number(node.parentId);

    if (!node.parentId || node.parentId === '') {
      // Nó raiz
      rootNodes.push(treeNode);
    } else if (Array.isArray(node.parentId)) {
      // Caso especial: múltiplos pais
      node.parentId.forEach(parentTag => {
        const parent = nameMapping[Number(parentTag)];
        if (parent) {
          const clonedNode = { ...treeNode, children: [...treeNode.children] };
          parent.children.push(clonedNode);
        }
      });
    } else {
      // Nó com um único pai
      const parent = nameMapping[parentIdNumber];
      if (parent) {
        parent.children.push(treeNode);
      }
    }
  });

  return rootNodes;
}


app.get("/api/v1/tag/:agent", async (req: Request, res: Response) => {
  try {
      const agent = req.params.agent;
      const db = await connection();
      const collection = db.collection("tags");

      // Buscar documentos da coleção
      const documents = await collection.find({ "agent": `${agent}` }).toArray();

      // Mapear os documentos para o tipo `Tag`
      const tags: Tag[] = documents.map((doc) => ({
        id: doc.id,
        agent: doc.agent,
        tag: doc.tag,
        parentId: doc.parentId,
        count: doc.count,
        children: []
      }));      

      // Construir a árvore usando a função buildTree
      const tree = buildTree(tags);

      res.json(tree);
  } catch (error) {
      console.error("Erro ao buscar dados:", error);
      res.status(500).send("Erro ao buscar dados");
  }
});



app.listen(3000, () => console.log("Rodando na porta 3000"));
