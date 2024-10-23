import React, { useState, useRef, useEffect } from 'react';
import Tree from 'react-d3-tree';
import { TreeNode } from '../interfaces/TreeNode';
import { buildTree } from '../utils/buildTree';
import { stripTree } from '../utils/stripTree';

const TreeForm: React.FC = () => {
  const [treeData, setTreeData] = useState<TreeNode[]>(() => {
    const storedTreeData = localStorage.getItem('treeData');
    return storedTreeData ? JSON.parse(storedTreeData) : [];
  });

  const [formData, setFormData] = useState<TreeNode>(() => {
    const storedTreeData = localStorage.getItem('treeData');
    let initialId = 0;
    if (storedTreeData) {
      const parsedData = JSON.parse(storedTreeData);
      // Encontra o maior ID e define o próximo ID
      const maxId = parsedData.reduce(
        (max: number, node: TreeNode) => (node.id > max ? node.id : max),
        0
      );
      initialId = maxId + 1;
    }
    return { id: initialId, tag: '', parentId: '' };
  });

  const [deleteTag, setDeleteTag] = useState('');
  const [fileName, setFileName] = useState('tree-structure');
  const [allowMultipleParents, setAllowMultipleParents] = useState(false);

  const [translate, setTranslate] = useState({ x: 0, y: 0 });
  const treeContainerRef = useRef<HTMLDivElement>(null);

  // Salva os dados no localStorage sempre que treeData mudar
  useEffect(() => {
    localStorage.setItem('treeData', JSON.stringify(treeData));
  }, [treeData]);

  useEffect(() => {
    if (treeContainerRef.current) {
      const dimensions =
        treeContainerRef.current.getBoundingClientRect();
      setTranslate({
        x: dimensions.width / 2,
        y: dimensions.height / 2,
      });
    }
  }, [treeData]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prevFormData) => ({
      ...prevFormData,
      [name]: name === 'id' ? Number(value) : value,
    }));
  };

  const handleParentSelection = (
    e: React.ChangeEvent<HTMLSelectElement>
  ) => {
    const selectedOptions = Array.from(
      e.target.selectedOptions,
      (option) => option.value
    );
    setFormData((prevFormData) => ({
      ...prevFormData,
      parentId: allowMultipleParents
        ? selectedOptions
        : selectedOptions[0] || '',
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.tag) {
      alert('Por favor, preencha o campo Tag');
      return;
    }

    const formParentIds = Array.isArray(formData.parentId)
      ? formData.parentId
      : [formData.parentId];

    const isDuplicate = treeData.some((node) => {
      const nodeParentIds = Array.isArray(node.parentId)
        ? node.parentId
        : [node.parentId];
      return (
        node.tag === formData.tag &&
        formParentIds.some((pid) => pid === nodeParentIds[0])
      );
    });

    if (isDuplicate) {
      alert('Essa tag já existe no mesmo nível!');
      return;
    }

    // Verifica se o nó está tentando ser pai de si mesmo
    if (formParentIds.includes(formData.tag)) {
      alert('Um nó não pode ser pai de si mesmo!');
      return;
    }

    const newTreeNode: TreeNode = {
      id: formData.id,
      tag: formData.tag,
      parentId: formData.parentId,
    };
    setTreeData([...treeData, newTreeNode]);

    setFormData({
      id: formData.id + 1,
      tag: '',
      parentId: formData.parentId,
    });
  };

  const handleFileNameChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    setFileName(e.target.value);
  };

  // Função para excluir um nó com base na tag
  const deleteNode = (tagToDelete: string) => {
    if (!tagToDelete) {
      alert('Por favor, selecione uma tag para excluir');
      return;
    }

    // Função auxiliar para obter todos os IDs dos descendentes
    const getDescendantIds = (
      nodes: TreeNode[],
      parentTags: string[]
    ): number[] => {
      let descendantIds: number[] = [];
      nodes.forEach((node) => {
        const nodeParentIds = Array.isArray(node.parentId)
          ? node.parentId
          : [node.parentId];
        if (nodeParentIds.some((pid) => parentTags.includes(pid))) {
          descendantIds.push(node.id);
          descendantIds = descendantIds.concat(
            getDescendantIds(nodes, [node.tag])
          );
        }
      });
      return descendantIds;
    };

    const nodeToDelete = treeData.find((node) => node.tag === tagToDelete);
    if (!nodeToDelete) {
      alert('Tag não encontrada');
      return;
    }

    const idsToDelete = [
      nodeToDelete.id,
      ...getDescendantIds(treeData, [nodeToDelete.tag]),
    ];

    // Remove os nós com IDs em idsToDelete
    const newTreeData = treeData.filter(
      (node) => !idsToDelete.includes(node.id)
    );

    // Remove referências ao nó excluído em parentId de outros nós
    const updatedTreeData = newTreeData.map((node) => {
      if (Array.isArray(node.parentId)) {
        return {
          ...node,
          parentId: node.parentId.filter(
            (pid) => pid !== nodeToDelete.tag
          ),
        };
      } else if (node.parentId === nodeToDelete.tag) {
        return {
          ...node,
          parentId: '',
        };
      }
      return node;
    });

    setTreeData(updatedTreeData);
    setDeleteTag('');
  };

  const handleDeleteSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    deleteNode(deleteTag);
  };

  const treeStructure = buildTree(treeData);

  // Função para calcular o comprimento máximo dos nomes das tags
  const getMaxNodeNameLength = (treeData: any[]): number => {
    let maxLength = 0;
    const visitedNodes = new Set();

    const traverse = (nodes: any[]) => {
      nodes.forEach((node) => {
        if (visitedNodes.has(node)) return;
        visitedNodes.add(node);

        if (node.name.length > maxLength) {
          maxLength = node.name.length;
        }
        if (node.children && node.children.length > 0) {
          traverse(node.children);
        }
      });
    };
    traverse(treeData);
    return maxLength;
  };

  // Calcula o nodeSize dinamicamente
  const maxNodeNameLength = getMaxNodeNameLength(treeStructure);
  const nodeWidth = maxNodeNameLength * 10 + 60;
  const nodeSize = { x: nodeWidth, y: 120 };

  const exportToJson = () => {
    const treeStructure = buildTree(treeData);
    const simplifiedTree = stripTree(treeStructure);
    const json = JSON.stringify(simplifiedTree, null, 4);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${fileName || 'tree-structure'}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  // Função para limpar os dados armazenados
  const clearData = () => {
    if (window.confirm('Deseja realmente limpar todos os dados?')) {
      localStorage.removeItem('treeData');
      setTreeData([]);
      setFormData({ id: 0, tag: '', parentId: '' });
    }
  };

  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'space-between',
        fontFamily: 'Arial, sans-serif',
      }}
    >
      {/* Seção esquerda com o formulário */}
      <div style={{ width: '30%', padding: '8px 8px 4px 8px' }}>
        <h1
          style={{
            textAlign: 'center',
            color: '#2c3e50',
            marginBottom: '10px',
          }}
        >
          Árvore de Palavras
        </h1>

        {/* Formulário para adicionar tags */}
        <form
          onSubmit={handleSubmit}
          style={{ display: 'flex', flexDirection: 'column' }}
        >
          <h3 style={{ color: '#2c3e50', marginBottom: '8px' }}>
            Adicionar Tag
          </h3>

          <label style={{ marginBottom: '5px', color: '#34495e' }}>
            ID:
          </label>
          <input
            type="number"
            name="id"
            value={formData.id}
            onChange={handleChange}
            required
            style={{
              padding: '6px',
              marginBottom: '10px',
              borderRadius: '4px',
              border: '1px solid #ccc',
            }}
          />

          <label style={{ marginBottom: '5px', color: '#34495e' }}>
            Tag:
          </label>
          <input
            type="text"
            name="tag"
            value={formData.tag}
            onChange={handleChange}
            required
            style={{
              padding: '6px',
              marginBottom: '10px',
              borderRadius: '4px',
              border: '1px solid #ccc',
            }}
          />

          <label style={{ marginBottom: '5px', color: '#34495e' }}>
            Selecione o Pai (Tag):
          </label>
          <select
            name="parentId"
            value={
              allowMultipleParents
                ? Array.isArray(formData.parentId)
                  ? formData.parentId
                  : [formData.parentId]
                : formData.parentId
            }
            onChange={handleParentSelection}
            multiple={allowMultipleParents}
            style={{
              padding: '6px',
              marginBottom: '10px',
              borderRadius: '4px',
              border: '1px solid #ccc',
            }}
          >
            <option value="">-- Sem Pai --</option>
            {treeData.map((node) => (
              <option key={node.id} value={node.tag}>
                {node.tag}
              </option>
            ))}
          </select>

          <label style={{ marginBottom: '10px', color: '#34495e' }}>
            <input
              type="checkbox"
              checked={allowMultipleParents}
              onChange={() =>
                setAllowMultipleParents(!allowMultipleParents)
              }
              style={{ marginRight: '5px' }}
            />
            Permitir múltiplos pais
          </label>

          <button
            type="submit"
            style={{
              padding: '8px',
              backgroundColor: '#2ecc71',
              color: '#fff',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontWeight: 'bold',
              marginBottom: '15px',
            }}
          >
            Adicionar Tag
          </button>
        </form>

        {/* Formulário para excluir tags */}
        <form
          onSubmit={handleDeleteSubmit}
          style={{ display: 'flex', flexDirection: 'column' }}
        >
          <h3 style={{ color: '#2c3e50', marginBottom: '8px' }}>
            Excluir Tag
          </h3>
          <label style={{ marginBottom: '5px', color: '#34495e' }}>
            Selecione a Tag para Excluir:
          </label>
          <select
            value={deleteTag}
            onChange={(e) => setDeleteTag(e.target.value)}
            style={{
              padding: '6px',
              marginBottom: '10px',
              borderRadius: '4px',
              border: '1px solid #ccc',
            }}
          >
            <option value="">-- Selecione uma Tag --</option>
            {treeData.map((node) => (
              <option key={node.id} value={node.tag}>
                {node.tag}
              </option>
            ))}
          </select>

          <button
            type="submit"
            style={{
              padding: '8px',
              backgroundColor: '#e74c3c',
              color: '#fff',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontWeight: 'bold',
              marginBottom: '15px',
            }}
          >
            Excluir Tag
          </button>
        </form>

        {/* Entrada de nome do arquivo e botão de exportação */}
        <div style={{ marginTop: '20px' }}>
          <label style={{ marginBottom: '5px', color: '#34495e' }}>
            Nome do Arquivo:
          </label>
          <input
            type="text"
            value={fileName}
            onChange={handleFileNameChange}
            placeholder="Digite o nome do arquivo"
            style={{
              padding: '6px',
              marginBottom: '8px',
              borderRadius: '4px',
              border: '1px solid #ccc',
              width: '96%',
            }}
          />
          <button
            onClick={exportToJson}
            style={{
              padding: '8px',
              backgroundColor: '#3498db',
              color: '#fff',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontWeight: 'bold',
              marginBottom: '15px',
              width: '100%',
            }}
          >
            Exportar JSON
          </button>
        </div>

        {/* Botão para limpar os dados */}
        <button
          onClick={clearData}
          style={{
            padding: '8px',
            backgroundColor: '#e67e22',
            color: '#fff',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            fontWeight: 'bold',
            marginTop: '10px',
            width: '100%',
          }}
        >
          Limpar Dados
        </button>
      </div>

      {/* Seção direita com a visualização da árvore */}
      <div
        ref={treeContainerRef}
        style={{
          width: '65%',
          height: '100vh',
          overflowY: 'auto',
          backgroundColor: '#ecf0f1',
          padding: '20px',
          borderRadius: '5px',
        }}
      >
        <h2 style={{ textAlign: 'center', color: '#2c3e50' }}>
          Visualização da Árvore
        </h2>
        {treeStructure.length > 0 ? (
          <div style={{ width: '100%', height: '80vh' }}>
            <Tree
              data={treeStructure}
              translate={translate}
              orientation="vertical"
              pathFunc="diagonal"
              nodeSize={nodeSize}
              styles={{
                links: {
                  stroke: '#bdc3c7',
                  strokeWidth: 2,
                },
                nodes: {
                  node: {
                    circle: {
                      stroke: '#3498db',
                      strokeWidth: 3,
                      fill: '#fff',
                      filter:
                        'drop-shadow(0px 0px 5px rgba(0, 0, 0, 0.1))',
                    },
                    name: {
                      stroke: '#2c3e50',
                      fontWeight: 'bold',
                    },
                  },
                  leafNode: {
                    circle: {
                      stroke: '#e74c3c',
                      strokeWidth: 3,
                      fill: '#fff',
                      filter:
                        'drop-shadow(0px 0px 5px rgba(0, 0, 0, 0.1))',
                    },
                    name: {
                      stroke: '#2c3e50',
                      fontWeight: 'bold',
                    },
                  },
                },
              }}
            />
          </div>
        ) : (
          <p
            style={{ textAlign: 'center', color: '#7f8c8d' }}
          >
            Adicione nós para visualizar a árvore.
          </p>
        )}
      </div>
    </div>
  );
};

export default TreeForm;
