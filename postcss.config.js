module.exports = {
    plugins: {
        tailwindcss: {},
        autoprefixer: {},
        // CSS optimization for production
        ...(process.env.NODE_ENV === 'production' && {
            cssnano: {
                preset: ['default', {
                    discardComments: {
                        removeAll: true,
                    },
                    normalizeWhitespace: true,
                    minifyFontValues: true,
                    minifyGradients: true,
                }],
            },
        }),
    },
};
