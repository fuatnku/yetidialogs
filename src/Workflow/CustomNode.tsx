import React, { useState } from 'react';
import { Handle, Position } from 'reactflow';
import { Node } from './CustomNodeTypes';
import './custom-node.css';

interface CustomNodeComponentProps {
    id: string;  // Node ID'sini props olarak ekleyin
    data: Node;
    onDataChange: (id: string, newData: Node) => void;
    onChange: (id: string, field: string, value: any) => void;  // onChange eventini props olarak ekleyin
}

const CustomNode: React.FC<CustomNodeComponentProps> = ({ id, data, onDataChange, onChange }) => {
    const [language, setLanguage] = useState<'en' | 'tr'>('en');
    const [question, setQuestion] = useState(data.question || { en: "Here, enter a question", tr: "Buraya bir soru girin" });
    const [answers, setAnswers] = useState(data.answers || []);
    const [editing, setEditing] = useState(false);
    const [editValue, setEditValue] = useState('');
    const [editingIndex, setEditingIndex] = useState<number | null>(null);

    const handleLanguageToggle = () => {
        setLanguage(prev => (prev === 'en' ? 'tr' : 'en'));
    };

    const addAnswer = () => {
        const newAnswer = { text: { en: "New answer", tr: "Yeni cevap" }, connect: "" };
        const newAnswers = [...answers, newAnswer];
        setAnswers(newAnswers);
        console.log('addAnswer onChange function:', onChange);
        onChange(id, 'answers', newAnswers);  // onChange eventini çağırın
    };

    const startEdit = (index: number | null, value: string) => {
        setEditing(true);
        setEditValue(value);
        setEditingIndex(index);
    };

    const applyEdit = () => {
        setEditing(false);
        if (editingIndex !== null && editingIndex >= 0) {
            const newAnswers = [...answers];
            newAnswers[editingIndex].text[language] = editValue;
            setAnswers(newAnswers);
            onChange(id, 'answers', newAnswers);  // onChange eventini çağırın
        } else if (editingIndex === null) {
            const newQuestion = { ...question, [language]: editValue };
            setQuestion(newQuestion);
            onChange(id, 'question', newQuestion);  // onChange eventini çağırın
        }
        setEditingIndex(null);
    };

    const cancelEdit = () => {
        setEditing(false);
        setEditingIndex(null);
    };

    const deleteAnswer = () => {
        if (editingIndex !== null && editingIndex >= 0) {
            const newAnswers = answers.filter((_, i) => i !== editingIndex);
            setAnswers(newAnswers);
            onChange(id, 'answers', newAnswers);  // onChange eventini çağırın
            cancelEdit();
        }
    };

    return (
        <div className="custom-node">
            <div className="node-header">
                <button onClick={handleLanguageToggle}>{language.toUpperCase()}</button>
                <span>ID: {id}</span>
            </div>
            <Handle type="target" position={Position.Left} id="left-handle" />
            <div className="node-content">
                {editing && editingIndex === null ? (
                    <input
                        type="text"
                        value={editValue}
                        onChange={(e) => setEditValue(e.target.value)}
                        className="node-question-edit"
                    />
                ) : (
                    <div className="node-question" onDoubleClick={() => startEdit(null, question[language])}>
                        {question[language]}
                    </div>
                )}
                {answers.map((answer, index) => (
                    <div key={index} className="node-answer-container">
                        {editing && editingIndex === index ? (
                            <div className="node-answer-edit-container">
                                <input
                                    type="text"
                                    value={editValue}
                                    onChange={(e) => setEditValue(e.target.value)}
                                    className="node-answer-edit"
                                />
                                <button onClick={() => deleteAnswer()} className="delete-answer-button">🗑️</button>
                            </div>
                        ) : (
                            <div
                                className="node-answer"
                                onDoubleClick={() => startEdit(index, answer.text[language])}
                                style={{ position: 'relative' }}
                            >
                                {answer.text[language]}
                                <Handle
                                    type="source"
                                    position={Position.Right}
                                    id={`choice-${index}`} // Benzersiz ID
                                    style={{ top: '50%', transform: 'translateY(-50%)' }}
                                />
                            </div>
                        )}
                    </div>
                ))}
                <button onClick={addAnswer} className="add-answer-button">+</button>
            </div>
            {editing && (
                <div className="edit-controls">
                    <button onClick={applyEdit}>✔️</button>
                    <button onClick={cancelEdit}>❌</button>
                    {editingIndex !== null && editingIndex >= 0 && (
                        <button onClick={deleteAnswer} className="delete-answer-button">-</button>
                    )}
                </div>
            )}
        </div>
    );
};

export default CustomNode;
