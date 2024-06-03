import { ChakraProvider } from "@chakra-ui/react";
import { Workflow } from "./Workflow/Workflow";
import { LanguageProvider } from './Workflow/LanguageContext';
import { EditProvider } from './Workflow/EditContext';

function App() {
    return (
        <ChakraProvider>
            <EditProvider>
                <LanguageProvider>
                    <Workflow />
                </LanguageProvider>
            </EditProvider>
        </ChakraProvider>
    );
}

export default App;
