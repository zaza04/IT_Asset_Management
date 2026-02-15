"use client"

import React from 'react'
import { Layout, Palette, RotateCcw, Settings } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useThemeManager } from '@/hooks/use-theme-manager'
import { useSidebarConfig } from '@/contexts/sidebar-context'
import { useAppearanceStore } from '@/stores/useAppearanceStore'
import { ThemeTab } from './theme-tab'
import { LayoutTab } from './layout-tab'
import { cn } from '@/lib/utils'

interface ThemeCustomizerProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}


export function CustomizerContent({ className }: { className?: string }) {
  const { resetTheme, applyRadius } = useThemeManager()
  const { config: sidebarConfig, updateConfig: updateSidebarConfig } = useSidebarConfig()

  const {
    resetAppearance,
  } = useAppearanceStore()

  const [activeTab, setActiveTab] = React.useState("theme")

  const handleReset = () => {
    resetAppearance()
    resetTheme()
    applyRadius("0.5rem")
    updateSidebarConfig({ variant: "inset", collapsible: "offcanvas", side: "left" })
  }

  return (
    <div className={cn("flex flex-col space-y-4", className)}>
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h4 className="text-sm font-medium leading-none">Theme Customizer</h4>
          <p className="text-xs text-muted-foreground">Customize your theme and layout.</p>
        </div>
        <Button variant="outline" size="sm" onClick={handleReset} className="cursor-pointer">
          <RotateCcw className="mr-2 h-4 w-4" />
          Reset
        </Button>
      </div>
      <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full flex flex-col">
        <div className="py-2">
          <TabsList className="grid w-full grid-cols-2 rounded-none h-12 p-1.5">
            <TabsTrigger value="theme" className="cursor-pointer data-[state=active]:bg-background"><Palette className="h-4 w-4 mr-1" /> Theme</TabsTrigger>
            <TabsTrigger value="layout" className="cursor-pointer data-[state=active]:bg-background"><Layout className="h-4 w-4 mr-1" /> Layout</TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="theme" className="flex-1 mt-0 space-y-4">
          <ThemeTab />
        </TabsContent>

        <TabsContent value="layout" className="flex-1 mt-0">
          <LayoutTab />
        </TabsContent>
      </Tabs>
    </div>
  )
}

export function ThemeCustomizer({ open, onOpenChange }: ThemeCustomizerProps) {
  const { config: sidebarConfig } = useSidebarConfig()

  return (
    <Sheet open={open} onOpenChange={onOpenChange} modal={false}>
      <SheetContent
        side={sidebarConfig.side === "left" ? "right" : "left"}
        className="w-[400px] p-0 gap-0 pointer-events-auto overflow-hidden flex flex-col"
      >
        <SheetHeader className="space-y-0 p-4 pb-2 border-b">
          <SheetTitle className="text-lg font-semibold">Legacy Customizer</SheetTitle>
          <SheetDescription>Use Settings &gt; Appearance instead.</SheetDescription>
        </SheetHeader>
        <div className="flex-1 overflow-y-auto p-4">
          <CustomizerContent />
        </div>
      </SheetContent>
    </Sheet>
  )
}

export function ThemeCustomizerTrigger({ onClick }: { onClick: () => void }) {
  const { config: sidebarConfig } = useSidebarConfig()

  return (
    <Button
      onClick={onClick}
      size="icon"
      className={cn(
        "fixed top-1/2 -translate-y-1/2 h-12 w-12 rounded-full shadow-lg z-50 bg-primary hover:bg-primary/90 text-primary-foreground cursor-pointer",
        sidebarConfig.side === "left" ? "right-4" : "left-4"
      )}
    >
      <Settings className="h-5 w-5" />
    </Button>
  )
}
