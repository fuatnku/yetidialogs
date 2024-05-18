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
    condition?: Condition[];
}

export interface TranslatedText {
    en: string;
    tr: string;
}

export interface Answer {
    text: TranslatedText;
    connect?: string;
}

export interface Condition {
    formula?: string;
    connect: string;
}
