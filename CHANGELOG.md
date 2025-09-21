# Changelog

## v1.3.0 - 2025-09-19

### Added
- **Multi-Language System**: Complete overhaul of language management
  - Language configuration panel with checkboxes for selecting active languages
  - Support for 10 languages: Turkish, English, German, French, Spanish, Italian, Russian, Chinese, Japanese, Korean
  - Flag-based language switcher in toolbar replacing single toggle button
  - Languages array at top of JSON export/import files
  - LocalStorage persistence for selected languages (default: TR, EN)
- **Auto-Translation Placeholders**: When new languages are added, all existing nodes automatically get "Translate" placeholders
- **Enhanced Language Configuration**: 
  - Config button moved to right side of toolbar (gear icon only)
  - Strengthened minimum one language selection requirement
  - Visual warnings and disabled states for invalid configurations
  - Bilingual UI texts (Turkish/English)

### Changed
- Replaced EN/TR toggle button with flag-based language selector
- Removed language toggle from dialog node headers
- Updated export/import system to include languages configuration
- Enhanced LanguageContext with multi-language support and backward compatibility
- Config button repositioned and simplified to gear icon only

### Fixed
- **Export Language Filtering**: Export now only includes selected languages in JSON output, removed languages are properly excluded

### Technical Details
- New `LanguageConfig` component for language management
- Extended `LanguageContext` with `selectedLanguages` state
- Updated JSON file structure with `languages` keyword
- Automatic language configuration import/export
- Maintained backward compatibility for existing workflows
- Auto-translation system for newly added languages
- Callback system for language updates to propagate to all nodes
- Enhanced validation and safety checks for language selection
- Language filtering in export functions (both file and clipboard export)
- Filtered descriptions and node content to match selected languages only

## Version 1.1.1 - 2025-09-19
### Fixed
- Fixed workflow area being cropped from the bottom by changing container height from 85vh to 100vh

## v1.2.0 - 2025-01-19

### Added
- **Multi-language Support for Descriptions**: Descriptions now support English and Turkish languages
  - Each description stores both EN and TR versions
  - UI shows current language in panel header
  - Language switching affects description editing
  - Backward compatibility with old single-language descriptions

### Technical Details
- Updated description state from string[] to {en: string, tr: string}[]
- Added language indicator in description panel
- Automatic conversion of old format during import
- Multi-language descriptions in JSON export/import

## v1.1.1 - 2025-01-19

### Fixed
- Fixed import error for FaFileText icon, replaced with FaFileAlt

## v1.1.0 - 2025-01-19

### Added
- **Description Feature**: Added comprehensive description management system
  - Resizable left panel for managing descriptions
  - Toggle button in toolbar to show/hide description panel
  - Add, edit, and delete descriptions functionality
  - Descriptions export at the top of JSON files
  - Full undo/redo support for description operations
  - LocalStorage persistence for descriptions
  - Mouse-resizable panel width (200px - 600px)
  - Visual feedback for panel state in toolbar button

### Technical Details
- Added description state management to Workflow component
- Integrated descriptions into history system for undo/redo
- Updated export/import functions to handle descriptions
- Added responsive design for description panel
- Implemented drag-to-resize functionality for panel width

### UI/UX Improvements
- Clean, modern design for description panel
- Intuitive add/delete operations with visual feedback
- Smooth transitions for panel open/close
- Status bar now shows description count (d:X)
