import React from "react";
import { Handle, HandleProps } from "reactflow";

export default function CustomHandle(props: HandleProps) {
    return (
    <Handle
      style={{
        width: 18,
        height: 18,
        background: "white",
        border: "2px solid black",
      }}
      {...props}
    />
  );
}
