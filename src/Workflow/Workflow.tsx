import React, { useEffect, useCallback, useState, useRef } from 'react';
import ReactFlow, {
    addEdge,
    Background,
    Controls,
    useEdgesState,
    useNodesState,
    Node,
    Connection,
    NodeDragStopEvent,
    MiniMap,
} from 'reactflow';
import 'reactflow/dist/style.css';
import { Box, Button } from '@chakra-ui/react';
import { initialEdges, initialNodes } from './Workflow.constants';
import './style.css';

import SwitchNode from './SwitchNode';
import CommandNode from './CommandNode';
import PauseNode from './PauseNode';
import CustomNode from './CustomNode';
import CustomEdge from './CustomEdge';
import { useLanguage } from './LanguageContext'; // Import the useLanguage hook

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
    const [history, setHistory] = useState([{ nodes: initialNodes, edges: initialEdges }]);
    const [currentHistoryIndex, setCurrentHistoryIndex] = useState(0);
    const { language, toggleLanguage } = useLanguage(); // Use language from context

    const isUndoRedo = useRef(false); // Bayrak
    const isProgrammaticChange = useRef(false); // Programatik değişiklik bayrağı

    const applyChanges = (newNodes, newEdges) => {
        if (isProgrammaticChange.current) return;
        console.log("changes applied");
        const newHistory = history.slice(0, currentHistoryIndex + 1);
        newHistory.push({ nodes: newNodes, edges: newEdges });
        setHistory(newHistory);
        setCurrentHistoryIndex(newHistory.length - 1);
    };

    const applyHistoryState = (historyState) => {
        console.log("applyChanges from applyHistoryState function");
        isUndoRedo.current = true; // Undo veya Redo işlemi yapılıyor
        isProgrammaticChange.current = true;
        setNodes(historyState.nodes);
        setEdges(historyState.edges);
        isProgrammaticChange.current = false;
    };

    const undo = () => {
        if (currentHistoryIndex > 0) {
            const historyState = history[currentHistoryIndex - 1];
            setCurrentHistoryIndex(currentHistoryIndex - 1);
            applyHistoryState(historyState);
        }
    };

    const redo = () => {
        if (currentHistoryIndex < history.length - 1) {
            const historyState = history[currentHistoryIndex + 1];
            setCurrentHistoryIndex(currentHistoryIndex + 1);
            applyHistoryState(historyState);
        }
    };

    useEffect(() => {
        if (isUndoRedo.current) {
            isUndoRedo.current = false; // Undo veya Redo işlemi tamamlandı
            return;
        }
        localStorage.setItem('workflowNodes', JSON.stringify(nodes));
        localStorage.setItem('workflowEdges', JSON.stringify(edges));
    }, [nodes, edges]);

    useEffect(() => {
        const loadedNodes = localStorage.getItem('workflowNodes');
        const loadedEdges = localStorage.getItem('workflowEdges');
        if (loadedNodes && loadedEdges) {
            try {
                const parsedNodes = JSON.parse(loadedNodes);
                const parsedEdges = JSON.parse(loadedEdges);
                isProgrammaticChange.current = true;
                setNodes(parsedNodes);
                setEdges(parsedEdges);
                isProgrammaticChange.current = false;
                console.log("applyChanges from useEffect for localStorage load");
                applyChanges(parsedNodes, parsedEdges);
            } catch (error) {
                console.error("Parsing error: ", error);
            }
        }
    }, []);

    const onConnect = useCallback((connection: Connection) => {
        const newEdge = {
            ...connection,
            animated: true,
            id: `${connection.source}-${connection.sourceHandle}-${connection.target}`,
            type: 'customEdge',
        };

        // Remove existing edge from the same source handle
        const existingEdges = edges.filter(edge => edge.source === connection.source && edge.sourceHandle === connection.sourceHandle);

        // Create the new edges list with the new edge added
        const newEdges = addEdge(newEdge, edges.filter(edge => !existingEdges.includes(edge)));

        setEdges(newEdges);
        console.log("applyChanges from onConnect function");
        applyChanges(nodes, newEdges);
    }, [nodes, edges, setEdges]);

    const onNodesChangeWrapper = useCallback((changes) => {
        if (isProgrammaticChange.current) return; // Programatik değişiklik sırasında tetiklenmemesi için kontrol
        onNodesChange(changes);
    }, [edges, onNodesChange]);

    const onEdgesChangeWrapper = useCallback((changes) => {
        if (isProgrammaticChange.current) return; // Programatik değişiklik sırasında tetiklenmemesi için kontrol
        onEdgesChange(changes);
    }, [nodes, onEdgesChange]);

    const onNodeDragStop = useCallback((event: NodeDragStopEvent, node: Node) => {
        const roundedPositions = nodes.map(n => ({
            ...n,
            position: { x: Math.round(n.position.x), y: Math.round(n.position.y) }
        }));
        isProgrammaticChange.current = true;
        setNodes(roundedPositions);
        isProgrammaticChange.current = false;
        console.log("applyChanges from onNodeDragStop function");
        applyChanges(roundedPositions, edges);
    }, [nodes, setNodes, edges]);

    const exportWorkflow = useCallback(() => {
        const nodeData = nodes.map(node => {
            const outgoingEdges = edges.filter(edge => edge.source === node.id);
            const commonData = { id: node.id };

            switch (node.type) {
                case 'pauseNode':
                    const pauseConnect = outgoingEdges.length > 0 ? outgoingEdges[0].target : null;
                    return { ...commonData, pause: node.data.pause, connect: pauseConnect };
                case 'commandNode':
                    const commandConnect = outgoingEdges.length > 0 ? outgoingEdges[0].target : null;
                    return { ...commonData, commands: node.data.commands, connect: commandConnect };
                case 'switchNode':
                    const switches = node.data.switches.map((sw, index) => {
                        const connection = outgoingEdges.find(edge => edge.sourceHandle === `source-${index}`);
                        return { ...sw, connect: connection ? connection.target : null };
                    });
                    return { ...commonData, switches };
                case 'customNode':
                    const answers = node.data.answers.map((answer, index) => {
                        const connection = outgoingEdges.find(edge => edge.sourceHandle === `choice-${index}`);
                        return { ...answer, connect: connection ? connection.target : null };
                    });
                    return { ...commonData, question: node.data.question, answers };
                default:
                    return commonData;
            }
        });

        const data = JSON.stringify(nodeData, null, 2);
        const blob = new Blob([data], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = 'workflow.json';
        link.click();
        link.remove();
    }, [nodes, edges]);

    const saveToFile = useCallback(() => {
        const workflowData = { nodes, edges };
        const data = JSON.stringify(workflowData, null, 2);
        const blob = new Blob([data], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = 'workflowData.json';
        link.click();
        link.remove();
    }, [nodes, edges]);

    const loadFromFile = useCallback((event) => {
        const file = event.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                try {
                    const data = JSON.parse(e.target.result);
                    isProgrammaticChange.current = true;
                    setNodes(data.nodes || []);
                    setEdges(data.edges || []);
                    isProgrammaticChange.current = false;
                    console.log("applyChanges from loadFromFile function");
                    applyChanges(data.nodes || [], data.edges || []);
                } catch (error) {
                    console.error("File parsing error: ", error);
                }
            };
            reader.readAsText(file);
        }
    }, [setNodes, setEdges]);

    const newDiagram = useCallback(() => {
        if (window.confirm('Are you sure you want to start a new diagram? This will erase the current diagram.')) {
            isProgrammaticChange.current = true;
            setNodes(initialNodes);
            setEdges(initialEdges);
            isProgrammaticChange.current = false;
            console.log("applyChanges from newDiagram function");
            applyChanges(initialNodes, initialEdges);
        }
    }, [setNodes, setEdges]);

    const addNewNode = useCallback(() => {
        const newNode = {
            ...defaultNode,
            id: `Q${Math.floor(Math.random() * 9000000) + 1000000}`,
            position: { x: Math.random() * 250, y: Math.random() * 250 }
        };
        isProgrammaticChange.current = true;
        const newNodeStates = [...nodes, newNode];
        setNodes(newNodeStates);
        isProgrammaticChange.current = false;
        console.log("applyChanges from addNewNode function");
        applyChanges(newNodeStates, edges);
    }, [nodes, setNodes, edges]);

    const addPauseNode = useCallback(() => {
        const newNode = {
            id: `P${Math.floor(Math.random() * 9000000) + 1000000}`,
            type: 'pauseNode',
            position: { x: Math.random() * 250, y: Math.random() * 250 },
            data: { pause: 'Pause text' }
        };
        isProgrammaticChange.current = true;
        const newNodes = [...nodes, newNode];
        setNodes(newNodes);
        isProgrammaticChange.current = false;
        console.log("applyChanges from addPauseNode function");
        applyChanges(newNodes, edges);
    }, [nodes, setNodes, edges]);

    const addCommandNode = useCallback(() => {
        const newNode = {
            id: `C${Math.floor(Math.random() * 9000000) + 1000000}`,
            type: 'commandNode',
            position: { x: Math.random() * 250, y: Math.random() * 250 },
            data: { commands: ["Enter command line"] }
        };
        isProgrammaticChange.current = true;
        const newNodes = [...nodes, newNode];
        setNodes(newNodes);
        isProgrammaticChange.current = false;
        console.log("applyChanges from addCommandNode function");
        applyChanges(newNodes, edges);
    }, [nodes, setNodes, edges]);

    const addSwitchNode = useCallback(() => {
        const newNode = {
            id: `S${Math.floor(Math.random() * 9000000) + 1000000}`,
            type: 'switchNode',
            position: { x: Math.random() * 250, y: Math.random() * 250 },
            data: { switches: [{ text: 'Switch text', connect: '' }] }
        };
        isProgrammaticChange.current = true;
        const newNodes = [...nodes, newNode];
        setNodes(newNodes);
        isProgrammaticChange.current = false;
        console.log("applyChanges from addSwitchNode function");
        applyChanges(newNodes, edges);
    }, [nodes, setNodes, edges]);

    const handleNodeChange = useCallback((id, field, value) => {
        if (isUndoRedo.current || isProgrammaticChange.current) return; // Undo veya Redo sırasında tetiklenmemesi için kontrol
        setNodes(prevNodes => prevNodes.map(node =>
            node.id === id ? { ...node, data: { ...node.data, [field]: value } } : node
        ));
//        console.log("applyChanges from handleNodeChange function");
//        applyChanges(nodes, edges);
    }, [nodes, setNodes, edges]);

    const handleDataChange = useCallback((id, newData) => {
        if (isUndoRedo.current || isProgrammaticChange.current) return; // Undo veya Redo sırasında tetiklenmemesi için kontrol
        setNodes(prevNodes => prevNodes.map(node => {
            if (node.id === id) {
                const oldData = node.data;
                const oldSwitches = oldData.switches || [];
                const newSwitches = newData.switches || [];

                const removedSwitchIds = oldSwitches
                    .filter(oldSw => !newSwitches.some(newSw => newSw.id === oldSw.id))
                    .map(sw => sw.id);
                setEdges(prevEdges => prevEdges.filter(edge => {
                    const sourceHandleId = edge.sourceHandle ? edge.sourceHandle.replace('source-', '') : null;
                    return !removedSwitchIds.includes(sourceHandleId);
                }));

                return { ...node, data: { ...node.data, ...newData } };
            }
            return node;
        }));
//        console.log("applyChanges from handleDataChange function");
//        applyChanges(nodes, edges);
    }, [nodes, setNodes, setEdges, edges]);

    return (
        <Box height={'90vh'} width={'100vw'}>
            <Button onClick={() => setNodes([]) & setEdges([]) & setNodes(nodes) & setEdges(edges)} m={2}>Redraw</Button>
            <input
                type="file"
                accept=".json"
                onChange={loadFromFile}
                style={{ display: 'none' }}
                id="load-file"
            />
            <label htmlFor="load-file">
                <Button as="span" m={2}>Load</Button>
            </label>
            <Button onClick={saveToFile} m={2}>Save</Button>
            <Button onClick={exportWorkflow} m={2}>Export</Button>
            <Button onClick={toggleLanguage} m={2}>Lang {language}</Button>
            <Button onClick={newDiagram} m={2}>New</Button>
            <Button backgroundColor="#A3D8F4" onClick={addNewNode} m={2}>+Qstn</Button>
            <Button backgroundColor="#B9E2C8" onClick={addPauseNode} m={2}>+Pause</Button>
            <Button backgroundColor="#FFFACD" onClick={addCommandNode} m={2}>+Cmd</Button>
            <Button backgroundColor="#F4C1D9" onClick={addSwitchNode} m={2}>+Switch</Button>
            <Button onClick={undo} m={2}>Undo</Button>
            <Button onClick={redo} m={2}>Redo</Button>
            <label>Undo {currentHistoryIndex} of {history.length - 1}</label>
            <label> ( n:{nodes.length} e:{edges.length} )</label>

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
                onNodesChange={onNodesChangeWrapper}
                onEdgesChange={onEdgesChangeWrapper}
                onConnect={onConnect}
                onNodeDragStop={onNodeDragStop}
                nodeTypes={nodeTypes}
                edgeTypes={edgeTypes}
                snapToGrid
                snapGrid={[20, 20]}
                fitView
                minZoom={0.1} // Set the minimum zoom level
                maxZoom={4} // Set the maximum zoom level
            >
                <MiniMap
                    pannable
                    zoomable={true}
                    zoomStep={0.5}
                    nodeStrokeWidth={3}
                    nodeColor={node => {
                        switch (node.type) {
                            case 'pauseNode': return '#B9E2C8';
                            case 'commandNode': return '#FFFACD';
                            case 'switchNode': return '#F4C1D9';
                            case 'customNode': return '#A3D8F4';
                            default: return '#eee';
                        }
                    }}
                />
                <Background />
                <Controls />
            </ReactFlow>
        </Box>
    );
};

export default Workflow;
