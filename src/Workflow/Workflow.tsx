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
    MiniMap, Edge,
    OnSelectionChangeParams,
} from 'reactflow';
import 'reactflow/dist/style.css';
import { Box, Button, IconButton, Textarea, VStack, HStack, Text, Divider } from '@chakra-ui/react';
import { FaLock, FaUnlock, FaRedo, FaUndo, FaCopy, FaPaste, FaFileExport, FaFileImport, FaLanguage, FaPlus, FaQuestionCircle, FaPause, FaTerminal, FaExchangeAlt, FaSignOutAlt, FaFileAlt, FaTrash } from 'react-icons/fa';
import { initialEdges, initialNodes } from './Workflow.constants';
import './style.css';

import SwitchNode from './SwitchNode';
import CommandNode from './CommandNode';
import PauseNode from './PauseNode';
import CustomNode from './CustomNode';
import CustomEdge from './CustomEdge';
import { useLanguage } from './LanguageContext'; // Import the useLanguage hook
import { useEdit } from './EditContext';
import LanguageConfig from './LanguageConfig';
import {TbClipboardCopy, TbDownload, TbRefresh, TbUpload} from "react-icons/tb";
import {GrClone} from "react-icons/gr";
import {ImFileEmpty} from "react-icons/im";

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

interface WorkflowProps {
    onLogout?: () => void;
}

export const Workflow = ({ onLogout }: WorkflowProps = {}) => {
    const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
    const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
    const [descriptions, setDescriptions] = useState<{en: string, tr: string}[]>([]);
    const [isDescriptionPanelOpen, setIsDescriptionPanelOpen] = useState(false);
    const [panelWidth, setPanelWidth] = useState(300);
    const [history, setHistory] = useState([{ nodes: initialNodes, edges: initialEdges, descriptions: [] }]);
    const [currentHistoryIndex, setCurrentHistoryIndex] = useState(0);
    const { language, currentLanguage, selectedLanguages, switchToLanguage, availableLanguages, updateSelectedLanguages, registerLanguagesUpdateCallback } = useLanguage(); // Use language from context
    const isUndoRedo = useRef(false); // Bayrak
    const isProgrammaticChange = useRef(false); // Programatik değişiklik bayrağı
    const [isNodesLocked, setIsNodesLocked] = useState(false); // Node kilit durumu

    const [highlightedNodes, setHighlightedNodes] = useState([]);
    const [highlightedEdges, setHighlightedEdges] = useState([]);
    const { editingNodeId, setEditingNodeId } = useEdit();

    const toggleNodesLock = () => {
        setIsNodesLocked(prevState => !prevState);
    };

    const applyChanges = (newNodes, newEdges, newDescriptions = descriptions) => {
        if (isProgrammaticChange.current) return;
        const newHistory = history.slice(0, currentHistoryIndex + 1);
        newHistory.push({ nodes: newNodes, edges: newEdges, descriptions: newDescriptions });
        setHistory(newHistory);
        setCurrentHistoryIndex(newHistory.length - 1);
    };

    const applyHistoryState = (historyState) => {
        isUndoRedo.current = true; // Undo veya Redo işlemi yapılıyor
        isProgrammaticChange.current = true;

        setNodes([]);
        setEdges([]);
        setDescriptions([]);

        setTimeout(() => {
            setNodes(historyState.nodes);
            setEdges(historyState.edges);
            setDescriptions(historyState.descriptions || []);
            isProgrammaticChange.current = false;
        }, 0);
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
        if (nodes.length === 0 && edges.length === 0) {
            return;
        }

        localStorage.setItem('workflowNodes', JSON.stringify(nodes));
        localStorage.setItem('workflowEdges', JSON.stringify(edges));
        localStorage.setItem('workflowDescriptions', JSON.stringify(descriptions));
        console.log('Workflow saved to local storage');

        if (isUndoRedo.current) {
            isUndoRedo.current = false; // Undo veya Redo işlemi tamamlandı
            return;
        }
    }, [nodes, edges, descriptions, selectedLanguages]);


    useEffect(() => {
        const loadedNodes = localStorage.getItem('workflowNodes');
        const loadedEdges = localStorage.getItem('workflowEdges');
        const loadedDescriptions = localStorage.getItem('workflowDescriptions');
        if (loadedNodes && loadedEdges) {
            try {
                const parsedNodes = JSON.parse(loadedNodes);
                const parsedEdges = JSON.parse(loadedEdges);
                const parsedDescriptions = loadedDescriptions ? JSON.parse(loadedDescriptions) : [];
                isProgrammaticChange.current = true;
                setNodes(parsedNodes);
                setEdges(parsedEdges);
                setDescriptions(parsedDescriptions);
                isProgrammaticChange.current = false;
                applyChanges(parsedNodes, parsedEdges, parsedDescriptions);
                console.log('Workflow loaded from local storage');
            } catch (error) {
                console.error("Parsing error: ", error);
            }
        }
    }, []);

    // Register callback for new language additions
    useEffect(() => {
        registerLanguagesUpdateCallback((newLanguages) => {
            updateNodesWithNewLanguages(newLanguages);
        });
    }, [nodes, descriptions]);

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
        applyChanges(roundedPositions, edges);
    }, [nodes, setNodes, edges]);

    const exportWorkflow = useCallback(() => {
        const exportData: any = {};
        
        // Add languages at the very top
        exportData.languages = selectedLanguages;
        
        // Add descriptions (filtered to selected languages only)
        if (descriptions.length > 0) {
            const filteredDescriptions = descriptions.map(desc => {
                const filteredDesc = {};
                selectedLanguages.forEach(lang => {
                    if (desc[lang]) {
                        filteredDesc[lang] = desc[lang];
                    }
                });
                return filteredDesc;
            });
            exportData.description = filteredDescriptions;
        }
        
        const nodeData = {};
        nodes.forEach(node => {
            const outgoingEdges = edges.filter(edge => edge.source === node.id);
            const commonData = {
                position: node.position,
                id: node.id
            };

            switch (node.type) {
                case 'pauseNode':
                    const pauseConnect = outgoingEdges.length > 0 ? outgoingEdges[0].target : null;
                    nodeData[node.id] = { pause: node.data.pause, connect: pauseConnect, position: node.position };
                    break;
                case 'commandNode':
                    const commandConnect = outgoingEdges.length > 0 ? outgoingEdges[0].target : null;
                    nodeData[node.id] = { commands: node.data.commands, connect: commandConnect, position: node.position };
                    break;
                case 'switchNode':
                    const switches = node.data.switches.map(sw => {
                        const connection = outgoingEdges.find(edge => edge.sourceHandle === sw.id);
                        return { ...sw, connect: connection ? connection.target : null };
                    });
                    nodeData[node.id] = { switches, position: node.position };
                    break;
                case 'customNode':
                    // Filter question object to only include selected languages
                    const filteredQuestion = {};
                    selectedLanguages.forEach(lang => {
                        if (node.data.question && node.data.question[lang]) {
                            filteredQuestion[lang] = node.data.question[lang];
                        }
                    });

                    // Filter answers to only include selected languages
                    const answers = node.data.answers.map(answer => {
                        const connection = outgoingEdges.find(edge => edge.sourceHandle === answer.id);
                        const filteredText = {};
                        selectedLanguages.forEach(lang => {
                            if (answer.text && answer.text[lang]) {
                                filteredText[lang] = answer.text[lang];
                            }
                        });
                        return { 
                            ...answer, 
                            text: filteredText,
                            connect: connection ? connection.target : null 
                        };
                    });
                    
                    const questionConnection = answers.length === 0
                        ? outgoingEdges.find(edge => edge.sourceHandle === "question-source-handle")?.target || null
                        : null;
                    nodeData[node.id] = {
                        question: filteredQuestion,
                        answers,
                        isRandomOrder: node.data.isRandomOrder,
                        isIconNode: node.data.isIconNode,
                        position: node.position,
                        connect: questionConnection
                    };
                    break;
                default:
                    nodeData[node.id] = commonData;
                    break;
            }
        });

        // Merge descriptions and node data
        const finalData = { ...exportData, ...nodeData };
        const data = JSON.stringify(finalData, null, 2);
        const blob = new Blob([data], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = 'workflow.json';
        link.click();
        link.remove();
    }, [nodes, edges, descriptions, selectedLanguages]);

    const exportToClipboard = useCallback(() => {
        const exportData: any = {};
        
        // Add languages at the very top
        exportData.languages = selectedLanguages;
        
        // Add descriptions (filtered to selected languages only)
        if (descriptions.length > 0) {
            const filteredDescriptions = descriptions.map(desc => {
                const filteredDesc = {};
                selectedLanguages.forEach(lang => {
                    if (desc[lang]) {
                        filteredDesc[lang] = desc[lang];
                    }
                });
                return filteredDesc;
            });
            exportData.description = filteredDescriptions;
        }
        
        const nodeData = {};
        nodes.forEach(node => {
            const outgoingEdges = edges.filter(edge => edge.source === node.id);
            const commonData = {
                position: node.position,
                id: node.id
            };

            switch (node.type) {
                case 'pauseNode':
                    const pauseConnect = outgoingEdges.length > 0 ? outgoingEdges[0].target : null;
                    nodeData[node.id] = { pause: node.data.pause, connect: pauseConnect, position: node.position };
                    break;
                case 'commandNode':
                    const commandConnect = outgoingEdges.length > 0 ? outgoingEdges[0].target : null;
                    nodeData[node.id] = { commands: node.data.commands, connect: commandConnect, position: node.position };
                    break;
                case 'switchNode':
                    const switches = node.data.switches.map(sw => {
                        const connection = outgoingEdges.find(edge => edge.sourceHandle === sw.id);
                        return { ...sw, connect: connection ? connection.target : null };
                    });
                    nodeData[node.id] = { switches, position: node.position };
                    break;
                case 'customNode':
                    // Filter question object to only include selected languages
                    const filteredQuestion2 = {};
                    selectedLanguages.forEach(lang => {
                        if (node.data.question && node.data.question[lang]) {
                            filteredQuestion2[lang] = node.data.question[lang];
                        }
                    });

                    // Filter answers to only include selected languages
                    const answers = node.data.answers.map(answer => {
                        const connection = outgoingEdges.find(edge => edge.sourceHandle === answer.id);
                        const filteredText = {};
                        selectedLanguages.forEach(lang => {
                            if (answer.text && answer.text[lang]) {
                                filteredText[lang] = answer.text[lang];
                            }
                        });
                        return { 
                            ...answer, 
                            text: filteredText,
                            connect: connection ? connection.target : null 
                        };
                    });
                    
                    const questionConnection = answers.length === 0
                        ? outgoingEdges.find(edge => edge.sourceHandle === "question-source-handle")?.target || null
                        : null;
                    nodeData[node.id] = {
                        question: filteredQuestion2,
                        answers,
                        isRandomOrder: node.data.isRandomOrder,
                        isIconNode: node.data.isIconNode,
                        position: node.position,
                        connect: questionConnection
                    };
                    break;
                default:
                    nodeData[node.id] = commonData;
                    break;
            }
        });

        // Merge descriptions and node data
        const finalData = { ...exportData, ...nodeData };
        const data = JSON.stringify(finalData, null, 2);
        navigator.clipboard.writeText(data).then(() => {
            console.log('Workflow copied to clipboard');
        }).catch(err => {
            console.error('Error copying workflow to clipboard: ', err);
        });
    }, [nodes, edges, descriptions, selectedLanguages]);

    const importFromClipboard = useCallback(async () => {
        try {
            const text = await navigator.clipboard.readText();
            const data = JSON.parse(text);
            
            // Extract and update languages if they exist
            if (data.languages && Array.isArray(data.languages)) {
                updateSelectedLanguages(data.languages);
            }
            delete data.languages;
            
            // Extract descriptions if they exist
            let importedDescriptions = data.description || [];
            // Convert old string format to new multi-language format if needed
            if (importedDescriptions.length > 0 && typeof importedDescriptions[0] === 'string') {
                importedDescriptions = importedDescriptions.map((desc: string) => ({
                    en: desc,
                    tr: desc
                }));
            }
            delete data.description;

            const newNodes = Object.keys(data).map(key => {
                let type = 'customNode'; // Varsayılan node tipi

                // Node tipini ID'nin baş harfine göre belirle
                if (key.startsWith('P')) {
                    type = 'pauseNode';
                } else if (key.startsWith('C')) {
                    type = 'commandNode';
                } else if (key.startsWith('S')) {
                    type = 'switchNode';
                } else if (key.startsWith('Q')) {
                    type = 'customNode';
                }

                return {
                    id: key,
                    type: type,
                    position: data[key].position || { x: 0, y: 0 },
                    data: {
                        ...data[key],
                        id: key,
                        isRandomOrder: data[key].isRandomOrder || false,
                        isIconNode: data[key].isIconNode || false,
                    }
                };
            });

            const newEdges = [];
            Object.keys(data).forEach(key => {
                if (data[key].answers) {
                    data[key].answers.forEach(answer => {
                        if (answer.connect) {
                            newEdges.push({
                                id: `${key}-${answer.id}-${answer.connect}`,
                                source: key,
                                sourceHandle: answer.id,
                                target: answer.connect,
                                type: 'customEdge',
                                animated: true,
                            });
                        }
                    });
                }
                if (data[key].switches) {
                    data[key].switches.forEach(sw => {
                        if (sw.connect) {
                            newEdges.push({
                                id: `${key}-${sw.id}-${sw.connect}`,
                                source: key,
                                sourceHandle: sw.id,
                                target: sw.connect,
                                type: 'customEdge',
                                animated: true,
                            });
                        }
                    });
                }
                if (data[key].connect) {
                    newEdges.push({
                        id: `${key}-question-source-handle-${data[key].connect}`,
                        source: key,
                        sourceHandle: 'question-source-handle',
                        target: data[key].connect,
                        type: 'customEdge',
                        animated: true,
                    });
                }
                if (data[key].connect) {
                    newEdges.push({
                        id: `${key}-${data[key].connect}`,
                        source: key,
                        target: data[key].connect,
                        type: 'customEdge',
                        animated: true,
                    });
                }
            });

            isProgrammaticChange.current = true;
            setNodes(newNodes);
            setEdges(newEdges);
            setDescriptions(importedDescriptions);
            isProgrammaticChange.current = false;
            applyChanges(newNodes, newEdges, importedDescriptions);
        } catch (error) {
            console.error("Clipboard parsing error: ", error);
        }
    }, [setNodes, setEdges, applyChanges, updateSelectedLanguages]);

    const importWorkflow = useCallback((event) => {
        const file = event.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                try {
                    const data = JSON.parse(e.target.result);
                    
                    // Extract and update languages if they exist
                    if (data.languages && Array.isArray(data.languages)) {
                        updateSelectedLanguages(data.languages);
                    }
                    delete data.languages;
                    
                    // Extract descriptions if they exist
                    let importedDescriptions = data.description || [];
                    // Convert old string format to new multi-language format if needed
                    if (importedDescriptions.length > 0 && typeof importedDescriptions[0] === 'string') {
                        importedDescriptions = importedDescriptions.map((desc: string) => ({
                            en: desc,
                            tr: desc
                        }));
                    }
                    delete data.description;
                    const newNodes = Object.keys(data).map(key => {
                        let type = 'customNode'; // Varsayılan node tipi

                        // Node tipini ID'nin baş harfine göre belirle
                        if (key.startsWith('P')) {
                            type = 'pauseNode';
                        } else if (key.startsWith('C')) {
                            type = 'commandNode';
                        } else if (key.startsWith('S')) {
                            type = 'switchNode';
                        } else if (key.startsWith('Q')) {
                            type = 'customNode';
                        }

                        return {
                            id: key,
                            type: type,
                            position: data[key].position || { x: 0, y: 0 },
                            data: {
                                ...data[key],
                                id: key,
                                isRandomOrder: data[key].isRandomOrder || false,
                                isIconNode: data[key].isIconNode || false,
                            }
                        };
                    });

                    const newEdges = [];
                    Object.keys(data).forEach(key => {
                        if (data[key].answers) {
                            data[key].answers.forEach(answer => {
                                if (answer.connect) {
                                    newEdges.push({
                                        id: `${key}-${answer.id}-${answer.connect}`,
                                        source: key,
                                        sourceHandle: answer.id,
                                        target: answer.connect,
                                        type: 'customEdge',
                                        animated: true,
                                    });
                                }
                            });
                        }
                        if (data[key].switches) {
                            data[key].switches.forEach(sw => {
                                if (sw.connect) {
                                    newEdges.push({
                                        id: `${key}-${sw.id}-${sw.connect}`,
                                        source: key,
                                        sourceHandle: sw.id,
                                        target: sw.connect,
                                        type: 'customEdge',
                                        animated: true,
                                    });
                                }
                            });
                        }
                        if (data[key].connect) {
                            newEdges.push({
                                id: `${key}-question-source-handle-${data[key].connect}`,
                                source: key,
                                sourceHandle: 'question-source-handle',
                                target: data[key].connect,
                                type: 'customEdge',
                                animated: true,
                            });
                        }
                        if (data[key].connect) {
                            newEdges.push({
                                id: `${key}-${data[key].connect}`,
                                source: key,
                                target: data[key].connect,
                                type: 'customEdge',
                                animated: true,
                            });
                        }
                    });

                    isProgrammaticChange.current = true;
                    setNodes(newNodes);
                    setEdges(newEdges);
                    setDescriptions(importedDescriptions);
                    isProgrammaticChange.current = false;
                    applyChanges(newNodes, newEdges, importedDescriptions);
                } catch (error) {
                    console.error("File parsing error: ", error);
                }
            };
            reader.readAsText(file);
        }
    }, [setNodes, setEdges, applyChanges, updateSelectedLanguages]);

    const newDiagram = useCallback(() => {
        if (window.confirm('Are you sure you want to start a new diagram? This will erase the current diagram.')) {
            isProgrammaticChange.current = true;
            setNodes(initialNodes);
            setEdges(initialEdges);
            setDescriptions([]);
            isProgrammaticChange.current = false;
            applyChanges(initialNodes, initialEdges, []);
        }
    }, [setNodes, setEdges, applyChanges]);

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
        applyChanges(newNodeStates, edges);
    }, [nodes, setNodes, edges, applyChanges]);

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
        applyChanges(newNodes, edges);
    }, [nodes, setNodes, edges, applyChanges]);

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
        applyChanges(newNodes, edges);
    }, [nodes, setNodes, edges, applyChanges]);

    const addSwitchNode = useCallback(() => {
        const newNode = {
            id: `S${Math.floor(Math.random() * 9000000) + 1000000}`,
            type: 'switchNode',
            position: { x: Math.random() * 250, y: Math.random() * 250 },
            data: { switches: [] }
        };
        isProgrammaticChange.current = true;
        const newNodes = [...nodes, newNode];
        setNodes(newNodes);
        isProgrammaticChange.current = false;
        applyChanges(newNodes, edges);
    }, [nodes, setNodes, edges, applyChanges]);

    const handleNodeChange = useCallback((id, field, value) => {
        if (isUndoRedo.current || isProgrammaticChange.current) return; // Undo veya Redo sırasında tetiklenmemesi için kontrol
        setNodes(prevNodes => prevNodes.map(node =>
            node.id === id ? { ...node, data: { ...node.data, [field]: value } } : node
        ));
    }, [nodes, setNodes, edges]);

    const handleDataChange = useCallback((id, newData) => {
        if (isUndoRedo.current || isProgrammaticChange.current) return; // Undo veya Redo sırasında tetiklenmemesi için kontrol
        setNodes(prevNodes => prevNodes.map(node => {
            if (node.id === id) {
                const oldData = node.data;
                const oldAnswers = oldData.answers || [];
                const newAnswers = newData.answers || [];

                // Question bağlantısını kaldır
                if (oldAnswers.length === 0 && newAnswers.length > 0) {
                    setEdges(prevEdges => prevEdges.filter(edge => !(edge.source === id && edge.sourceHandle === 'question-source-handle')));
                }

                // Son answer silindiğinde, tüm ilgili edge'leri kaldır
                if (oldAnswers.length > 0 && newAnswers.length === 0) {
                    setEdges(prevEdges => prevEdges.filter(edge => edge.source !== id || edge.sourceHandle === 'question-source-handle'));
                }

                return { ...node, data: { ...node.data, ...newData } };
            }
            return node;
        }));
    }, [nodes, setNodes, setEdges, edges]);

    const highlightConnections = useCallback((node) => {
        const connectedEdges = edges.filter(edge => edge.source === node.id || edge.target === node.id);
        const connectedNodeIds = connectedEdges.map(edge => (edge.source === node.id ? edge.target : edge.source));
        const connectedNodes = nodes.filter(n => connectedNodeIds.includes(n.id));
        setHighlightedNodes(connectedNodes);
        setHighlightedEdges(connectedEdges);
    }, [edges, nodes]);

    const resetHighlight = useCallback(() => {
        setHighlightedNodes([]);
        setHighlightedEdges([]);
    }, []);

    const onSelectionChange = useCallback(({ nodes, edges }) => {
        if (nodes.length > 0) {
            highlightConnections(nodes[0]);
        } else {
            resetHighlight();
        }
    }, [highlightConnections, resetHighlight]);

    const duplicateSelectedNode = useCallback(() => {
        // Seçili düğmeyi bul
        const selectedNode = nodes.find(node => node.selected === true);
        if (!selectedNode) return;

        // Yeni düğme için bir kopya oluştur
        const duplicatedNode = {
            ...selectedNode, // selectedNode'un tüm özelliklerini kopyala
            id: `${selectedNode.id[0]}${Math.floor(Math.random() * 9000000) + 1000000}`,
            position: { x: selectedNode.position.x + 50, y: selectedNode.position.y + 50 },
            data: { ...selectedNode.data } ,
            selected: true,
        };

        selectedNode.selected = false;

        if (duplicatedNode.data.answers) {
            duplicatedNode.data.answers = duplicatedNode.data.answers.map(answer => ({
                ...answer,
                id: `A${Math.floor(Math.random() * 9000000) + 1000000}`, // Yeni bir ID oluştur
            }));
        }

        if (duplicatedNode.data.switches) {
            duplicatedNode.data.switches = duplicatedNode.data.switches.map(sw => ({
                ...sw,
                id: `SW${Math.floor(Math.random() * 9000000) + 1000000}`, // Yeni bir ID oluştur
            }));
        }

        // Kopyalanan düğmeyi ekle
        isProgrammaticChange.current = true;
        const newNodes = [...nodes, duplicatedNode];
        setNodes(newNodes);
        isProgrammaticChange.current = false;
        applyChanges(newNodes, edges);
    }, [nodes, setNodes, edges, applyChanges, editingNodeId, highlightedNodes]);

    // Description functions
    const addDescription = useCallback(() => {
        const newDescriptions = [...descriptions, {en: "", tr: ""}];
        setDescriptions(newDescriptions);
        applyChanges(nodes, edges, newDescriptions);
    }, [descriptions, nodes, edges]);

    const updateDescription = useCallback((index: number, value: string) => {
        const newDescriptions = [...descriptions];
        newDescriptions[index] = {
            ...newDescriptions[index],
            [language]: value
        };
        setDescriptions(newDescriptions);
        applyChanges(nodes, edges, newDescriptions);
    }, [descriptions, nodes, edges, language]);

    const deleteDescription = useCallback((index: number) => {
        const newDescriptions = descriptions.filter((_, i) => i !== index);
        setDescriptions(newDescriptions);
        applyChanges(nodes, edges, newDescriptions);
    }, [descriptions, nodes, edges]);

    // Function to update all nodes and descriptions with new languages
    const updateNodesWithNewLanguages = useCallback((newLanguages) => {
        // Update nodes
        const updatedNodes = nodes.map(node => {
            const updatedData = { ...node.data };
            
            if (node.type === 'customNode') {
                // Update question object
                if (updatedData.question) {
                    newLanguages.forEach(lang => {
                        if (!updatedData.question[lang]) {
                            updatedData.question[lang] = updatedData.question[currentLanguage] || 'Translate';
                        }
                    });
                }
                
                // Update answers array
                if (updatedData.answers) {
                    updatedData.answers = updatedData.answers.map(answer => ({
                        ...answer,
                        text: {
                            ...answer.text,
                            ...newLanguages.reduce((acc, lang) => {
                                if (!answer.text[lang]) {
                                    acc[lang] = answer.text[currentLanguage] || 'Translate';
                                }
                                return acc;
                            }, {})
                        }
                    }));
                }
            }
            
            return { ...node, data: updatedData };
        });
        
        // Update descriptions
        const updatedDescriptions = descriptions.map(desc => ({
            ...desc,
            ...newLanguages.reduce((acc, lang) => {
                if (!desc[lang]) {
                    acc[lang] = desc[currentLanguage] || 'Translate';
                }
                return acc;
            }, {})
        }));
        
        isProgrammaticChange.current = true;
        setNodes(updatedNodes);
        setDescriptions(updatedDescriptions);
        isProgrammaticChange.current = false;
        applyChanges(updatedNodes, edges, updatedDescriptions);
        
        console.log(`Added translation placeholders for new languages: ${newLanguages.join(', ')}`);
    }, [nodes, descriptions, edges, currentLanguage]);

    const handlePanelResize = useCallback((e: MouseEvent) => {
        const newWidth = e.clientX;
        if (newWidth >= 200 && newWidth <= 600) {
            setPanelWidth(newWidth);
        }
    }, []);

    const startResize = useCallback((e: React.MouseEvent) => {
        e.preventDefault();
        document.addEventListener('mousemove', handlePanelResize);
        document.addEventListener('mouseup', () => {
            document.removeEventListener('mousemove', handlePanelResize);
        }, { once: true });
    }, [handlePanelResize]);

    return (
        <Box height='100vh' width='100vw' position="relative">
            {/* Description Panel */}
            {isDescriptionPanelOpen && (
                <Box
                    position="absolute"
                    left="0"
                    top="74px"
                    width={`${panelWidth}px`}
                    height="calc(100% - 74px)"
                    backgroundColor="white"
                    borderRight="2px solid #e2e8f0"
                    zIndex={1000}
                    boxShadow="2px 0 10px rgba(0,0,0,0.1)"
                >
                    <VStack spacing={0} height="100%">
                        <Box width="100%" p={3} borderBottom="1px solid #e2e8f0">
                            <HStack justify="space-between" mb={2}>
                                <VStack align="start" spacing={1}>
                                    <Text fontWeight="bold" fontSize="md">Descriptions</Text>
                                    <Text fontSize="xs" color="gray.600">Language: {language.toUpperCase()}</Text>
                                </VStack>
                                <IconButton
                                    icon={<FaPlus />}
                                    size="sm"
                                    onClick={addDescription}
                                    aria-label="Add Description"
                                    title="Add Description"
                                />
                            </HStack>
                        </Box>
                        <Box flex="1" width="100%" overflowY="auto" p={3}>
                            <VStack spacing={3} align="stretch">
                                {descriptions.map((desc, index) => (
                                    <Box key={index} position="relative">
                                        <HStack align="flex-start" spacing={2}>
                                            <Textarea
                                                value={desc[language] || ""}
                                                onChange={(e) => updateDescription(index, e.target.value)}
                                                placeholder={`Description ${index + 1} (${language.toUpperCase()})`}
                                                size="sm"
                                                resize="vertical"
                                                minHeight="60px"
                                                flex="1"
                                            />
                                            <IconButton
                                                icon={<FaTrash />}
                                                size="sm"
                                                colorScheme="red"
                                                variant="ghost"
                                                onClick={() => deleteDescription(index)}
                                                aria-label="Delete Description"
                                                title="Delete Description"
                                            />
                                        </HStack>
                                    </Box>
                                ))}
                                {descriptions.length === 0 && (
                                    <Text color="gray.500" textAlign="center" py={8}>
                                        No descriptions yet. Click the + button to add one.
                                    </Text>
                                )}
                            </VStack>
                        </Box>
                    </VStack>
                    {/* Resize Handle */}
                    <Box
                        position="absolute"
                        right="0"
                        top="0"
                        width="4px"
                        height="100%"
                        cursor="ew-resize"
                        backgroundColor="transparent"
                        _hover={{ backgroundColor: "#4A90E2" }}
                        onMouseDown={startResize}
                    />
                </Box>
            )}
            
            <Box height='24px' width='100vw' background="gray" hidden={false}>
                Undo {currentHistoryIndex} of {history.length - 1}( n:{nodes.length} e:{edges.length} d:{descriptions.length} )
                {editingNodeId ? (<> Editing Node:{editingNodeId}</>) : (<> Normal Mode</>)}
            </Box>
            <Box height='50px' width='100vw' display="flex" alignItems="center" justifyContent="space-between" flexWrap="nowrap" overflowX="auto">
                <IconButton
                    icon={isNodesLocked ? <FaLock /> : <FaUnlock />}
                    onClick={toggleNodesLock}
                    m={2}
                    aria-label={isNodesLocked ? 'Unlock Nodes' : 'Lock Nodes'}
                    title={isNodesLocked ? 'Unlock Nodes' : 'Lock Nodes'}
                />
                <IconButton
                    icon={<TbRefresh />}
                    onClick={() => {
                        setNodes([]);
                        setEdges([]);
                        setTimeout(() => {
                            setNodes(nodes);
                            setEdges(edges);
                        }, 0);
                    }}
                    m={2}
                    aria-label="Redraw"
                    title="Redraw"
                />
                {editingNodeId === null && (
                    <HStack spacing={1} flexWrap="nowrap" overflowX="auto" flex="1">
                        <IconButton
                            icon={<FaUndo />}
                            onClick={undo}
                            m={2}
                            aria-label="Undo"
                            title="Undo"
                        />
                        <IconButton
                            icon={<FaRedo />}
                            onClick={redo}
                            m={2}
                            aria-label="Redo"
                            title="Redo"
                        />
                        <IconButton
                            icon={<TbDownload />}
                            onClick={exportWorkflow}
                            m={2}
                            aria-label="Export"
                            title="Export"
                        />
                        <input
                            type="file"
                            accept=".json"
                            onChange={importWorkflow}
                            style={{ display: 'none' }}
                            id="import-file"
                        />
                        <label htmlFor="import-file">
                            <IconButton
                                as="span"
                                icon={<TbUpload />}
                                m={2}
                                aria-label="Import"
                                title="Import"
                            />
                        </label>
                        <IconButton
                            icon={<TbClipboardCopy />}
                            onClick={exportToClipboard}
                            m={2}
                            aria-label="Copy to Clipboard"
                            title="Copy to Clipboard"
                        />
                        <IconButton
                            icon={<FaPaste />}
                            onClick={importFromClipboard}
                            m={2}
                            aria-label="Paste from Clipboard"
                            title="Paste from Clipboard"
                        />
                        {selectedLanguages.map((langCode) => (
                            <IconButton
                                key={langCode}
                                icon={<span>{availableLanguages[langCode]?.flag || langCode.toUpperCase()}</span>}
                                size="sm"
                                variant={currentLanguage === langCode ? "solid" : "outline"}
                                colorScheme={currentLanguage === langCode ? "blue" : "gray"}
                                onClick={() => switchToLanguage(langCode)}
                                title={availableLanguages[langCode]?.name || langCode}
                                aria-label={`Switch to ${availableLanguages[langCode]?.name || langCode}`}
                                m={1}
                                fontSize="lg"
                            />
                        ))}
                        <IconButton
                            icon={<ImFileEmpty />}
                            onClick={newDiagram}
                            m={2}
                            aria-label="New Diagram"
                            title="New Diagram"
                        />
                        <IconButton
                            icon={<FaQuestionCircle />}
                            onClick={addNewNode}
                            m={2}
                            aria-label="Add Question Node"
                            title="Add Question Node"
                            backgroundColor="#A3D8F4"
                        />
                        <IconButton
                            icon={<FaPause />}
                            onClick={addPauseNode}
                            m={2}
                            aria-label="Add Pause Node"
                            title="Add Pause Node"
                            backgroundColor="#B9E2C8"
                        />
                        <IconButton
                            icon={<FaTerminal />}
                            onClick={addCommandNode}
                            m={2}
                            aria-label="Add Command Node"
                            title="Add Command Node"
                            backgroundColor="#FFFACD"
                        />
                        <IconButton
                            icon={<FaExchangeAlt />}
                            onClick={addSwitchNode}
                            m={2}
                            aria-label="Add Switch Node"
                            title="Add Switch Node"
                            backgroundColor="#F4C1D9"
                        />
                        <IconButton
                            icon={<GrClone />}
                            onClick={duplicateSelectedNode}
                            m={2}
                            aria-label="Duplicate"
                            title="Duplicate"
                        />
                        <IconButton
                            icon={<FaFileAlt />}
                            onClick={() => setIsDescriptionPanelOpen(!isDescriptionPanelOpen)}
                            m={2}
                            aria-label="Toggle Description Panel"
                            title="Toggle Description Panel"
                            backgroundColor={isDescriptionPanelOpen ? "#4A90E2" : undefined}
                            color={isDescriptionPanelOpen ? "white" : undefined}
                        />
                    </HStack>
                )}
                <HStack spacing={2} flexShrink={0}>
                    <LanguageConfig />
                    {onLogout && (
                        <IconButton
                            icon={<FaSignOutAlt />}
                            onClick={onLogout}
                            aria-label="Çıkış Yap"
                            title="Çıkış Yap"
                            colorScheme="red"
                            variant="outline"
                            size="sm"
                        />
                    )}
                </HStack>
            </Box>
            <Box
                marginLeft={isDescriptionPanelOpen ? `${panelWidth}px` : "0"}
                transition="margin-left 0.3s ease"
                height="calc(100% - 74px)"
            >
                <ReactFlow
                    nodes={nodes.map(node => ({
                        ...node,
                        data: {
                            ...node.data,
                            id: node.id,
                            onChange: handleNodeChange,
                            onDataChange: handleDataChange,
                        },
                        style: editingNodeId && node.id !== editingNodeId ? { opacity: 0.5, pointerEvents: 'none' } : {}, // Node stilini ayarlama
                    }))}
                    edges={edges.map(edge => ({
                        ...edge,
                        style: highlightedEdges.includes(edge) ? { strokeWidth: 3 } : {},
                    }))}
                    onNodesChange={onNodesChangeWrapper}
                    onEdgesChange={onEdgesChangeWrapper}
                    onConnect={onConnect}
                    onNodeDragStop={onNodeDragStop}
                    onSelectionChange={onSelectionChange}
                    nodeTypes={nodeTypes}
                    edgeTypes={edgeTypes}
                    snapToGrid
                    snapGrid={[20, 20]}
                    fitView
                    minZoom={0.1}
                    maxZoom={4}
                    zoomOnDoubleClick={false}
//                    selectionOnDrag={true}
                    nodesFocusable={!editingNodeId}
                    nodesDraggable={!editingNodeId}
                    panOnDrag={!editingNodeId}
                    preventScrolling={!editingNodeId}
                    nodesConnectable={!editingNodeId}
                >
                <MiniMap
                    pannable
                    zoomable={true}
                    zoomStep={0.5}
                    nodeStrokeWidth={3}
                    nodeColor={node => {
                        if (highlightedNodes.includes(node)) {
                            return '#FF0000';
                        }
                        switch (node.type) {
                            case 'pauseNode':
                                return '#B9E2C8';
                            case 'commandNode':
                                return '#FFFACD';
                            case 'switchNode':
                                return '#F4C1D9';
                            case 'customNode':
                                return '#A3D8F4';
                            default:
                                return '#eee';
                        }
                    }}
                />
                    <Background/>
                    <Controls/>
                </ReactFlow>
            </Box>
        </Box>
    );
};

export default Workflow;
