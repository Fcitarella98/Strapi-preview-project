import React from 'react';

const renderRichTextNodes = (nodes) => {
  if (!nodes) return null;
  // Se nodes non è un array, lo converto in array
  const nodesArray = Array.isArray(nodes) ? nodes : [nodes];

  return nodesArray.map((node, index) => {
    console.log("Node :", node);
    switch (node.type) {
      case 'paragraph': {
        return (
          <p key={index}>
            {node.children ? renderRichTextNodes(node.children) : null}
          </p>
        );
      }
      case 'list': {
        // Imposta il tag della lista in base al formato: "ordered" per <ol>, "unordered" per <ul>
        const ListTag = node.format === 'ordered' ? 'ol' : 'ul';
        return (
          <ListTag key={index}>
            {node.children &&
              Array.isArray(node.children) &&
              node.children.map((child, childIndex) => {
                // Il child dovrebbe essere un nodo di tipo "list-item"
                return (
                  <React.Fragment key={childIndex}>
                    {renderRichTextNodes(child)}
                  </React.Fragment>
                );
              })}
          </ListTag>
        );
      }
      case 'list-item': {
        return (
          <li key={index}>
            {node.children ? renderRichTextNodes(node.children) : null}
          </li>
        );
      }
      case 'text': {
        return <span key={index}>{node.text}</span>;
      }
      default: {
        // Gestione di eventuali altri tipi: se il nodo ha dei children, li renderizza ricorsivamente
        return node.children ? (
          <div key={index}>{renderRichTextNodes(node.children)}</div>
        ) : null;
      }
    }
  });
};

export default renderRichTextNodes;
