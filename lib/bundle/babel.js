"use strict";

let { requireOptional } = require("../util");

module.exports = function generateTranspiler({ esnext, jsx, exclude }, { browsers }) {
	let settings = {};
	let plugins = [];
	let extensions = [];

	if(exclude) {
		settings.exclude = exclude.map(pkg => {
			// distinguish paths from package identifiers - as per Node's
			// resolution algorithm <https://nodejs.org/api/modules.html>, a
			// string is a path if it begins with `/`, `./` or `../`
			// FIXME: duplicates `AssetManager#resolvePath`, resulting in
			//        inconsistency WRT working directory
			return /^\.{0,2}\//.test(pkg) ? pkg : `node_modules/${pkg}/**`;
		});
	}

	if(esnext) {
		settings.presets = [
			["env", {
				modules: false,
				targets: {
					browsers: browsers || []
				}
			}]
		];
		plugins.push("external-helpers");
	}

	if(jsx) {
		extensions.push(".jsx");
		let { pragma } = jsx;
		plugins.push(["transform-react-jsx", pragma ? { pragma } : {}]);
	}

	if(plugins.length) {
		settings.plugins = plugins;
	}

	let babel = requireOptional("rollup-plugin-babel",
			"failed to activate ESNext transpiler", "faucet-pipeline-esnext");
	return {
		plugin: babel(settings),
		extensions
	};
};
