# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.3.0] - 2022-04-20
### Changed
- Initial documentation
- Variable filtering nows compares everything in lower case
- Disabled LivePreview mode until CodeMirror allows for raw string replacement

## [0.2.0] - 2022-03-19
### Added
- Partial support for LivePreview mode
- Debug mode that will highlight LivePreview lines when enabled
- Command to open the plugin's settings. Open the command palette and search for `Manage variables`


## [0.1.0] - 2022-03-14
### Added
- First implementation with support for Reading mode only
- Variables can be added, edited and deleted
- Variables can be configured to be vault-specific via the vault path property
- Toggle between showing all variables and only the ones that apply
- Filter shown variables
- Copy current vault path button
- Button to link to the documentation


[0.2.0]: https://github.com/jffaust/obsidian-variables/compare/0.3.0...0.2.0
[0.2.0]: https://github.com/jffaust/obsidian-variables/compare/0.2.0...0.1.0
[0.1.0]: https://github.com/jffaust/obsidian-variables/releases/tag/0.1.0