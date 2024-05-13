import React, { useState, useEffect, useCallback } from 'react';
import ReactFlow, {
    addEdge,
    Background,
    Connection,
    Controls,
    useEdgesState,
    useNodesState,
} from 'reactflow';
import 'reactflow/dist/style.css';
import { Box, Button } from '@chakra-ui/react';
import { initialEdges, initialNodes } from './Workflow.constants';

// CustomNode ve CustomEdge importları
import CustomNode from './CustomNode';
import CustomEdge from './CustomEdge';

const edgeTypes = {
    customEdge: CustomEdge,
};

const nodeTypes = {
    customNode: CustomNode,  // CustomNode bileşeni burada tanımlanmış
};

const defaultNodeData = {
    question: {
        en: "Enter your question",
        tr: "Sorunuzu giriniz"
    },
    answers: [
        {
            text: {
                en: "Answer 1",
                tr: "Cevap 1"
            },
            connect: ''
        },
        {
            text: {
                en: "Answer 2",
                tr: "Cevap 2"
            },
            connect: ''
        }
    ]
};

function checkDetails(setNodes: (value: (((prevState: Node<any, string | undefined>[]) => Node<any, string | undefined>[]) | Node<any, string | undefined>[])) => void) {
    const checkDetails = localStorage.getItem('workflowNodes1');
    if (checkDetails) {
        localStorage.removeItem('workflowNodes1');
        setNodes(JSON.parse(checkDetails));
    }
}

export const Workflow = () => {
    const [nodes, setNodes, onNodesChange] = useNodesState();
    const [edges, setEdges, onEdgesChange] = useEdgesState();
    const [nextNodeId, setNextNodeId] = useState(5);


    // LocalStorage'dan verileri yükleyin
    useEffect(() => {
        const loadedNodes = localStorage.getItem('workflowNodes');
        const loadedEdges = localStorage.getItem('workflowEdges');
        if (loadedNodes && loadedEdges) {
            try {
                const parsedNodes = JSON.parse(loadedNodes);
                const parsedEdges = JSON.parse(loadedEdges);
                setNodes(parsedNodes);
                setEdges(parsedEdges);
            } catch (error) {
                console.error("Parsing error: ", error);
                // Burada hata yönetimi yapabilirsiniz, örneğin default değerlere geri dönme vs.
            }
        }
    }, []);

    // nodes ve edges değiştiğinde localStorage'a kaydedin
    useEffect(() => {
        checkDetails(setNodes);

        localStorage.setItem('workflowNodes', JSON.stringify(nodes));
        localStorage.setItem('workflowEdges', JSON.stringify(edges));
    }, [nodes,edges]);

    const handleAddNode = () => {
        const newNode = {
            id: `${nextNodeId}`,
            type: 'customNode',
            position: { x: 100, y: 100 },
            data: defaultNodeData
        };
        setNodes((prevNodes) => [...prevNodes, newNode]);
        setNextNodeId(prevId => prevId + 1);
    };
    const onConnect = useCallback(
        (connection: Connection) => {
            const edge = {
                ...connection,
                animated: true,
                id: `${edges.length + 1}`,
                type: 'customEdge',
            };
            setEdges((prevEdges) => addEdge(edge, prevEdges));
        },
        [edges, setEdges]
    );

    const handleDownload = useCallback(() => {
        const data = JSON.stringify({ nodes, edges }, null, 2);
        const blob = new Blob([data], { type: 'application/json' });
        saveAs(blob, 'workflow-data.json');
    }, [nodes, edges]);

    const newDiagram = useCallback(() => {
        setNodes(initialNodes);
        setEdges(initialEdges);
    }, [setNodes, setEdges]);

    const handleCountryChange = useCallback((nodeId, newCountry) => {
        setNodes(prevNodes => prevNodes.map(node =>
            node.id === nodeId ? { ...node, data: { ...node.data, country: newCountry }} : node
        ));
    }, []);

    return (
        <Box height={'90vh'} width={'100vw'}>
            <Button onClick={handleDownload} m={4}>
                Download JSON
            </Button>
            <Button onClick={newDiagram} m={4}>
                New
            </Button>
            <Button onClick={handleAddNode} m={4}>
                Add Node
            </Button>
            <ReactFlow
                nodes={nodes}
                edges={edges}
                onNodesChange={onNodesChange}
                onEdgesChange={onEdgesChange}
                onConnect={onConnect}
                nodeTypes={nodeTypes}
                edgeTypes={edgeTypes}
                fitView
            >
                <Background />
                <Controls />
            </ReactFlow>
        </Box>
    );
};
