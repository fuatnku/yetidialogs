import React, { useState } from 'react';
import {
    Box,
    Button,
    FormControl,
    FormLabel,
    Input,
    VStack,
    Heading,
    useToast,
    Container,
    Center,
    Checkbox,
} from '@chakra-ui/react';

interface LoginProps {
    onLogin: () => void;
}

export const Login: React.FC<LoginProps> = ({ onLogin }) => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [rememberMe, setRememberMe] = useState(false);
    const toast = useToast();

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (username === 'admin' && password === 'yeti12345') {
            if (rememberMe) {
                localStorage.setItem('isLoggedIn', 'true');
            }
            onLogin();
        } else {
            toast({
                title: 'Hata',
                description: 'Kullanıcı adı veya şifre hatalı!',
                status: 'error',
                duration: 3000,
                isClosable: true,
            });
        }
    };

    return (
        <Container maxW="container.sm" py={10}>
            <Center>
                <Box w="100%" p={8} borderWidth={1} borderRadius={8} boxShadow="lg">
                    <VStack spacing={4}>
                        <Heading>Giriş Yap</Heading>
                        <form onSubmit={handleSubmit} style={{ width: '100%' }}>
                            <VStack spacing={4}>
                                <FormControl isRequired>
                                    <FormLabel>Kullanıcı Adı</FormLabel>
                                    <Input
                                        type="text"
                                        value={username}
                                        onChange={(e) => setUsername(e.target.value)}
                                    />
                                </FormControl>
                                <FormControl isRequired>
                                    <FormLabel>Şifre</FormLabel>
                                    <Input
                                        type="password"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                    />
                                </FormControl>
                                <Checkbox 
                                    isChecked={rememberMe} 
                                    onChange={(e) => setRememberMe(e.target.checked)}
                                >
                                    Beni Hatırla
                                </Checkbox>
                                <Button type="submit" colorScheme="blue" width="100%">
                                    Giriş Yap
                                </Button>
                            </VStack>
                        </form>
                    </VStack>
                </Box>
            </Center>
        </Container>
    );
}; 