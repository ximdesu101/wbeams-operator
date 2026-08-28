import { Switch } from '@/components/ui/switch'
import { useThemeToggle } from '@/components/styles/theme/ThemeToggle'

export default function ThemeSwitch() {
    const { isDark, toggle } = useThemeToggle()

    return (
        <Switch
            checked={isDark}
            onCheckedChange={toggle}
            aria-label="Toggle dark mode"
        />
    )
}