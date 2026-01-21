/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,jsx}",
    ],
    darkMode: 'class',
    theme: {
        extend: {
            colors: {
                // Medical theme colors
                primary: {
                    50: '#e6f2ff',
                    100: '#b3d9ff',
                    200: '#80bfff',
                    300: '#4da6ff',
                    400: '#1a8cff',
                    500: '#0073e6',
                    600: '#005bb3',
                    700: '#004280',
                    800: '#002a4d',
                    900: '#00111a',
                },
                success: {
                    50: '#e6f9f0',
                    100: '#b3ecd4',
                    200: '#80dfb8',
                    300: '#4dd29c',
                    400: '#1ac580',
                    500: '#00a862',
                    600: '#00844e',
                    700: '#006039',
                    800: '#003c25',
                    900: '#001810',
                },
                danger: {
                    50: '#ffe6e6',
                    100: '#ffb3b3',
                    200: '#ff8080',
                    300: '#ff4d4d',
                    400: '#ff1a1a',
                    500: '#e60000',
                    600: '#b30000',
                    700: '#800000',
                    800: '#4d0000',
                    900: '#1a0000',
                },
                warning: {
                    50: '#fff9e6',
                    100: '#ffecb3',
                    200: '#ffdf80',
                    300: '#ffd24d',
                    400: '#ffc51a',
                    500: '#e6a800',
                    600: '#b38400',
                    700: '#806000',
                    800: '#4d3900',
                    900: '#1a1300',
                },
            },
            fontFamily: {
                sans: ['Inter', 'system-ui', 'sans-serif'],
                mono: ['JetBrains Mono', 'monospace'],
            },
            animation: {
                'fade-in': 'fadeIn 0.3s ease-in-out',
                'slide-in': 'slideIn 0.3s ease-out',
                'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
            },
            keyframes: {
                fadeIn: {
                    '0%': { opacity: '0' },
                    '100%': { opacity: '1' },
                },
                slideIn: {
                    '0%': { transform: 'translateY(-10px)', opacity: '0' },
                    '100%': { transform: 'translateY(0)', opacity: '1' },
                },
            },
        },
    },
    plugins: [],
}
