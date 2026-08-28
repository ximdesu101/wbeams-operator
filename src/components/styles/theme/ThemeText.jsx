import { useThemeToggle } from '@/components/styles/theme/ThemeToggle'
import { Label } from "@/components/ui/label"

export default function ThemeText() {
    const { isDark } = useThemeToggle()

    return isDark
        ? <Label className="transition-all">Dark Mode</Label>
        : <Label className="transition-all">Light Mode</Label>
}