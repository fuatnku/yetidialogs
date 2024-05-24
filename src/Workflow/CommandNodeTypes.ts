// CommandNodeTypes.ts
import { NodeProps as ReactFlowNodeProps } from "reactflow";

export interface PauseNodeProps {
    [key: string]: Node;
}

export interface Node extends ReactFlowNodeProps {
    command?: string[];
}
