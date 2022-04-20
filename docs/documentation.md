# Documentation

## Getting Started
1. Open the plugin settings (tip: `Ctrl+,` will open Obsidian settings)
2. There should be a single variable configured with the name `demo`
3. Open any markdown file and type `demo`
4. The content shown in Reading mode will be changed to the configured value

## Managing Variables
- **Vault path**: This is the absolute path of a vault. You can specify the `*` character so that the variable applies to any vault. You can validate which variables apply to the current vault with the toggle button (see demo below). You can also use the `Copy current vault path` button to facilitate configuring a variable for the current vault.
- **Variable name** & **variable value**: any string you want. The code does a simple string substitution for all occurrences found.

Here's a demo showcasing how to add a variable validate which variables apply to the current vault, filter variables, and delete a variable:
![demo](/res/obs-vars-demo.gif)
