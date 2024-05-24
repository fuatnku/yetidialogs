import { ChakraProvider } from "@chakra-ui/react";
import { useState } from "react";
import { Workflow } from "./Workflow/Workflow";
import { useStoreState } from 'react-flow-renderer';
import { LanguageProvider } from './Workflow/LanguageContext.jsx';


function App() {
  return (
    <ChakraProvider>
        <LanguageProvider>
            <Workflow />
        </LanguageProvider>
    </ChakraProvider>
  );
}

export default App;
