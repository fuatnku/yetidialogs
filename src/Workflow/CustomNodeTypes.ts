// CustomNodeTypes.ts
import { NodeProps as ReactFlowNodeProps } from "reactflow";

export interface CustomNodeProps {
    [key: string]: Node;
}

export interface Node extends ReactFlowNodeProps {
    tr: string;
    en: string;
    question?: TranslatedText;
    answers?: Answer[];
    isRandomOrder?: RandomOrder;
    isIconNode?: IconNode;
}

export interface TranslatedText {
    en: string;
    tr: string;
}

export interface Answer {
    text: TranslatedText;
    connect?: string;
}

export interface RandomOrder {
    isRandomOrder: boolean;
}

export interface IconNode {
    isIconNode: boolean;
}