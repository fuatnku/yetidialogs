import React, { useState, useEffect } from 'react';
import { Handle, Position, useOnSelectionChange } from 'reactflow';
import { DndProvider, useDrag, useDrop } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import update from 'immutability-helper';
import './custom-node.css';
import { Node } from "./CustomNodeTypes";  // Use existing styles
import { useEdit } from './EditContext';

interface CommandNodeProps {
    id: string;
    data: {
        id: string;
        commands: string[];
        onChange: (id: string, field: string, value: any) => void;
        onDataChange: (id: string, newData: any) => void;
    };
}

const CommandNode: React.FC<CommandNodeProps> = ({ id, data }) => {
    const { editingNodeId, setEditingNodeId } = useEdit();
    const [commands, setCommands] = useState(data.commands);
    const [editingIndex, setEditingIndex] = useState(-1);
    const [editValue, setEditValue] = useState('');
    const [isSelected, setIsSelected] = useState(false);

    useOnSelectionChange({
        onChange: ({ nodes }) => {
            const isSelected = nodes.some(node => node.id === id);
            setIsSelected(isSelected);
        },
    });

    useEffect(() => {
        if (data.onDataChange) {
            data.onDataChange(id, { commands });
        }
    }, [commands]);

    useEffect(() => {
        if (editingIndex !== -1){
            setEditingNodeId(id);
        }else {
            setEditingNodeId(null);
        }
    }, [editingIndex]);

    const addCommand = () => {
        const newCommands = [...commands, 'Command'];
        setCommands(newCommands);
        data.onChange(id, 'commands', newCommands);
    };

    const startEdit = (index: number) => {
        setEditingIndex(index);
        setEditValue(commands[index]);
    };

    const saveEdit = () => {
        const updatedCommands = [...commands];
        updatedCommands[editingIndex] = editValue;
        setCommands(updatedCommands);
        data.onChange(id, 'commands', updatedCommands);
        setEditingIndex(-1);
    };

    const cancelEdit = () => {
        setEditingIndex(-1);
    };

    const deleteCommand = (index: number) => {
        const updatedCommands = commands.filter((_, i) => i !== index);
        setCommands(updatedCommands);
        data.onChange(id, 'commands', updatedCommands);
        setEditingIndex(-1);
    };

    const moveCommand = (dragIndex: number, hoverIndex: number) => {
        const draggedCommand = commands[dragIndex];
        const newCommands = update(commands, {
            $splice: [
                [dragIndex, 1],
                [hoverIndex, 0, draggedCommand]
            ]
        });
        setCommands(newCommands);
        data.onChange(id, 'commands', newCommands);
    };

    const Command = ({ command, index }: { command: string, index: number }) => {
        const ref = React.useRef(null);
        const [, drop] = useDrop({
            accept: 'COMMAND',
            hover(item: any) {
                if (!ref.current) {
                    return;
                }
                const dragIndex = item.index;
                const hoverIndex = index;
                if (dragIndex === hoverIndex) {
                    return;
                }
                moveCommand(dragIndex, hoverIndex);
                item.index = hoverIndex;
            },
        });
        const [{ isDragging }, drag] = useDrag({
            type: 'COMMAND',
            item: { index },
            collect: (monitor) => ({
                isDragging: monitor.isDragging(),
            }),
        });
        drag(drop(ref));

        return (
            <div
                ref={ref}
                style={{
                    opacity: isDragging ? 0.5 : 1,
                }}
                onClick={() => startEdit(index)}
                className="node-answer"
            >
                {command}
            </div>
        );
    };

    return (
        <DndProvider backend={HTML5Backend}>
            <div className={`custom-node ${isSelected ? 'selected' : ''}`}>
                <div className="node-header-command">
                    <span>Command Node</span>
                    <span className="node-id">ID: {id}</span>
                </div>
                <Handle
                    type="target"
                    position={Position.Left}
                    id="left-handle"
                    style={{ background: 'gray', width: 10, height: 10, transform: 'translateX(-50%)' }}
                />
                <div className="node-content">
                    {commands.map((cmd, index) => (
                        editingIndex === index ? (
                            <table width='100%'>
                                <tr>
                                <textarea
                                    value={editValue}
                                    onChange={(e) => setEditValue(e.target.value)}
                                    rows={2}
                                    className="node-answer-edit"
                                />
                                </tr>
                                <tr>
                                    <div className="edit-controls">
                                        <button onClick={saveEdit}>✔️</button>
                                        <button onClick={() => deleteCommand(editingIndex)}>🗑️</button>
                                        <button onClick={cancelEdit}>❌</button>
                                    </div>
                                </tr>
                            </table>

                        ) : (
                            <div key={index} onClick={() => startEdit(index)} className="node-answer">
                                {cmd || "New command"}
                            </div>
                        )
                    ))}
                    {editingIndex !== -1 ? (
                        <button className="add-answer-button">Add</button>
                    ) : (
                        <button onClick={addCommand} className="add-answer-button">Add</button>
                    )}
                </div>
                <Handle
                    type="source"
                    position={Position.Right}
                    id="right-handle"
                    style={{ background: 'gray', width: 10, height: 10, transform: 'translateY(-50%)' }}
                />
            </div>
        </DndProvider>
    );
};

export default CommandNode;
