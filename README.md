# Obsidian Variables

This is a plugin for [Obsidian.md](https://obsidian.md/) that adds the ability to configure variables per vault, similar to traditional environment variables. The variables get replaced during [Markdown post-processing](https://marcus.se.net/obsidian-plugin-docs/guides/markdown-post-processing) so they can change the final HTML output. This can be used to keep absolute file paths generic and re-usable across multiple devices, as seen in the demo below: 

![demo](./res/obs-vars-demo.gif)

> Does not work with Live Preview. See this [issue](https://github.com/jffaust/obsidian-variables/issues/4) for more info.

## Documentation

- Check out the [full documentation](docs/documentation.md)
- Check out the [changelog](docs/CHANGELOG.md)

## Installation

This plugin is not yet part of the community plugin list so it cannot be installed from Obsidian so it must be installed manually with the following steps:

1. Go to repo's [Releases](https://github.com/jffaust/obsidian-variables/releases) page
2. Download `main.js`, `styles.css` and `manifest.json` from the latest release
3. Move the downloaded files to a new folder inside your plugins folder: `VaultFolder/.obsidian/plugins/obsidian-variables/`
4. Go to `Community plugins` and enable the `Variables` plugin.


## Support

[<img src="https://cdn.buymeacoffee.com/buttons/v2/default-yellow.png" alt="BuyMeACoffee" width="140">](https://www.buymeacoffee.com/jffaust)
