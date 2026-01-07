"use client"

import { cn } from "@/lib/utils"
import { MouseEvent, ReactNode, useEffect, useRef, useState } from "react"

interface Tab {
  id: string
  label: string
  icon?: ReactNode
  content: ReactNode
  disabled?: boolean
}

interface MaterialTabsProps {
  tabs: Tab[]
  defaultTab?: string
  variant?: "standard" | "fullWidth" | "scrollable"
  className?: string
  onChange?: (tabId: string) => void
}

export function MaterialTabs({ tabs, defaultTab, variant = "standard", className, onChange }: MaterialTabsProps) {
  const [activeTab, setActiveTab] = useState(defaultTab || tabs[0]?.id)
  const [indicatorStyle, setIndicatorStyle] = useState({ left: 0, width: 0 })
  const tabsRef = useRef<(HTMLButtonElement | null)[]>([])
  const tabListRef = useRef<HTMLDivElement>(null)

  // Update indicator position
  useEffect(() => {
    const activeIndex = tabs.findIndex((tab) => tab.id === activeTab)
    const activeTabElement = tabsRef.current[activeIndex]
    if (activeTabElement) {
      setIndicatorStyle({
        left: activeTabElement.offsetLeft,
        width: activeTabElement.offsetWidth,
      })
    }
  }, [activeTab, tabs])

  // Handle ripple effect
  const createRipple = (event: MouseEvent<HTMLButtonElement>) => {
    const button = event.currentTarget
    const ripple = document.createElement("span")
    const rect = button.getBoundingClientRect()
    const size = Math.max(rect.width, rect.height)
    const x = event.clientX - rect.left - size / 2
    const y = event.clientY - rect.top - size / 2

    ripple.style.width = ripple.style.height = `${size}px`
    ripple.style.left = `${x}px`
    ripple.style.top = `${y}px`
    ripple.className = "ripple-effect"

    button.appendChild(ripple)
    setTimeout(() => ripple.remove(), 600)
  }

  const handleTabClick = (tab: Tab, event: MouseEvent<HTMLButtonElement>) => {
    if (tab.disabled) return
    createRipple(event)
    setActiveTab(tab.id)
    onChange?.(tab.id)
  }

  return (
    <div className={cn("w-full", className)}>
      {/* Tab List */}
      <div
        ref={tabListRef}
        role="tablist"
        aria-label="Content tabs"
        className={cn(
          "relative flex border-b border-border bg-background ml-8",
          variant === "fullWidth" && "w-full",
          variant === "scrollable" && "overflow-x-auto scrollbar-hide",
        )}
        style={{
          boxShadow: "var(--elevation-1)",
        }}
      >
        {tabs.map((tab, index) => (
          <button
            key={tab.id}
            ref={(el) => {
              tabsRef.current[index] = el
            }}
            role="tab"
            id={`tab-${tab.id}`}
            aria-selected={activeTab === tab.id}
            aria-controls={`panel-${tab.id}`}
            aria-disabled={tab.disabled}
            tabIndex={activeTab === tab.id ? 0 : -1}
            onClick={(e) => handleTabClick(tab, e)}
            className={cn(
              "relative flex cursor-pointer items-center justify-center gap-2 px-6 py-4 text-sm font-medium tracking-wide transition-all duration-200 overflow-hidden",
              variant === "fullWidth" && "flex-1",
              activeTab === tab.id
                ? "text-white"
                : "text-muted-foreground hover:text-foreground hover:bg-secondary/50",
              tab.disabled && "opacity-40 cursor-not-allowed",
            )}
          >
            {tab.icon && (
              <span className="text-lg" aria-hidden="true">
                {tab.icon}
              </span>
            )}
            <span>{tab.label}</span>
          </button>
        ))}

        {/* Active Indicator */}
        <div
          className="absolute bottom-0 h-0.5 bg-primary transition-all duration-300 ease-out"
          style={{
            left: indicatorStyle.left,
            width: indicatorStyle.width,
          }}
          aria-hidden="true"
        />
      </div>

      {/* Tab Panels */}
      <div className="mt-0">
        {tabs.map((tab) => (
          <div
            key={tab.id}
            role="tabpanel"
            id={`panel-${tab.id}`}
            aria-labelledby={`tab-${tab.id}`}
            hidden={activeTab !== tab.id}
            tabIndex={0}
            className={cn(
              "animate-in fade-in-50 duration-300 p-6 bg-background focus:outline-none focus:ring-2 focus:ring-primary focus:ring-inset",
              activeTab === tab.id ? "block" : "hidden",
            )}
            style={{
              boxShadow: "var(--elevation-2)",
            }}
          >
            {tab.content}
          </div>
        ))}
      </div>
    </div>
  )
}
