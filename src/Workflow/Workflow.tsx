//WorkFlow.tsx
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

import SwitchNode from './SwitchNode';
import CommandNode from './CommandNode';
import PauseNode from './PauseNode';
import CustomNode from './CustomNode';
import CustomEdge from './CustomEdge';

const edgeTypes = {
    customEdge: CustomEdge,
};

const nodeTypes = {
    customNode: CustomNode,
    pauseNode: PauseNode,
    commandNode: CommandNode,
    switchNode: SwitchNode,
};

const defaultNode = {
    id: 'new-node',
    type: 'customNode',
    position: { x: 250, y: 5 },
    data: { label: 'New Node' }
};

export const Workflow = () => {
    const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
    const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
    const [viewDevTools, setViewDevTools] = React.useState(false);

    const [history, setHistory] = useState([{ nodes: initialNodes, edges: initialEdges }]);
    const [currentHistoryIndex, setCurrentHistoryIndex] = useState(0);

    const applyChanges = (newNodes, newEdges) => {
        const newHistory = history.slice(0, currentHistoryIndex + 1); // Mevcut indeksten sonraki geçmişi temizle
        newHistory.push({ nodes: newNodes, edges: newEdges });
        setHistory(newHistory);
        setCurrentHistoryIndex(newHistory.length - 1);
    };

    const undo = () => {
        if (currentHistoryIndex > 0) {
            setCurrentHistoryIndex(currentHistoryIndex - 1);
            const historyState = history[currentHistoryIndex - 1];
            setNodes([]);
            setEdges([]);
            setTimeout(() => {
                setNodes(historyState.nodes);
                setEdges(historyState.edges);
            }, 0);
        }
    };

    const redo = () => {
        if (currentHistoryIndex < history.length - 1) {
            setCurrentHistoryIndex(currentHistoryIndex + 1);
            const historyState = history[currentHistoryIndex + 1];
            setNodes([]);
            setEdges([]);
            setTimeout(() => {
                setNodes(historyState.nodes);
                setEdges(historyState.edges);
            }, 0);
        }
    };

    useEffect(() => {
        const loadedNodes = localStorage.getItem('workflowNodes');
        const loadedEdges = localStorage.getItem('workflowEdges');
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
                applyChanges(parsedNodes, parsedEdges);
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
            setEdges((prevEdges) => {
                // Aynı kaynağa sahip olan eski bağlantıları kaldır
                const filteredEdges = prevEdges.filter(
                    edge => !(edge.source === connection.source && edge.sourceHandle === connection.sourceHandle)
                );

                // Yeni bağlantıyı oluştur
                const newEdge = {
                    ...connection,
                    animated: true,
                    id: `${filteredEdges.length + 1}`,
                    type: 'customEdge',
                };

                // Kaynak düğümün answers alanındaki connect key'ini güncelle (eğer answers mevcutsa)
                setNodes((prevNodes) => {
                    return prevNodes.map(node => {
                        if (node.id === connection.source && node.data.answers) {
                            const updatedAnswers = node.data.answers.map((answer, index) => {
                                if (`choice-${index}` === connection.sourceHandle) {
                                    return { ...answer, connect: connection.target };
                                }
                                return answer;
                            });
                            return {
                                ...node,
                                data: {
                                    ...node.data,
                                    answers: updatedAnswers
                                }
                            };
                        }
                        return node;
                    });
                });

                return addEdge(newEdge, filteredEdges);
            });
            applyChanges(nodes, edges);
        },
        [nodes, edges, setEdges, setNodes, applyChanges]
    );

    const onNodeDragStop = useCallback(
        (event: NodeDragStopEvent, node: Node) => {
            const roundedPositions = nodes.map(n => ({
                ...n,
                position: { x: Math.round(n.position.x), y: Math.round(n.position.y) }
            }));
            setNodes(roundedPositions);
            applyChanges(roundedPositions, edges);
            localStorage.setItem('workflowNodes', JSON.stringify(roundedPositions));
        },
        [nodes, setNodes]
    );

    const handleDownload = useCallback(() => {
        const nodeData = nodes.reduce((acc, node) => {
            const connectedEdge = edges.find(edge => edge.source === node.id);
            const commonData = {
                connect: connectedEdge ? connectedEdge.target : undefined,
                position: node.position
            };

            if (node.type === 'pauseNode') {
                acc[node.id] = { ...commonData, pause: node.data.pause };
            } else if (node.type === 'commandNode') {
                acc[node.id] = { ...commonData, commands: node.data.commands };
            } else if (node.type === 'switchNode') {
                acc[node.id] = { ...commonData, switches: node.data.switches };
            } else if (node.type === 'customNode') {
                const answers = node.data.answers?.map(answer => ({
                    text: answer.text,
                    connect: connectedEdge ? connectedEdge.target : undefined
                }));
                acc[node.id] = { ...commonData, question: node.data.question, answers, isRandomOrder: node.data.isRandomOrder || false };
            }

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
                    const parsedNodes = Object.keys(data).map((key) => {
                        const nodeData = data[key];
                        let type = 'customNode';  // Default node type
                        if (nodeData.commands) {
                            type = 'commandNode';
                        } else if (nodeData.pause !== undefined) {
                            type = 'pauseNode';
                        } else if (nodeData.switches) {
                            type = 'switchNode';
                        }

                        return {
                            id: key,
                            type: type,
                            position: nodeData.position,
                            data: nodeData
                        };
                    });

                    const parsedEdges = parsedNodes.flatMap((node) =>
                        node.data.connect ? [{
                            id: `e${node.id}-${node.data.connect}`,
                            source: node.id,
                            sourceHandle: 'source',  // Assume default handle for simplicity
                            target: node.data.connect,
                            animated: true,
                            type: 'customEdge'
                        }] : []
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
        if (window.confirm('Are you sure you want to start a new diagram? This will erase the current diagram.')) {
            setNodes([]);
            setEdges([]);
            setTimeout(() => {
                setNodes(initialNodes);
                setEdges(initialEdges);
            }, 0);
        }
    }, [setNodes, setEdges]);

    const addNewNode = useCallback(() => {
        const newNode = {
            ...defaultNode,
            id: `Q${Math.floor(Math.random() * 9000000) + 1000000}`,
            position: { x: Math.random() * 250, y: Math.random() * 250 }
        };
        //add new node to the nodes array
        const newNodeStates = [...nodes, newNode];
        setNodes(newNodeStates);
        applyChanges(newNodeStates, edges);
    }, [nodes, setNodes]);

    const addPauseNode = useCallback(() => {
        const newNode = {
            id: `P${Math.floor(Math.random() * 9000000) + 1000000}`,
            type: 'pauseNode',
            position: { x: Math.random() * 250, y: Math.random() * 250 },
            data: { pause: 'Pause text' }
        };
        const newNodes = [...nodes, newNode];
        setNodes(newNodes);
        applyChanges(newNodes, edges);
    }, [nodes, setNodes]);

    const addCommandNode = useCallback(() => {
        const newNode = {
            id: `C${Math.floor(Math.random() * 9000000) + 1000000}`,
            type: 'commandNode',
            position: { x: Math.random() * 250, y: Math.random() * 250 },
            data: { commands: ["Enter command line"] }
        };
        const newNodes = [...nodes, newNode];
        setNodes(newNodes);
        applyChanges(newNodes, edges);
    }, [nodes, setNodes]);

    const addSwitchNode = useCallback(() => {
        const newNode = {
            id: `S${Math.floor(Math.random() * 9000000) + 1000000}`,
            type: 'switchNode',
            position: { x: Math.random() * 250, y: Math.random() * 250 },
            data: { switches: ['New switch'] }
        };
        const newNodes = [...nodes, newNode];
        setNodes(newNodes);
        applyChanges(newNodes, edges);
    }, [nodes, setNodes]);

    const handleNodeChange = useCallback((id, field, value) => {
        setNodes(prevNodes => prevNodes.map(node =>
            node.id === id ? { ...node, data: { ...node.data, [field]: value }} : node
        ));
//        applyChanges(nodes, edges);
        console.log('handleNodeChange applied changes');
    }, [setNodes]);

    const handleDataChange = useCallback((id, newData) => {
        setNodes(prevNodes => prevNodes.map(node =>
            node.id === id ? { ...node, data: { ...node.data, ...newData }} : node
        ));
//        applyChanges(nodes, edges);
        console.log('handleDataChange applied changes');
    }, [setNodes]);

    function redraw() {
        setNodes([]);
        setEdges([]);
        setTimeout(() => {
            setNodes(nodes);
            setEdges(edges);
        }, 0);
    }

    return (
        <Box height={'90vh'} width={'100vw'}>
            <Button onClick={redraw} m={2}>Redraw</Button>
            <input
                type="file"
                accept=".json"
                onChange={handleUpload}
                style={{display: 'none'}}
                id="upload-json"
            />
            <label htmlFor="upload-json">
                <Button as="span" m={2}>Upload</Button>
            </label>
            <Button onClick={handleDownload} >Download</Button>
            <Button onClick={newDiagram} m={2}>New</Button>
            <Button onClick={addNewNode} m={2}>+Qstn</Button>
            <Button onClick={addPauseNode} m={2}>+Pause</Button>
            <Button onClick={addCommandNode} m={2}>+Cmd</Button>
            <Button onClick={addSwitchNode} m={2}>+Switch</Button>
            <Button onClick={undo} m={2}>Undo</Button>
            <Button onClick={redo} m={2}>Redo</Button>
            <label>Undo {currentHistoryIndex} of {history.length-1}</label>
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
