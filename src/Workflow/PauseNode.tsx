import React, { useState } from 'react';
import {Handle, Position, useOnSelectionChange} from 'reactflow';
import './custom-node.css'; // Mevcut stilleri kullanabilirsiniz

interface PauseNodeProps {
    id: string;
    data: {
        pause: string;
        onChange: (id: string, field: string, value: any) => void;
    };
}

const PauseNode: React.FC<PauseNodeProps> = ({ id, data }) => {
    const [editing, setEditing] = useState(false);
    const [text, setText] = useState(data.pause);
    const [isSelected, setIsSelected] = useState(false);

    useOnSelectionChange({
        onChange: ({ nodes }) => {
            const isSelected = nodes.some(node => node.id === id);
            setIsSelected(isSelected);
        },
    });

    const toggleEdit = () => setEditing(!editing);
    const saveText = () => {
        data.onChange(id, "pause", text);
        setEditing(false);
    };
    const cancelEdit = () => {
        setText(data.pause); // Geri almak için mevcut değeri yeniden ayarlayın
        setEditing(false);
    };

    return (
        <div className={`custom-node ${isSelected ? 'selected' : ''}`}>
            <div className="node-header">
                <span>ID: {id}</span>
            </div>
            <Handle type="target" position={Position.Left} id="target" />
            {editing ? (
                <div>
                    <textarea
                        value={text}
                        onChange={(e) => setText(e.target.value)}
                        className="node-textarea"
                        rows={4}
                    />
                    <div className="edit-controls">
                        <button onClick={saveText} className="edit-button save">✔️</button>
                        <button onClick={cancelEdit} className="edit-button cancel">❌</button>
                    </div>
                </div>
            ) : (
                <div onDoubleClick={toggleEdit} className="node-content">{text || "Double-click to edit"}</div>
            )}
            <Handle type="source" position={Position.Right} id="source" />
        </div>
    );
};

export default PauseNode;
