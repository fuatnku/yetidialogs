import React, {useEffect, useState} from 'react';
import {Handle, Position, useOnSelectionChange} from 'reactflow';
import './custom-node.css';
import {Node} from "./CustomNodeTypes";  // Use existing styles

interface CommandNodeProps {
    id: string;
    data: {
        id: string;
        commands: string[];
        onChange: (id: string, field: string, value: any) => void;
        onDataChange: (id: string, newData: any) => void;
    };
}
const CommandNode: React.FC<CommandNodeProps> = ({id, data}) => {
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
            data.onDataChange(id, {  commands });
        }
    }, [commands]);

    const addCommand = () => {
        const newCommands = [...commands, 'Command'];
        setCommands(newCommands);
        data.onChange(id, newCommands);
    };

    const startEdit = (index: number) => {
        setEditingIndex(index);
        setEditValue(commands[index]);
    };

    const saveEdit = () => {
        const updatedCommands = [...commands];
        updatedCommands[editingIndex] = editValue;
        setCommands(updatedCommands);
        data.onChange(id, updatedCommands);
        setEditingIndex(-1);
    };

    const cancelEdit = () => {
        setEditingIndex(-1);
    };

    const deleteCommand = (index: number) => {
        const updatedCommands = commands.filter((_, i) => i !== index);
        setCommands(updatedCommands);
        data.onChange(id, updatedCommands);
    };

    return (
        <div className={`custom-node ${isSelected ? 'selected' : ''}`}>
            <div className="node-header-command">
                <span>Command Node</span>
                    <span className="node-id">ID: {id}</span>
            </div>
            <Handle type="target" position={Position.Left} id="left-handle"
                    style={{background: 'gray', width: 10, height: 10, transform: 'translateX(-50%)'}}/>
            <div className="node-content">
                {commands.map((cmd, index) => (
                    editingIndex === index ? (
                        <div key={index} className="switch-container">
                            <textarea
                                value={editValue}
                                onChange={(e) => setEditValue(e.target.value)}
                                rows={2}
                                className="node-answer-edit"
                            />
                        </div>
                    ) : (
                        <div key={index} onDoubleClick={() => startEdit(index)} className="node-answer">
                            {cmd || "New command"}
                        </div>
                    )
                ))}
                {editingIndex !== -1 ? (
                    <div className="edit-controls">
                        <div className="edit-controls">
                            <button onClick={saveEdit}>✔️</button>
                            <button onClick={cancelEdit}>❌</button>
                            <button onClick={() => deleteCommand(editingIndex)}>🗑️</button>
                        </div>
                    </div>
                ) : (
                    <button onClick={addCommand} className="add-answer-button">Add</button>
                )}
            </div>
            <Handle type="source" position={Position.Right} id="right-handle"
                    style={{background: 'gray', width: 10, height: 10, transform: 'translateY(-50%)'}}/>
        </div>
    );
};

export default CommandNode;
