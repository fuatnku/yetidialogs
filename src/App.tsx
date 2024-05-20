import { ChakraProvider } from "@chakra-ui/react";
import { useState } from "react";
import { Workflow } from "./Workflow/Workflow";
import { useStoreState } from 'react-flow-renderer';


function App() {
  return (
    <ChakraProvider>
      <Workflow />
    </ChakraProvider>
  );
}

export default App;
