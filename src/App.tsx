import { ChakraProvider } from "@chakra-ui/react";
import { Workflow } from "./Workflow/Workflow";
import { LanguageProvider } from './Workflow/LanguageContext';
import { EditProvider } from './Workflow/EditContext';
import { useState, useEffect } from 'react';
import { Login } from './components/Login';

function App() {
    const [isLoggedIn, setIsLoggedIn] = useState(false);

    useEffect(() => {
        const savedLoginState = localStorage.getItem('isLoggedIn');
        if (savedLoginState === 'true') {
            setIsLoggedIn(true);
        }
    }, []);

    const handleLogout = () => {
        localStorage.removeItem('isLoggedIn');
        setIsLoggedIn(false);
    };

    return (
        <ChakraProvider>
            {!isLoggedIn ? (
                <Login onLogin={() => setIsLoggedIn(true)} />
            ) : (
                <EditProvider>
                    <LanguageProvider>
                        <Workflow onLogout={handleLogout} />
                    </LanguageProvider>
                </EditProvider>
            )}
        </ChakraProvider>
    );
}

export default App;
