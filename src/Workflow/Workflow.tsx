import React, { useEffect, useCallback } from 'react';
import ReactFlow, {
    addEdge,
    Background,
    Controls,
    useEdgesState,
    useNodesState,
    Node,
    Connection,
} from 'reactflow';
import 'reactflow/dist/style.css';
import { Box, Button } from '@chakra-ui/react';
import { initialEdges, initialNodes } from './Workflow.constants';

import DevTools from './Devtools';
import './style.css';

// CustomNode ve CustomEdge importları
import CustomNode from './CustomNode';
import CustomEdge from './CustomEdge';

const edgeTypes = {
    customEdge: CustomEdge,
};

const nodeTypes = {
    customNode: CustomNode,  // CustomNode bileşeni burada tanımlanmış
};

const defaultNode = {
    id: 'new-node',
    type: 'customNode',
    position: { x: 250, y: 5 },
    data: { label: 'New Node' }
};

function checkDetails(setNodes: (value: (((prevState: Node<any, string | undefined>[]) => Node<any, string | undefined>[]) | Node<any, string | undefined>[])) => void) {
    const checkDetails = localStorage.getItem('workflowNodes1');
    if (checkDetails) {
        localStorage.removeItem('workflowNodes1');
        setNodes(JSON.parse(checkDetails));
    }
}

export const Workflow = () => {
    const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
    const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

    const setCountry = useCallback((nodeId, newCountry) => {
        setNodes(prevNodes => prevNodes.map(node =>
            node.id === nodeId ? { ...node, data: { ...node.data, country: newCountry }} : node
        ));
    }, [setNodes]);

    // LocalStorage'dan verileri yükleyin
    useEffect(() => {
        const loadedNodes = localStorage.getItem('workflowNodes');
        const loadedEdges = localStorage.getItem('workflowEdges');
        if (loadedNodes && loadedEdges) {
            try {
                console.log("Loaded nodes: ", loadedNodes);
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
        console.log("*** Nodes and edges saved to localStorage");
        console.log("Nodes: ", nodes);
    }, [nodes, edges]);

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

    const addNewNode = useCallback(() => {
        const newNode = {
            ...defaultNode,
            id: `${nodes.length + 1}`,
            position: { x: Math.random() * 250, y: Math.random() * 250 }
        };
        setNodes((prevNodes) => [...prevNodes, newNode]);
    }, [nodes, setNodes]);

    const handleNodeChange = useCallback((id, field, value) => {
        console.log("Node change event: ", id, field, value);
        console.log(JSON.stringify(nodes));
        setNodes(prevNodes => prevNodes.map(node =>
            node.id === id ? { ...node, data: { ...node.data, [field]: value }} : node
        ));
    }, [setNodes]);

    const handleDataChange = useCallback((id, newData) => {
        setNodes(prevNodes => prevNodes.map(node =>
            node.id === id ? { ...node, data: { ...node.data, ...newData }} : node
        ));
    }, [setNodes]);


    return (
        <Box height={'100vh'} width={'100vw'}>
            <Button onClick={handleDownload} m={4}>
                Download JSON
            </Button>
            <Button onClick={newDiagram} m={4}>
                New
            </Button>
            <Button onClick={addNewNode} m={4}>
                Add Node
            </Button>
            <ReactFlow
                nodes={nodes.map(node => ({
                    ...node,
                    data: {
                        ...node.data,
                        id: node.id, // ID'yi explicit olarak geçin
                        onDataChange: handleDataChange, // Bu fonksiyonu tanımlayın veya mevcut fonksiyonu kullanın
                        onChange: handleNodeChange, // handleNodeChange fonksiyonunu doğrudan burada geçin
                    }
                }))}
                edges={edges}
                onNodesChange={onNodesChange}
                onEdgesChange={onEdgesChange}
                onConnect={onConnect}
                nodeTypes={nodeTypes}
                edgeTypes={edgeTypes}
                fitView
            >
                <DevTools />

                <Background />
                <Controls />
            </ReactFlow>
        </Box>
    );
};
