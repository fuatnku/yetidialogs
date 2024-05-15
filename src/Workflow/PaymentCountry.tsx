import React, { useState } from 'react';
import { Box, Flex, Text, Input, IconButton } from "@chakra-ui/react";
import { CheckIcon, CloseIcon } from "@chakra-ui/icons";
import ReactCountryFlag from "react-country-flag";
import { NodeProps } from "reactflow";

interface PaymentCountryProps extends NodeProps {
    data: {
        currency: string;
        country: string;
        countryCode: string;
    };
    setCountry: (id: string, newCountry: string) => void;
}

export default function PaymentCountry({
                                           id,
                                           data: { currency, country, countryCode },
                                       }: PaymentCountryProps) {
    const [isEditing, setIsEditing] = useState(false);
    const [editedCountry, setEditedCountry] = useState(country);

    const handleEdit = () => {
        setIsEditing(true);
    };

    const handleSave = () => {
        setIsEditing(false);
        setCountry(id, editedCountry);  // Üst bileşende tanımlanan setCountry fonksiyonunu çağır
    };

    // load nodes from local storage and set them to the state
    const setCountry = (id: string, newCountry: string) => {
        let loadedNodes = localStorage.getItem('workflowNodes');
        if (loadedNodes) { // if loadedNodes is not null
            console.log(id, newCountry);

            console.log(loadedNodes);
            const nodes=JSON.parse(loadedNodes);
            const updatednodes = nodes.map(node =>
                node.id === id ? { ...node, data: { ...node.data, country: newCountry }} : node
            );
            loadedNodes=JSON.stringify(updatednodes);
            console.log(loadedNodes);
            localStorage.setItem('workflowNodes1', loadedNodes);
        }
    }
    const handleCancel = () => {
        setIsEditing(false);
        setEditedCountry(country);
    };

    return (
        <Flex direction="column" alignItems="center" gap={2}>
            <Flex
                alignItems="center"
                borderRadius="8px"
                bg="#e2e8f0"
                border="2px solid #bbbdbf"
                p={2}
                width="155px"
                onClick={handleEdit}
            >
                <Box>
                    <ReactCountryFlag
                        countryCode={countryCode}
                        svg
                        aria-label={country}
                        style={{ fontSize: "2em", lineHeight: "2em" }}
                    />
                </Box>
                <Flex grow="1">
                    <Box flex="1">
                        {isEditing ? (
                            <Input
                                value={editedCountry}
                                onChange={(e) => setEditedCountry(e.target.value)}
                                size="sm"
                            />
                        ) : (
                            <Text>{editedCountry}</Text>
                        )}
                        <Text fontSize="x-small">{currency}</Text>
                    </Box>
                </Flex>
            </Flex>
            {isEditing && (
                <Flex gap={2}>
                    <IconButton
                        aria-label="Save"
                        icon={<CheckIcon />}
                        size="sm"
                        onClick={handleSave}
                    />
                    <IconButton
                        aria-label="Cancel"
                        icon={<CloseIcon />}
                        size="sm"
                        onClick={handleCancel}
                    />
                </Flex>
            )}
        </Flex>
    );
}