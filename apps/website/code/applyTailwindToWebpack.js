const postcssNormalize = require("postcss-normalize");
const tailwindcss = require("@tailwindcss/postcss7-compat");

/**
 * A utility to recursively traverse loaders and execute the "onLoader" callback.
 */
const traverseLoaders = (loaders, onLoader) => {
    for (const loader of loaders) {
        if (loader.oneOf) {
            traverseLoaders(loader.oneOf, onLoader);
        } else if (loader.use) {
            traverseLoaders(loader.use, onLoader);
        } else {
            onLoader(loader);
        }
    }
};

/**
 * postcss-loader plugins factory
 */
const pluginsConfig = () => [
    tailwindcss(),
    require("postcss-flexbugs-fixes"),
    require("postcss-preset-env")({
        autoprefixer: {
            flexbox: "no-2009"
        },
        stage: 3,
        features: {
            "custom-properties": false
        }
    }),
    postcssNormalize()
];

/**
 * A helper function to modify webpack config
 */
module.exports = config => {
    /**
     * Traverse all loaders, find `postcss-loader`, and overwrite plugins.
     */
    traverseLoaders(config.module.rules, loader => {
        // `loader` can also be a string, so check for `.loader` property
        if (loader.loader && loader.loader.includes("postcss-loader")) {
            console.log("Modify", loader.loader);
            loader.options.plugins = pluginsConfig();
        }
    });

    return config;
};
