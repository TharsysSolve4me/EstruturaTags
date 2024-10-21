import express, { Request, Response } from 'express';
import Tag from './domains/Tags';
import connection from './infra/ConnectionDatabase';  // Importando a função de conexão

const app = express();

app.use(express.json());

app.get("/api/v1/tag/:agent", async (req: Request, res: Response) => {
    try {
        const agent = req.params.agent;
        const db = await connection();
        const collection = db.collection("tags");

        // Buscar documentos da coleção
        const documents = await collection.find({ "agent": `${agent}` }).toArray();

        res.json(documents);
    } catch (error) {
        console.error("Erro ao buscar dados:", error);
        res.status(500).send("Erro ao buscar dados");
    }
});

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

export function buildTree(data: Tag[]): Tag[] {
    const nameMapping: { [key: string]: Tag } = {};
    const rootNodes: Tag[] = [];
  
    // cria todos os nós
    data.forEach(node => {
      nameMapping[node.tag] = {
        id: node.id,
        agent: node.agent,
        count: node.count,
        tag: node.tag,
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

app.listen(3000, () => console.log("Rodando na porta 3000"));
