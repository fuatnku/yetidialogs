import { NodeProps as ReactFlowNodeProps } from "reactflow";

export interface CustomNodeProps {
    [key: string]: Node;
}

export interface Node extends ReactFlowNodeProps {
    id: string;
    type: 'customNode';
    position: { x: number; y: number };
    data: {
        tr: string;
        en: string;
        question?: TranslatedText;
        answers?: Answer[];
        isRandomOrder?: boolean;
        isIconNode?: boolean;
    };
}

export interface TranslatedText {
    en: string;
    tr: string;
}

export interface Answer {
    text: TranslatedText;
    connect?: string;
}
