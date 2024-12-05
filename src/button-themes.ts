interface ThemeConfig {
    background: string;
    color: string;
    border: string;
    hoverBg: string;
    shadow: string;
    backdropFilter?: string;
    textShadow?: string;
}

export const buttonThemes: Record<string, ThemeConfig> = {
    default: {
        background: 'linear-gradient(90deg, #4F46E5 0%, #7C3AED 100%)',
        color: '#ffffff',
        border: 'none',
        hoverBg: 'linear-gradient(90deg, #4338CA 0%, #6D28D9 100%)',
        shadow: '0 4px 6px rgba(124, 58, 237, 0.2)'
    },
    light: {
        background: '#ffffff',
        color: '#1f2937',
        border: '1px solid #e5e7eb',
        hoverBg: '#f9fafb',
        shadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
    },
    dark: {
        background: '#1f2937',
        color: '#ffffff',
        border: 'none',
        hoverBg: '#111827',
        shadow: '0 1px 3px rgba(0, 0, 0, 0.2)'
    }
} as const;

export type ButtonTheme = keyof typeof buttonThemes;
