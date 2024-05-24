import React, { useState } from 'react';
import { Handle, Position } from 'reactflow';
import './custom-node.css';  // Var olan stilleri kullanabilirsiniz

interface CommandNodeProps {
    id: string;
    data: {
        commands: string[];
        onChange: (id: string, field: string, value: string[]) => void;
    };
}

const CommandNode: React.FC<CommandNodeProps> = ({ id, data }) => {
    const [commands, setCommands] = useState(data.commands);
    const [editingIndex, setEditingIndex] = useState(-1);
    const [editValue, setEditValue] = useState('');

    const addCommand = () => {
        const newCommands = [...commands, ''];
        setCommands(newCommands);
        data.onChange(id, newCommands);
    };

    const startEdit = (index: number) => {
        setEditingIndex(index);
        setEditValue(commands[index]);
    };

    const saveEdit = () => {
        const newCommands = [...commands];
        newCommands[editingIndex] = editValue;
        setCommands(newCommands);
        data.onChange(id, "commands", newCommands);
        setEditingIndex(-1);
    };

    const cancelEdit = () => {
        setEditingIndex(-1);
    };

    const deleteCommand = (index: number) => {
        const newCommands = commands.filter((_, i) => i !== index);
        setCommands(newCommands);
        data.onChange(id, "commands", newCommands);
    };

    return (
        <div className="custom-node">
            <div className="node-header">ID: {id}</div>
            <Handle
                type="target"
                position={Position.Left}
                id="left-handle"
                style={{ background: 'gray',width:10,height:10,transform: 'translateX(-50%)' }}
            />
            <div className="node-content">
                {commands.map((cmd, index) => (
                    editingIndex === index ? (
                        <div key={index}>
                            <textarea value={editValue} onChange={(e) => setEditValue(e.target.value)} />
                            <button onClick={saveEdit}>✔️</button>
                            <button onClick={cancelEdit}>❌</button>
                            <button onClick={() => deleteCommand(index)}>🗑️</button>
                        </div>
                    ) : (
                        <div key={index} onDoubleClick={() => startEdit(index)}>
                            {cmd || "New command"}
                        </div>
                    )
                ))}
                <button onClick={addCommand} className="add-answer-button">Add</button>
            </div>
            <Handle
                type="source"
                position={Position.Right}
                style={{
                    right: -10,
                    top: '50%',
                    transform: 'translateY(-50%)',
                    width: 10,
                    height: 10,
                    background:  'gray',
                }}
            />
        </div>
    );
};

export default CommandNode;
