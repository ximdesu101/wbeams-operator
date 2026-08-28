import { Moon, Sun } from 'lucide-react'
import { useThemeToggle } from '@/components/styles/theme/ThemeToggle'

export default function ThemeIcon() {
    const { isDark } = useThemeToggle()

    return isDark
        ? <Moon className="h-4 w-4 transition-all" />
        : <Sun className="h-4 w-4 transition-all" />
}