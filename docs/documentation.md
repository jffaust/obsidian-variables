# Documentation

## Getting Started
1. Open the plugin settings (tip: `Ctrl+,` will open Obsidian settings)
2. There should be a single variable configured with the name `$var`
3. Open any markdown file and type `$var`
4. The content shown in Reading mode will be changed to the configured value

## Managing Variables
- **Vault path**: This is the absolute path of a vault. You can specify the `*` character so that the variable applies to any vault. You can validate which variables apply to the current vault with the toggle button (see demo below). You can also use the `Copy current vault path` button to facilitate configuring a variable for the current vault.
- **Variable name** any string you want. The code will look for occurrences of this string and replace it with the corresponding value.
- **variable value**: any string you want but the code will perform HTML sanitization on the value provided before inserting it into the DOM.

Here's a demo showcasing how to add a variable validate which variables apply to the current vault, filter variables, and delete a variable:
![demo](/res/manage-variables-demo.gif)
