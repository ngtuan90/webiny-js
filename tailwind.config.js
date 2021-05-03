module.exports = {
    purge: {
        content: ["./packages/**/*.tsx", "./apps/**/*.tsx"]
    },
    darkMode: false, // or 'media' or 'class'
    future: {
        purgeLayersByDefault: true,
        removeDeprecatedGapUtilities: true
    },
    inset: {
        0: 0,
        auto: "auto",
        "1/2": "50%"
    },
    extend: {
        colors: {
            "aquaty-terra": "#a59d97",
            "aquaty-verde": "#a5c9af",
            "aquaty-aqua": "#7f99c5",
            "aquaty-air": "#d0e5f9",
            "aquaty-sun": "#f7ebb7",
            "aquaty-punk": "#ff00ff"
        },
        spacing: {
            34: "9.5rem",
            72: "18rem",
            84: "21rem",
            96: "24rem",
            128: "32rem",
            160: "40rem",
            192: "48rem"
        }
    },
    theme: {
        extend: {}
    },
    variants: {
        extend: {}
    }
};
