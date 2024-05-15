// ParentComponent.tsx
import React, { useState } from 'react';
import CustomNode from './CustomNode';
import { Node } from './CustomNodeTypes';

const ParentComponent: React.FC = () => {
    const [nodes, setNodes] = useState<Node[]>([
        // Örnek node verisi
        {
            id: '1', question: {en: 'Initial question?', tr: 'Başlangıç sorusu?'}, answers: [],
            data: undefined,
            selected: false,
            type: '',
            zIndex: 0,
            isConnectable: false,
            xPos: 0,
            yPos: 0,
            dragging: false
        }
    ]);

    const handleDataChange = (id: string, newData: Node) => {
        setNodes(prevNodes => prevNodes.map(node => (node.id === id ? newData : node)));
    };

    return (
        <div>
            {nodes.map(node => (
                <CustomNode key={node.id} id={node.id} data={node} onDataChange={handleDataChange} />
            ))}
        </div>
    );
};

export default ParentComponent;
