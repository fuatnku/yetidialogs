import React, { useState, useEffect, MouseEvent } from 'react';
import { Handle, Position, useOnSelectionChange } from 'reactflow';
import { useLanguage } from './LanguageContext'; // Import the useLanguage hook
import { Node } from './CustomNodeTypes';
import './custom-node.css';

interface Answer {
    id: string;
    text: {
        en: string;
        tr: string;
    };
    connect: string;
}

interface CustomNodeComponentProps {
    id: string;
    data: Node & {
        id: string;
        onChange: (id: string, field: string, value: any) => void;
        onDataChange: (id: string, newData: any) => void;
    };
}

const CustomNode: React.FC<CustomNodeComponentProps> = ({ id, data }) => {
    const { language, toggleLanguage } = useLanguage(); // Use language from context
    const [isSelected, setIsSelected] = useState(false);

    useOnSelectionChange({
        onChange: ({ nodes }) => {
            setIsSelected(nodes.some(node => node.id === id));
        },
    });

    const [question, setQuestion] = useState(data.question || {
        en: "Here, enter a question",
        tr: "Buraya bir soru girin"
    });
    const [answers, setAnswers] = useState<Answer[]>(data.answers || []);
    const [isRandomOrder, setIsRandomOrder] = useState(data.isRandomOrder || false);
    const [isIconNode, setIsIconNode] = useState(data.isIconNode || false);
    const [editing, setEditing] = useState(false);
    const [editValue, setEditValue] = useState('');
    const [editingIndex, setEditingIndex] = useState<number | null>(null);

    useEffect(() => {
        if (data.onDataChange) {
            data.onDataChange(id, { question, answers, isRandomOrder, isIconNode });
        }
    }, [question, answers, isRandomOrder, isIconNode]);

    const generateAnswerId = () => `answer-${Math.random().toString(36).substring(2, 11)}`;

    const addAnswer = () => {
        const newAnswer = { id: generateAnswerId(), text: { en: "New answer", tr: "Yeni cevap" }, connect: "" };
        const newAnswers = [...answers, newAnswer];
        setAnswers(newAnswers);
        data.onChange(id, 'answers', newAnswers);
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

    const deleteAnswer = () => {
        if (editingIndex !== null && editingIndex >= 0) {
            setEditing(false);
            const newAnswers = answers.filter((_, i) => i !== editingIndex);
            setAnswers(newAnswers);
            data.onChange(id, 'answers', newAnswers);
        }
    };

    function toggleRandomOrder(event: MouseEvent<HTMLButtonElement, MouseEvent>): void {
        const orderStyle = !isRandomOrder;
        setIsRandomOrder(orderStyle);
    }

    function toggleIconNode(event: MouseEvent<HTMLButtonElement, MouseEvent>): void {
        const iconStyle = !isIconNode;
        setIsIconNode(iconStyle);
    }

    return (
        <div className={`custom-node ${isSelected ? 'selected' : ''}`}>
            <div className="node-header-custom">
                <button onClick={toggleLanguage}>Question Node - {language.toUpperCase()}</button>
                <span className="node-id">ID: {id}</span>
            </div>
            <Handle
                type="target"
                position={Position.Left}
                id="left-handle"
                style={{ background: 'gray',width:10,height:10,transform: 'translateX(-50%)' }}
            />

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
                    <div key={answer.id} className="node-answer-container">
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
                                style={{position: 'relative'}}
                            >
                                {answer.text[language]}
                                <Handle
                                    type="source"
                                    position={Position.Right}
                                    id={answer.id}
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
                        )}
                    </div>
                ))}
                {!editing && (
                    <button onClick={addAnswer} className="add-answer-button">
                        {language === "en" ? "Add " : "Ekle"}
                    </button>
                )}
                {!editing && (
                    <button onClick={toggleRandomOrder} className="set-random-order-button">
                        {isRandomOrder ? "Random" : "Normal"}
                    </button>
                )}
                {!editing && (
                    <button onClick={toggleIconNode} className="set-random-order-button">
                        {isIconNode ? "icon" : "text"}
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
