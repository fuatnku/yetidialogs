import React, { useState, useEffect } from 'react';
import { Handle, Position, useOnSelectionChange } from 'reactflow';
import { useEdit } from './EditContext';
import './custom-node.css';

interface PauseNodeProps {
    id: string;
    data: {
        pause: string;
        onChange: (id: string, field: string, value: string) => void;
    };
}

const PauseNode: React.FC<PauseNodeProps> = ({ id, data }) => {
    const { editingNodeId, setEditingNodeId } = useEdit();
    const [text, setText] = useState(data.pause);
    const [isSelected, setIsSelected] = useState(false);

    useOnSelectionChange({
        onChange: ({ nodes }) => {
            const isSelected = nodes.some(node => node.id === id);
            setIsSelected(isSelected);
        },
    });

    const toggleEdit = () => {
        if (editingNodeId === id) {
            setEditingNodeId(null);
        } else {
            setEditingNodeId(id);
        }
    };

    const saveText = () => {
        data.onChange(id, "pause", text);
        setEditingNodeId(null);
    };

    const cancelEdit = () => {
        setText(data.pause);
        setEditingNodeId(null);
    };

    useEffect(() => {
        if (editingNodeId !== id) {
            setText(data.pause);
        }
    }, [editingNodeId, id, data.pause]);

    const isEditing = editingNodeId === id;

    return (
        <div className={`custom-node ${isSelected ? 'selected' : ''}`}>
            <div className="node-header-pause">
                <span>Pause Node</span>
                <span className="node-id">ID: {id}</span>
            </div>
            <Handle
                type="target"
                position={Position.Left}
                id="left-handle"
                style={{ background: 'gray', width: 10, height: 10, transform: 'translateX(-50%)' }}
            />
            {isEditing ? (
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
                <div onClick={toggleEdit} className="node-content">{text || "Pause"}</div>
            )}
            <Handle
                type="source"
                position={Position.Right}
                style={{
                    right: -10,
                    top: '50%',
                    transform: 'translateY(-50%)',
                    width: 10,
                    height: 10,
                    background: 'gray',
                }}
            />
        </div>
    );
};

export default PauseNode;
