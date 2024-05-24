import React, {useEffect, useCallback, useState} from 'react';
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
import {Box, Button} from '@chakra-ui/react';
import {initialEdges, initialNodes} from './Workflow.constants';
import DevTools from './Devtools';
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
    position: {x: 250, y: 5},
    data: {label: 'New Node'}
};

export const Workflow = () => {
    const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
    const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
    const [viewDevTools, setViewDevTools] = React.useState(false);

    const [history, setHistory] = useState([{nodes: initialNodes, edges: initialEdges}]);
    const [currentHistoryIndex, setCurrentHistoryIndex] = useState(0);
    const { language, toggleLanguage } = useLanguage(); // Use language from context


    const applyChanges = (newNodes, newEdges) => {
        const newHistory = history.slice(0, currentHistoryIndex + 1); // Mevcut indeksten sonraki geçmişi temizle
        newHistory.push({nodes: newNodes, edges: newEdges});
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

    const onConnect = useCallback((connection: Connection) => {
        setEdges((prevEdges) => {
            // Eski bağlantıları id üzerinden filtrele
            const filteredEdges = prevEdges.filter(
                edge => !(edge.source === connection.source && edge.sourceHandle === connection.sourceHandle)
            );

            // Yeni bağlantıyı id ile oluştur
            const newEdge = {
                ...connection,
                animated: true,
                id: `${connection.source}-${connection.sourceHandle}`,  // Benzersiz ID atama
                type: 'customEdge',
            };

            return addEdge(newEdge, filteredEdges);
        });
        applyChanges(nodes, edges);
    }, [nodes, edges, setEdges, setNodes, applyChanges]);

    const onNodeDragStop = useCallback(
        (event: NodeDragStopEvent, node: Node) => {
            const roundedPositions = nodes.map(n => ({
                ...n,
                position: {x: Math.round(n.position.x), y: Math.round(n.position.y)}
            }));
            setNodes(roundedPositions);
            applyChanges(roundedPositions, edges);
            localStorage.setItem('workflowNodes', JSON.stringify(roundedPositions));
        },
        [nodes, setNodes]
    );

    const exportWorkflow = useCallback(() => {
        const nodeData = nodes.map(node => {
            // Bu node'dan çıkan tüm bağlantıları bul
            const outgoingEdges = edges.filter(edge => edge.source === node.id);

            const commonData = {
                id: node.id,
            };

            switch (node.type) {
                case 'pauseNode':
                    // Pause node için tek bir bağlantı al
                    const pauseConnect = outgoingEdges.length > 0 ? outgoingEdges[0].target : null;
                    return {
                        ...commonData,
                        pause: node.data.pause,
                        connect: pauseConnect
                    };
                case 'commandNode':
                    // Command node için tüm komutları array olarak ekle ve tek bir bağlantı al
                    const commandConnect = outgoingEdges.length > 0 ? outgoingEdges[0].target : null;
                    return {
                        ...commonData,
                        commands: node.data.commands,
                        connect: commandConnect
                    };
                case 'switchNode':
                    // Switch node için tüm switch'leri array olarak ekle ve her switch için bağlantı al
                    const switches = node.data.switches.map((sw, index) => {
                        const connection = outgoingEdges.find(edge => edge.sourceHandle === `source-${index}`);
                        return { ...sw, connect: connection ? connection.target : null };
                    });
                    return {
                        ...commonData,
                        switches,
                    };
                case 'customNode':
                    // Custom node için tüm cevapları array olarak ekle ve her cevap için bağlantı al
                    const answers = node.data.answers.map((answer, index) => {
                        const connection = outgoingEdges.find(edge => edge.sourceHandle === `choice-${index}`);
                        return { ...answer, connect: connection ? connection.target : null };
                    });
                    return {
                        ...commonData,
                        answers,
                    };
                default:
                    return commonData;
            }
        });

        const data = JSON.stringify(nodeData, null, 2);
        const blob = new Blob([data], {type: 'application/json'});
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = 'workflow.json';
        link.click();
        link.remove();
    }, [nodes, edges]);

    const saveToFile = useCallback(() => {
        const workflowData = {
            nodes,
            edges
        };
        const data = JSON.stringify(workflowData, null, 2);
        const blob = new Blob([data], {type: 'application/json'});
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
                    setNodes([]);
                    setEdges([]);
                    setTimeout(() => {
                        setNodes(data.nodes || []);
                        setEdges(data.edges || []);
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
            position: {x: Math.random() * 250, y: Math.random() * 250}
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
            position: {x: Math.random() * 250, y: Math.random() * 250},
            data: {pause: 'Pause text'}
        };
        const newNodes = [...nodes, newNode];
        setNodes(newNodes);
        applyChanges(newNodes, edges);
    }, [nodes, setNodes]);

    const addCommandNode = useCallback(() => {
        const newNode = {
            id: `C${Math.floor(Math.random() * 9000000) + 1000000}`,
            type: 'commandNode',
            position: {x: Math.random() * 250, y: Math.random() * 250},
            data: {commands: ["Enter command line"]}
        };
        const newNodes = [...nodes, newNode];
        setNodes(newNodes);
        applyChanges(newNodes, edges);
    }, [nodes, setNodes]);

    const addSwitchNode = useCallback(() => {
        const newNode = {
            id: `S${Math.floor(Math.random() * 9000000) + 1000000}`,
            type: 'switchNode',
            position: {x: Math.random() * 250, y: Math.random() * 250},
            data: {switches: [{text: 'Switch text', connect: ''}]}
        };
        const newNodes = [...nodes, newNode];
        setNodes(newNodes);
        applyChanges(newNodes, edges);
    }, [nodes, setNodes]);

    const handleNodeChange = useCallback((id, field, value) => {
        setNodes(prevNodes => prevNodes.map(node =>
            node.id === id ? {...node, data: {...node.data, [field]: value}} : node
        ));
    }, [setNodes]);

    const handleDataChange = useCallback((id, newData) => {
        setNodes(prevNodes => prevNodes.map(node => {
            if (node.id === id) {
                // İlişkili edge'leri kontrol et ve gerekiyorsa güncelle
                const oldData = node.data;
                const oldSwitches = oldData.switches || [];
                const newSwitches = newData.switches || [];

                const removedSwitchIds = oldSwitches.filter(oldSw => !newSwitches.some(newSw => newSw.id === oldSw.id)).map(sw => sw.id);
                setEdges(prevEdges => prevEdges.filter(edge => !removedSwitchIds.includes(edge.sourceHandle.replace('source-', ''))));

                return { ...node, data: { ...node.data, ...newData } };
            }
            return node;
        }));
    }, [setNodes, setEdges]);


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
                onChange={loadFromFile}
                style={{display: 'none'}}
                id="load-file"
            />
            <label htmlFor="load-file">
                <Button as="span" m={2}>Load</Button>
            </label>
            <Button onClick={saveToFile} m={2}>Save</Button>
            <Button onClick={exportWorkflow}>Export</Button>
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
