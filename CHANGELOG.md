# Changelog

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
