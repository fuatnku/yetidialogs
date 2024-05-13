// CustomNode.tsx
import React, { useState } from 'react';
import { Handle, Position } from 'reactflow';
import { Node } from './CustomNodeTypes';
import './custom-node.css';
import {Resizable, ResizableBox} from 'react-resizable';
import 'react-resizable/css/styles.css';

interface CustomNodeComponentProps {
    id: string;  // Node ID'sini props olarak ekleyin
    data: Node;
}

const CustomNode: React.FC<CustomNodeComponentProps> = ({ id, data }) => {
    const [language, setLanguage] = useState('en');
    const [question, setQuestion] = useState(data.question?.en || "Here, enter a question");
    const [answers, setAnswers] = useState(data.answers || []);
    const [editing, setEditing] = useState(false);
    const [editValue, setEditValue] = useState('');
    const [editingIndex, setEditingIndex] = useState(-1);
    const [width, setWidth] = useState(300); // Başlangıç genişliği
    const [height, setHeight] = useState(150); // Başlangıç yüksekliği

    // Yeniden boyutlandırma işlemi tamamlandığında çalışacak fonksiyon
    const onResizeStop = (event, { size }) => {
        setWidth(size.width);
        setHeight(size.height);
    };

    const handleLanguageToggle = () => {
        setLanguage(prev => {
            const newLanguage = prev === 'en' ? 'tr' : 'en';
            setQuestion(data.question ? data.question[newLanguage] : "Here, enter a question");
            return newLanguage;
        });
    };

    const addAnswer = () => {
        const newAnswer = { text: { en: "New answer", tr: "Yeni cevap" }, connect: "" };
        setAnswers([...answers, newAnswer]);
    };

    const startEdit = (index: number, value: string) => {
        setEditing(true);
        setEditValue(value);
        setEditingIndex(index);
    };

    const applyEdit = () => {
        if (editingIndex >= 0) {
            const newAnswers = [...answers];
            newAnswers[editingIndex].text[language] = editValue;
            setAnswers(newAnswers);
        } else {
            setQuestion(editValue);
        }
        setEditing(false);
        setEditingIndex(-1);
    };

    const cancelEdit = () => {
        setEditing(false);
        setEditingIndex(-1);
    };

    return (
        <ResizableBox
            width={width}
            height={height}
            minConstraints={[300, 100]}
            onResizeStop={onResizeStop}>
        <div className="custom-node">
            <div className="node-header">
                <button onClick={handleLanguageToggle}>{language.toUpperCase()}</button>
                <span>ID: {id}</span>
            </div>
            <Handle
                type="target"
                position={Position.Left}
                id="left-handle"
                style={{
                    background: 'gray',
                    left: -10,
                    width: 20,
                    height: 20,
                    top: '50%',
                    transform: 'translateY(-50%)'
                }}
            />
            <div className="node-content">
                <div className="node-question" onClick={() => startEdit(-1, question[language])}>
                    <textarea value={question[language]} onChange={(e) => setEditValue(e.target.value)}/>
                </div>
                {answers.map((answer, index) => (
                    <div key={index} className="node-answer" onClick={() => startEdit(index, answer.text[language])}
                         style={{position: 'relative'}}>
                        {answer.text[language]}
                        <Handle
                            type="source"
                            position={Position.Right}
                            id={`choice-${index}`} // Benzersiz ID
                            style={{
                                background: 'gray',
                                width: 20,
                                height: 20,
                                top: '50%',
                                transform: 'translateY(-50%)'
                            }}
                        />
                    </div>
                ))}
                <button onClick={addAnswer}>Add Answer</button>
            </div>
            {editing && (
                <div className="edit-controls">
                    <input type="text" value={editValue} onChange={(e) => setEditValue(e.target.value)}/>
                    <button onClick={applyEdit}>✔️</button>
                    <button onClick={cancelEdit}>❌</button>
                </div>
            )}
            <Handle type="source" position={Position.Bottom} id="bottom-handle" style={{visibility: 'hidden'}}/>
        </div>
        </ResizableBox>
);
};

export default CustomNode;
