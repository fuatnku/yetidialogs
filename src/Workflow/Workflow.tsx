import React, { useEffect, useCallback, useState } from 'react';
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
        console.log(loadedNodes);
        if (loadedNodes && loadedEdges) {
            try {
                const parsedNodes = JSON.parse(loadedNodes);
                const parsedEdges = JSON.parse(loadedEdges);
                setNodes([]);
                setEdges([]);
                setTimeout(() => {
                    setNodes(parsedNodes);
                    setEdges(parsedEdges);
                }, 0);
            } catch (error) {
                console.error("Parsing error: ", error);
            }
        }
    }, []);

    useEffect(() => {
        console.log('saving nodes', JSON.stringify(nodes));
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
        const nodeData = nodes.reduce((acc, node) => {
            const formattedAnswers = node.data.answers?.map(answer => {
                const connectedEdge = edges.find(edge => edge.source === node.id && edge.sourceHandle === `choice-${node.data.answers.indexOf(answer)}`);
                return {
                    text: answer.text,
                    connect: connectedEdge ? connectedEdge.target : undefined
                };
            });
            acc[node.id] = {
                question: node.data.question,
                answers: formattedAnswers,
                isRandomOrder: node.data.isRandomOrder || false,
                position: node.position
            };
            return acc;
        }, {});

        const data = JSON.stringify(nodeData, null, 2);
        const blob = new Blob([data], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = 'workflow.json';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }, [nodes, edges]);

    const handleUpload = useCallback((event) => {
        const file = event.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                try {
                    const data = JSON.parse(e.target.result as string);
                    const parsedNodes = Object.keys(data).map((key) => ({
                        id: key,
                        type: 'customNode',
                        position: data[key].position,
                        data: {
                            question: data[key].question,
                            answers: data[key].answers,
                            isRandomOrder: data[key].isRandomOrder,
                        }
                    }));

                    const parsedEdges = parsedNodes.flatMap((node) =>
                        node.data.answers
                            .filter((answer) => answer.connect)
                            .map((answer, index) => ({
                                id: `e${node.id}-${answer.connect}`,
                                source: node.id,
                                sourceHandle: `choice-${index}`,
                                target: answer.connect,
                                animated: true,
                                type: 'customEdge'
                            }))
                    );

                    setNodes([]);
                    setEdges([]);
                    setTimeout(() => {
                        setNodes(parsedNodes);
                        setEdges(parsedEdges);
                    }, 0);

                } catch (error) {
                    console.error("File parsing error: ", error);
                }
            };
            reader.readAsText(file);
        }
    }, [setNodes, setEdges]);

    const newDiagram = useCallback(() => {
        setNodes([]);
        setEdges([]);
        setTimeout(() => {
            setNodes(initialNodes);
            setEdges(initialEdges);
        }, 0);
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

    return (
        <Box height={'90vh'} width={'100vw'}>
            <input
                type="file"
                accept=".json"
                onChange={handleUpload}
                style={{display: 'none'}}
                id="upload-json"
            />
            <label htmlFor="upload-json">
                <Button as="span" m={4}>Upload JSON</Button>
            </label>
            <Button onClick={handleDownload} m={4}>Download JSON</Button>
            <Button onClick={newDiagram} m={4}>New</Button>
            <Button onClick={addNewNode} m={4}>Add Node</Button>
            <Button onClick={() => setViewDevTools(!viewDevTools)} m={4}>Debug</Button>

            <ReactFlow
                nodes={nodes.map(node => ({
                    ...node,
                    data: {
                        ...node.data,
                        id: node.id,
                        onChange: handleNodeChange,
                        onDataChange: handleDataChange,
                    }
                }))}
                edges={edges}
                onNodesChange={onNodesChange}
                onEdgesChange={onEdgesChange}
                onConnect={onConnect}
                onNodeDragStop={onNodeDragStop}
                nodeTypes={nodeTypes}
                edgeTypes={edgeTypes}
                snapToGrid
                snapGrid={[20, 20]}
                fitView
            >
                {viewDevTools && <DevTools/>}
                <Background/>
                <Controls/>
            </ReactFlow>
        </Box>
    );
};

export default Workflow;
