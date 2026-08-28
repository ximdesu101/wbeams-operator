import { useTheme } from 'next-themes'

export const useThemeToggle = () => {
    const { resolvedTheme, setTheme } = useTheme()
    const isDark = resolvedTheme === 'dark'
    const toggle = (checked) => setTheme(checked ? 'dark' : 'light')

    return { isDark, toggle }
}