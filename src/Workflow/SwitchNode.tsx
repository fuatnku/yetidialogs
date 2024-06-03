import React, { useEffect, useState } from 'react';
import { Handle, Position, useOnSelectionChange } from 'reactflow';
import './custom-node.css';
import { useEdit } from './EditContext';

interface Switch {
    id: string;  // ID alanı ekleniyor
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
    const { editingNodeId, setEditingNodeId } = useEdit();
    const [switches, setSwitches] = useState<Switch[]>(data.switches || []);
    const [editingIndex, setEditingIndex] = useState(-1);
    const [editText, setEditText] = useState('');
    const [editConnect, setEditConnect] = useState('');
    const [isSelected, setIsSelected] = useState(false);

    useOnSelectionChange({
        onChange: ({ nodes }) => {
            const isSelected = nodes.some(node => node.id === id);
            setIsSelected(isSelected);
        },
    });

    useEffect(() => {
        if (data.onDataChange) {
            data.onDataChange(id, { switches });
        }
    }, [switches]);

    useEffect(() => {
        if (editingIndex !== -1){
            setEditingNodeId(id);
        }else {
            setEditingNodeId(null);
        }
    }, [editingIndex]);

    const generateSwitchId = () => `switch-${Math.random().toString(36).substring(2, 11)}`;

    const addSwitch = () => {
        const newSwitches = [...switches, { id: generateSwitchId(), text: '', connect: '' }];
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
        updatedSwitches[editingIndex] = { ...updatedSwitches[editingIndex], text: editText, connect: editConnect };
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
        <div className={`custom-node ${isSelected ? 'selected' : ''}`}>
            <div className="node-header-switch">
                <span>Switch Node</span>
                <span className="node-id">ID: {id}</span>
            </div>
            <Handle
                type="target"
                position={Position.Left}
                id="left-handle"
                style={{ background: 'gray', width: 10, height: 10, transform: 'translateX(-50%)' }}
            />
            <div className="node-content">
                {switches.map((sw, index) => (
                    <div key={sw.id} className="switch-container">
                        {editingIndex === index ? (
                            <table width='100%'>
                            <tr>
                            <textarea
                                value={editText}
                                onChange={(e) => setEditText(e.target.value)}
                                rows={2}
                                className="node-answer-edit"
                            />
                            </tr>
                            <tr>
                                <div className="edit-controls">
                                    <button onClick={saveEdit}>✔️</button>
                                    <button onClick={() => deleteSwitch(editingIndex)}>🗑️</button>
                                    <button onClick={cancelEdit}>❌</button>
                                </div>
                            </tr>
                            </table>
                        ) : (
                            <div onClick={() => startEdit(index)}>
                        {sw.text || "New switch"}
                    </div>
                )}
                <Handle
                    type="source"
                    position={Position.Right}
                            id={sw.id}
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
                    <button className="add-answer-button">Add</button>
                ) : (
                    <button onClick={addSwitch} className="add-answer-button">Add</button>
                )}
            </div>
        </div>
    );
};

export default SwitchNode;
