import React, { useState } from 'react';
import { 
    Box, 
    Button, 
    Checkbox, 
    VStack, 
    HStack, 
    Text, 
    Modal,
    ModalOverlay,
    ModalContent,
    ModalHeader,
    ModalFooter,
    ModalBody,
    ModalCloseButton,
    IconButton,
    useDisclosure
} from '@chakra-ui/react';
import { FaCog } from 'react-icons/fa';
import { useLanguage, AVAILABLE_LANGUAGES } from './LanguageContext';

const LanguageConfig: React.FC = () => {
    const { isOpen, onOpen, onClose } = useDisclosure();
    const { selectedLanguages, updateSelectedLanguages } = useLanguage();
    const [tempSelectedLanguages, setTempSelectedLanguages] = useState<string[]>(selectedLanguages);

    const handleLanguageToggle = (langCode: string) => {
        setTempSelectedLanguages(prev => {
            if (prev.includes(langCode)) {
                // Don't allow removing if it's the last language
                if (prev.length === 1) {
                    return prev;
                }
                return prev.filter(code => code !== langCode);
            } else {
                return [...prev, langCode];
            }
        });
    };

    const handleSave = () => {
        if (tempSelectedLanguages.length === 0) {
            // This should not happen due to UI restrictions, but added as safety
            console.warn('Cannot save empty language selection');
            return;
        }
        updateSelectedLanguages(tempSelectedLanguages);
        onClose();
    };

    const handleCancel = () => {
        setTempSelectedLanguages(selectedLanguages);
        onClose();
    };

    const handleOpen = () => {
        setTempSelectedLanguages(selectedLanguages);
        onOpen();
    };

    return (
        <>
            <IconButton
                icon={<FaCog />}
                size="sm"
                onClick={handleOpen}
                colorScheme="blue"
                variant="outline"
                title="Language Configuration"
                aria-label="Language Configuration"
                m={1}
            />

            <Modal isOpen={isOpen} onClose={handleCancel} size="md">
                <ModalOverlay />
                <ModalContent>
                    <ModalHeader>Language Configuration</ModalHeader>
                    <ModalCloseButton />
                    <ModalBody>
                        <VStack align="stretch" spacing={4}>
                            <Box>
                                <Text fontSize="sm" color="gray.600" mb={1}>
                                    Diyaloglarınızda kullanmak istediğiniz dilleri seçin.
                                </Text>
                                <Text fontSize="xs" color="gray.500">
                                    Select the languages you want to use in your dialogs. At least one language must be selected.
                                </Text>
                            </Box>
                            
                            <VStack align="stretch" spacing={2} maxH="300px" overflowY="auto">
                                {Object.values(AVAILABLE_LANGUAGES).map((lang) => (
                                    <HStack key={lang.code} spacing={3} p={2} borderRadius="md" _hover={{ bg: "gray.50" }}>
                                        <Checkbox
                                            isChecked={tempSelectedLanguages.includes(lang.code)}
                                            onChange={() => handleLanguageToggle(lang.code)}
                                            isDisabled={tempSelectedLanguages.length === 1 && tempSelectedLanguages.includes(lang.code)}
                                        />
                                        <Text fontSize="lg">{lang.flag}</Text>
                                        <Text flex="1">{lang.name}</Text>
                                        <Text fontSize="sm" color="gray.500" textTransform="uppercase">
                                            {lang.code}
                                        </Text>
                                    </HStack>
                                ))}
                            </VStack>

                            {tempSelectedLanguages.length === 1 && (
                                <Box p={3} bg="orange.50" borderRadius="md" border="1px solid" borderColor="orange.200">
                                    <Text fontSize="sm" color="orange.600" fontWeight="semibold">
                                        ⚠️ En az bir dil seçili olmalıdır
                                    </Text>
                                    <Text fontSize="xs" color="orange.500" mt={1}>
                                        At least one language must be selected
                                    </Text>
                                </Box>
                            )}
                        </VStack>
                    </ModalBody>

                    <ModalFooter>
                        <HStack spacing={3}>
                            <Button variant="ghost" onClick={handleCancel}>
                                Cancel
                            </Button>
                            <Button 
                                colorScheme="blue" 
                                onClick={handleSave}
                                isDisabled={tempSelectedLanguages.length === 0}
                            >
                                Save Configuration
                            </Button>
                        </HStack>
                    </ModalFooter>
                </ModalContent>
            </Modal>
        </>
    );
};

export default LanguageConfig;
