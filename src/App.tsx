import { ChakraProvider } from "@chakra-ui/react";
import { Workflow } from "./Workflow/Workflow";
import { LanguageProvider } from './Workflow/LanguageContext';
import { EditProvider } from './Workflow/EditContext';
import { useState } from 'react';
import { Login } from './components/Login';

function App() {
    const [isLoggedIn, setIsLoggedIn] = useState(false);

    return (
        <ChakraProvider>
            {!isLoggedIn ? (
                <Login onLogin={() => setIsLoggedIn(true)} />
            ) : (
                <EditProvider>
                    <LanguageProvider>
                        <Workflow />
                    </LanguageProvider>
                </EditProvider>
            )}
        </ChakraProvider>
    );
}

export default App;
