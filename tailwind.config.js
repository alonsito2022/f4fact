/** @type {import('tailwindcss').Config} */
module.exports = {
    content: [
        "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
        "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
        "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
        "./node_modules/flowbite/**/*.js",
    ],
    darkMode: "class",
    theme: {
        extend: {
            backgroundImage: {
                "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
                "gradient-conic":
                    "conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))",
            },
            fontFamily: {
                encodeSansCondensed: ["EncodeSansCondensed", "sans-serif"],
                monserga: ["Monserga", "sans-serif"],
                nulshock: ["Nulshock", "sans-serif"],
                omnib: ["Omnib", "sans-serif"],
            },
        },
    },
    plugins: [],
    rules: {
        "@next/next/no-img-element": "off",
    },
};
