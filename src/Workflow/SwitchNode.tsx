import React, { useEffect, useState } from 'react';
import { Handle, Position } from 'reactflow';
import './custom-node.css';

interface Switch {
    text: string;
    connect: string;
}

interface SwitchNodeProps {
    id: string;
    data: {
        switches: Switch[];
        onChange: (id: string, switches: Switch[]) => void;
        onDataChange: (id: string, newData: any) => void;
    };
}

const SwitchNode: React.FC<SwitchNodeProps> = ({ id, data }) => {
    const [switches, setSwitches] = useState(data.switches);
    const [editingIndex, setEditingIndex] = useState(-1);
    const [editText, setEditText] = useState('');
    const [editConnect, setEditConnect] = useState('');

    useEffect(() => {
        if (data.onDataChange) {
            data.onDataChange(id, { switches });
        }
    }, [switches]);

    const addSwitch = () => {
        const newSwitches = [...switches, { text: '', connect: '' }];
        setSwitches(newSwitches);
        data.onChange(id, newSwitches);
    };

    const startEdit = (index: number) => {
        setEditingIndex(index);
        setEditText(switches[index].text);
        setEditConnect(switches[index].connect);
    };

    const saveEdit = () => {
        const updatedSwitches = [...switches];
        updatedSwitches[editingIndex] = { text: editText, connect: editConnect };
        setSwitches(updatedSwitches);
        data.onChange(id, updatedSwitches);
        setEditingIndex(-1);
    };

    const cancelEdit = () => {
        setEditingIndex(-1);
    };

    const deleteSwitch = (index: number) => {
        const updatedSwitches = switches.filter((_, i) => i !== index);
        setSwitches(updatedSwitches);
        data.onChange(id, updatedSwitches);
        setEditingIndex(-1);
    };

    return (
        <div className="custom-node">
            <div className="node-header-switch">ID: {id}</div>
            <Handle type="target" position={Position.Left} id="left-handle" style={{ background: 'gray', width: 10, height: 10, transform: 'translateX(-50%)' }} />
            <div className="node-content">
                {switches.map((sw, index) => (
                    <div key={index} className="switch-container">
                        {editingIndex === index ? (
                            <textarea
                                value={editText}
                                onChange={(e) => setEditText(e.target.value)}
                                rows={2}  // Satır sayısını belirleyin
                                className="node-answer-edit"  // CustomNode'da kullanılan CSS sınıfını uygulayın
                            />
                        ) : (
                            <div onDoubleClick={() => startEdit(index)}>
                                {sw.text || "New switch"}
                            </div>
                        )}
                        <Handle
                            type="source"
                            position={Position.Right}
                            id={`choice-${index}`}
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
                ))}
                {editingIndex !== -1 ? (
                    <div className="edit-controls">
                        <button onClick={saveEdit}>✔️</button>
                        <button onClick={cancelEdit}>❌</button>
                        <button onClick={() => deleteSwitch(editingIndex)}>🗑️</button>
                    </div>
                ) : (
                    <button onClick={addSwitch} className="add-answer-button">Add</button>
                )}
            </div>
        </div>
    );
};

export default SwitchNode;
