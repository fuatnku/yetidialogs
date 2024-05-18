import React, { useEffect, useCallback } from 'react';
import ReactFlow, {
    addEdge,
    Background,
    Controls,
    useEdgesState,
    useNodesState,
    Node,
    Connection,
    NodeDragStopEvent,
} from 'reactflow';
import 'reactflow/dist/style.css';
import { Box, Button } from '@chakra-ui/react';
import { initialEdges, initialNodes } from './Workflow.constants';
import DevTools from './Devtools';
import './style.css';
import TextUpdaterNode from './TextUpdaterNode';
import './text-updater-node.css';

import CustomNode from './CustomNode';
import CustomEdge from './CustomEdge';

const edgeTypes = {
    customEdge: CustomEdge,
};

const nodeTypes = {
    customNode: CustomNode,
    textUpdaterNode: TextUpdaterNode,
};

const defaultNode = {
    id: 'new-node',
    type: 'customNode',
    position: { x: 250, y: 5 },
    data: { label: 'New Node' }
};

const defaultNode2 = {
    id: 'new-node',
    type: 'textUpdaterNode',
    position: { x: 250, y: 5 },
    data: { label: 'New Node' }
};

export const Workflow = () => {
    const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
    const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
    const [viewDevTools, setViewDevTools] = React.useState(false);

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
            }
        }
    }, []);

    useEffect(() => {
        localStorage.setItem('workflowNodes', JSON.stringify(nodes));
        localStorage.setItem('workflowEdges', JSON.stringify(edges));
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

    const onNodeDragStop = useCallback(
        (event: NodeDragStopEvent, node: Node) => {
            const roundedPositions = nodes.map(n => ({
                ...n,
                position: { x: Math.round(n.position.x), y: Math.round(n.position.y) }
            }));
            setNodes(roundedPositions);
            localStorage.setItem('workflowNodes', JSON.stringify(roundedPositions));
        },
        [nodes, setNodes]
    );

    const handleDownload = useCallback(() => {
        const data = JSON.stringify({ nodes, edges }, null, 2);
        const blob = new Blob([data], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = 'workflow.json';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
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
    const addNewNode2 = useCallback(() => {
        const newNode = {
            ...defaultNode2,
            id: `${nodes.length + 1}`,
            position: { x: Math.random() * 250, y: Math.random() * 250 }
        };
        setNodes((prevNodes) => [...prevNodes, newNode]);
    }, [nodes, setNodes]);

    const handleNodeChange = useCallback((id, field, value) => {
        setNodes(prevNodes => prevNodes.map(node =>
            node.id === id ? { ...node, data: { ...node.data, [field]: value }} : node
        ));
    }, [setNodes]);

    const handleDataChange = useCallback((id, newData) => {
        setNodes(prevNodes => prevNodes.map(node =>
            node.id === id ? { ...node, data: { ...node.data, ...newData }} : node
        ));
    }, [setNodes]);

    const changeFirstNodeQuestion = useCallback(() => {
        const allNodes = [...nodes];
        allNodes[0].data.question.en = "Question changed";
        allNodes[0].data.question.tr = "Soru değiştirildi";
        setNodes(allNodes);
    }, [nodes, setNodes]);

    return (
        <Box height={'90vh'} width={'100vw'}>
            <Button onClick={handleDownload} m={4}>Download JSON</Button>
            <Button onClick={newDiagram} m={4}>New</Button>
            <Button onClick={addNewNode} m={4}>Add Node</Button>
            <Button onClick={addNewNode2} m={4}>Add Node Type2</Button>
            <Button onClick={() => setViewDevTools(!viewDevTools)} m={4}>Debug</Button>
            <Button onClick={changeFirstNodeQuestion} m={4}>Set Question</Button>
            <ReactFlow
                nodes={nodes.map(node => ({
                    ...node,
                    data: {
                        ...node.data,
                        id: node.id,
                        onDataChange: handleDataChange,
                        onChange: handleNodeChange,
                    }
                }))}
                edges={edges}
                onNodesChange={onNodesChange}
                onEdgesChange={onEdgesChange}
                onConnect={onConnect}
                onNodeDragStop={onNodeDragStop}
                nodeTypes={nodeTypes}
                edgeTypes={edgeTypes}
                fitView
            >
                {viewDevTools && <DevTools />}
                <Background />
                <Controls />
            </ReactFlow>
        </Box>
    );
};

export default Workflow;
