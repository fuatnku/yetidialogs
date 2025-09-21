import React, { createContext, useContext, useState, useEffect } from 'react';

const LanguageContext = createContext();

// Available languages with their details
export const AVAILABLE_LANGUAGES = {
    tr: { code: 'tr', name: 'Türkçe', flag: '🇹🇷' },
    en: { code: 'en', name: 'English', flag: '🇺🇸' },
    de: { code: 'de', name: 'Deutsch', flag: '🇩🇪' },
    fr: { code: 'fr', name: 'Français', flag: '🇫🇷' },
    es: { code: 'es', name: 'Español', flag: '🇪🇸' },
    it: { code: 'it', name: 'Italiano', flag: '🇮🇹' },
    ru: { code: 'ru', name: 'Русский', flag: '🇷🇺' },
    zh: { code: 'zh', name: '中文', flag: '🇨🇳' },
    ja: { code: 'ja', name: '日本語', flag: '🇯🇵' },
    ko: { code: 'ko', name: '한국어', flag: '🇰🇷' }
};

export const LanguageProvider = ({ children }) => {
    const [currentLanguage, setCurrentLanguage] = useState('tr');
    const [selectedLanguages, setSelectedLanguages] = useState(['tr', 'en']);
    const [onLanguagesUpdateCallback, setOnLanguagesUpdateCallback] = useState(null);

    // Load from localStorage on mount
    useEffect(() => {
        const savedLanguages = localStorage.getItem('selectedLanguages');
        const savedCurrentLanguage = localStorage.getItem('currentLanguage');
        
        if (savedLanguages) {
            try {
                const parsedLanguages = JSON.parse(savedLanguages);
                if (Array.isArray(parsedLanguages) && parsedLanguages.length > 0) {
                    setSelectedLanguages(parsedLanguages);
                    
                    // Set current language to first selected if saved language is not in selected
                    if (savedCurrentLanguage && parsedLanguages.includes(savedCurrentLanguage)) {
                        setCurrentLanguage(savedCurrentLanguage);
                    } else {
                        setCurrentLanguage(parsedLanguages[0]);
                    }
                }
            } catch (error) {
                console.error('Error loading languages from localStorage:', error);
            }
        }
    }, []);

    // Save to localStorage when languages change
    useEffect(() => {
        localStorage.setItem('selectedLanguages', JSON.stringify(selectedLanguages));
        localStorage.setItem('currentLanguage', currentLanguage);
    }, [selectedLanguages, currentLanguage]);

    const updateSelectedLanguages = (languages) => {
        if (!Array.isArray(languages) || languages.length === 0) {
            console.warn('Cannot set empty language selection, fallback to default');
            languages = ['tr', 'en']; // fallback to default
        }
        
        // Find newly added languages
        const newLanguages = languages.filter(lang => !selectedLanguages.includes(lang));
        
        setSelectedLanguages(languages);
        
        // If current language is not in new selection, switch to first one
        if (!languages.includes(currentLanguage)) {
            setCurrentLanguage(languages[0]);
        }
        
        // Notify about new languages if callback is set
        if (newLanguages.length > 0 && onLanguagesUpdateCallback) {
            onLanguagesUpdateCallback(newLanguages);
        }
    };

    const registerLanguagesUpdateCallback = (callback) => {
        setOnLanguagesUpdateCallback(() => callback);
    };

    const switchToLanguage = (langCode) => {
        if (selectedLanguages.includes(langCode)) {
            setCurrentLanguage(langCode);
        }
    };

    // For backward compatibility
    const toggleLanguage = () => {
        const currentIndex = selectedLanguages.indexOf(currentLanguage);
        const nextIndex = (currentIndex + 1) % selectedLanguages.length;
        setCurrentLanguage(selectedLanguages[nextIndex]);
    };

    return (
        <LanguageContext.Provider value={{
            language: currentLanguage, // backward compatibility
            currentLanguage,
            selectedLanguages,
            updateSelectedLanguages,
            switchToLanguage,
            toggleLanguage, // backward compatibility
            availableLanguages: AVAILABLE_LANGUAGES,
            registerLanguagesUpdateCallback
        }}>
            {children}
        </LanguageContext.Provider>
    );
};

export const useLanguage = () => useContext(LanguageContext);
