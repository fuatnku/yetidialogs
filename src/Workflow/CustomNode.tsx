import React, { useState } from 'react';
import { Handle, Position, useOnSelectionChange } from 'reactflow';
import { Node } from './CustomNodeTypes';
import './custom-node.css';


interface CustomNodeComponentProps {
    id: string;
    data: Node;
    onDataChange: (id: string, newData: Node) => void;
    onChange: (id: string, field: string, value: any) => void;
}

const CustomNode: React.FC<CustomNodeComponentProps> = ({ id, data, onDataChange, onChange }) => {
    const [isSelected, setIsSelected] = useState(false);

    useOnSelectionChange({
        onChange: ({ nodes }) => {
            const isSelected = nodes.some(node => node.id === id);
            setIsSelected(isSelected);
        },
    });

    const [language, setLanguage] = useState<'en' | 'tr'>('en');
    const [question, setQuestion] = useState(data.question || {
        en: "Here, enter a question",
        tr: "Buraya bir soru girin"
    });
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
        onDataChange(id, { ...data, answers: newAnswers });
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
            onDataChange(id, { ...data, answers: newAnswers });
        } else if (editingIndex === null) {
            const newQuestion = { ...question, [language]: editValue };
            setQuestion(newQuestion);
            onChange(id, 'question', newQuestion);
        }
        setEditingIndex(null);
    };

    const cancelEdit = () => {
        setEditing(false);
        setEditingIndex(null);
    };

    const deleteAnswer = () => {
        if (editingIndex !== null && editingIndex >= 0) {
            setEditing(false);
            const newAnswers = answers.filter((_, i) => i !== editingIndex);
            setAnswers(newAnswers);
            onChange(id, 'answers', newAnswers);
        }
    };

    return (
        <div className={`custom-node ${isSelected ? 'selected' : ''}`}>
            <div className="node-header">
                <button onClick={handleLanguageToggle}>{language.toUpperCase()}</button>
                <span>ID: {id}</span>
            </div>
            <Handle type="target" position={Position.Left} id="left-handle" />
            <div className="node-content">
                {editing && editingIndex === null ? (
                    <textarea
                        value={editValue}
                        onChange={(e) => setEditValue(e.target.value)}
                        className="node-question-edit"
                        rows={4}
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
                                <textarea
                                    value={editValue}
                                    onChange={(e) => setEditValue(e.target.value)}
                                    className="node-answer-edit"
                                    rows={2}
                                />
                                <button onClick={deleteAnswer} className="delete-answer-button">🗑️</button>
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
                                    id={`choice-${index}`}
                                    style={{ top: '50%', transform: 'translateY(-50%)' }}
                                />
                            </div>
                        )}
                    </div>
                ))}
                {!editing && (
                    <button onClick={addAnswer} className="add-answer-button">
                        {language === "en" ? "Add Answer" : "Cevap Ekle"}
                    </button>
                )}
            </div>
            {editing && (
                <div className="edit-controls">
                    <button onClick={applyEdit}>✔️</button>
                    <button onClick={cancelEdit}>❌</button>
                </div>
            )}
        </div>
    );
};

export default CustomNode;
