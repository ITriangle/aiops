import { NavLink, Outlet } from 'react-router-dom'
import { useI18n } from '../lib/i18n'
import { cn } from '../lib/utils'
import { Button } from '../components/ui/button'
import { Sheet, SheetContent, SheetTrigger } from '../components/ui/sheet'
import { Menu } from 'lucide-react'

const sidebarItems = [
  { to: '/docs/getting-started', icon: '→', en: 'Getting Started', zh: '快速开始' },
  { to: '/docs/skills', icon: '⚡', en: 'Skills', zh: '技能' },
  { to: '/docs/agents', icon: '🤖', en: 'Agents', zh: 'Agent 介绍' },
  { to: '/docs/demos', icon: '📊', en: 'Demos & Benchmarks', zh: '实例与效果' },
]

function SidebarContent() {
  const { lang } = useI18n()
  return (
    <nav className="space-y-1">
      {sidebarItems.map((item) => (
        <NavLink
          key={item.to}
          to={item.to}
          className={({ isActive }) => cn(
            'flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-all',
            isActive
              ? 'bg-primary/10 text-primary font-medium'
              : 'text-muted-foreground hover:text-foreground hover:bg-muted'
          )}
        >
          <span className="text-base">{item.icon}</span>
          {lang === 'zh' ? item.zh : item.en}
        </NavLink>
      ))}
    </nav>
  )
}

export default function DocsLayout() {
  const { t } = useI18n()
  return (
    <div className="relative z-10 max-w-6xl mx-auto pt-20 pb-16 px-6">
      <div className="flex gap-8">
        {/* Desktop sidebar */}
        <aside className="hidden md:block w-64 flex-shrink-0">
          <div className="sticky top-24 ai-panel rounded-xl p-4">
            <h3 className="relative font-mono text-[0.68rem] uppercase tracking-[0.12em] text-[var(--cyan)] mb-4 flex items-center gap-2"
              style={{ textShadow: '0 0 10px rgba(34,211,238,0.3)' }}>
              <span className="h-1.5 w-1.5 rounded-full bg-[var(--cyan)] shadow-[0_0_10px_rgba(34,211,238,0.8)]" />
              {t('docs.sidebar')}
            </h3>
            <div className="relative">
              <SidebarContent />
            </div>
          </div>
        </aside>

        {/* Mobile sidebar trigger */}
        <div className="md:hidden fixed bottom-5 right-5 z-40">
          <Sheet>
            <SheetTrigger render={<Button size="icon" className="rounded-full shadow-lg" />}>
              <Menu className="w-5 h-5" />
            </SheetTrigger>
            <SheetContent side="left" className="w-64 p-5">
              <h3 className="font-mono text-xs uppercase tracking-wider text-muted-foreground mb-4">
                {t('docs.sidebar')}
              </h3>
              <SidebarContent />
            </SheetContent>
          </Sheet>
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0 rounded-2xl border border-border/60 bg-background/25 backdrop-blur-sm p-0 md:p-6">
          <Outlet />
        </div>
      </div>
    </div>
  )
}
