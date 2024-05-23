import React, {useCallback, useState} from 'react';
import {Handle, Position, useOnSelectionChange} from 'reactflow';
import './text-updater-node.css';
import {Node} from "./CustomNodeTypes";

interface TextUpdaterNodeProps {
    id: string;
    data: Node & {
        id: string;
        onChange: (id: string, field: string, value: any) => void;
        onDataChange: (id: string, newData: any) => void;
    };
}

const TextUpdaterNode: React.FC<TextUpdaterNodeProps> = ({ id, data }) => {
    const [isSelected, setIsSelected] = useState(false);
    const [editing, setEditing] = useState(false);
    const [editValue, setEditValue] = useState('');

    const onChange = useCallback((evt) => {
        console.log(evt.target.value);
    }, []);

    useOnSelectionChange({
        onChange: ({ nodes }) => {
            const isSelected = nodes.some(node => node.id === id);
            setIsSelected(isSelected);
        },
    });

    const applyEdit = () => {
        setEditing(false);
        if (editingIndex !== null && editingIndex >= 0) {
            const newAnswers = [...answers];
            newAnswers[editingIndex].text[language] = editValue;
            setAnswers(newAnswers);
            data.onChange(id, 'answers', newAnswers);
        } else if (editingIndex === null) {
            const newQuestion = { ...question, [language]: editValue };
            setQuestion(newQuestion);
            data.onChange(id, 'question', newQuestion);
        }
        setEditingIndex(null);
    };

    const cancelEdit = () => {
        setEditing(false);
        setEditingIndex(null);
    };

    return (
        <div className={`custom-node ${isSelected ? 'selected' : ''}`}>
            <div className="node-header">
                <span>ID: </span>
            </div>
            <Handle
                type="target"
                position={Position.Left}
                style={{
                    right: -10,
                    top: '50%',
                    transform: 'translateY(-50%)',
                    width: 10,
                    height: 10,
                    background: 'gray'
                }}
            />
            <div>
                <label htmlFor="text">- Pause:</label>
                <input id="text" name="text" onChange={onChange} className="nodrag"/>
            </div>
            {editing && (
                <div className="edit-controls">
                    <button onClick={applyEdit}>✔️</button>
                    <button onClick={cancelEdit}>❌</button>
                </div>
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
                    background: 'gray'
                }}
            />

        </div>
    );
}

export default TextUpdaterNode;
