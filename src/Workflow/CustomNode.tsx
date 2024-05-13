// CustomNode.tsx
import React, { useState } from 'react';
import { Handle, Position } from 'reactflow';
import { Node } from './CustomNodeTypes';
import './custom-node.css';

interface CustomNodeComponentProps {
    data: Node;
}

const CustomNode: React.FC<CustomNodeComponentProps> = ({ data }) => {
    const [language, setLanguage] = useState('en');
    const [question, setQuestion] = useState(data.question?.[language] || "Buraya soru girin");
    const [answers, setAnswers] = useState(data.answers || []);
    const [editing, setEditing] = useState(false);
    const [editValue, setEditValue] = useState('');

    const handleLanguageToggle = () => {
        setLanguage((prev) => (prev === 'en' ? 'tr' : 'en'));
    };

    const addAnswer = () => {
        const newAnswer = { text: { en: "New answer", tr: "Yeni cevap" }, connect: "" };
        setAnswers([...answers, newAnswer]);
    };

    const editAnswer = (index: number, value: string) => {
        const newAnswers = [...answers];
        newAnswers[index].text[language] = value;
        setAnswers(newAnswers);
    };

    const startEdit = (value: string) => {
        setEditing(true);
        setEditValue(value);
    };

    const applyEdit = () => {
        setEditing(false);
        setQuestion(editValue);
    };

    const cancelEdit = () => {
        setEditing(false);
    };

    return (
        <div className="custom-node">
            <div className="node-header">
                <span>Node Title</span>
                <button onClick={handleLanguageToggle}>{language.toUpperCase()}</button>
            </div>
            <Handle type="target" position={Position.Top} />
            <div className="node-content">
                <div className="node-question" onClick={() => startEdit(question)}>
                    {question}
                </div>
                {answers.map((answer, index) => (
                    <div key={index} className="node-answer" onClick={() => startEdit(answer.text[language])}>
                        {answer.text[language]}
                    </div>
                ))}
                <button onClick={addAnswer}>Cevap Ekle</button>
            </div>
            {editing && (
                <div className="edit-controls">
                    <input type="text" value={editValue} onChange={(e) => setEditValue(e.target.value)} />
                    <button onClick={applyEdit}>✔️</button>
                    <button onClick={cancelEdit}>❌</button>
                </div>
            )}
            <Handle type="source" position={Position.Bottom} />
        </div>
    );
};

export default CustomNode;
