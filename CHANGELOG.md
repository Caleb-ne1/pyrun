# Changelog

All notable changes to PyRun will be documented in this file.

## [1.1.0] - 2026-02-12
### Added
- Optional `--reload` for Flask and FastAPI projects  
- Custom reload directories via `--reloadDirs` for large projects  
- Support for running Python modules with `--module` (e.g. pyinstaller, pytest, black)  
- Extra CLI arguments support via `--extraArgs` for modules and scripts   


---

## [1.0.1] - 2026-02-06
### Added
- Initial public release of PyRun  
- One-command project initialization  
- Automatic virtual environment creation  
- Structured dependency tracking via `modules.json`  
- Framework-aware run commands for Django, Flask, FastAPI, and plain Python  
- Host and port override support  
- Automatic server refresh on dependency changes  
- Structured dependency tracking via `modules.json`
- Smart install, upgrade and downgrade handling 
- Bulk dependency installation (`--all`)
