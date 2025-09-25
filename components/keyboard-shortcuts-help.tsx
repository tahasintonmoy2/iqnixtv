"use client"

import { useState } from "react"
import { Command, HelpCircle, Search } from "lucide-react"

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"

export function KeyboardShortcutsHelp() {
  const [open, setOpen] = useState(false)

  const shortcuts = [
    {
      key: "⌘ K",
      description: "Open global search",
      icon: <Search className="h-4 w-4" />,
    },
    {
      key: "/ (Slash)",
      description: "Focus search",
      icon: <Search className="h-4 w-4" />,
    },
    {
      key: "⌘ /",
      description: "Open keyboard shortcuts help",
      icon: <HelpCircle className="h-4 w-4" />,
    },
    {
      key: "⌘ .",
      description: "Toggle sidebar",
      icon: <Command className="h-4 w-4" />,
    },
  ]

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon" className="h-8 w-8">
          <HelpCircle className="h-5 w-5" />
          <span className="sr-only">Keyboard shortcuts</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Keyboard Shortcuts</DialogTitle>
          <DialogDescription>Use these keyboard shortcuts to quickly navigate the platform.</DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          {shortcuts.map((shortcut, index) => (
            <div key={index} className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {shortcut.icon}
                <span>{shortcut.description}</span>
              </div>
              <kbd className="pointer-events-none inline-flex h-7 select-none items-center gap-1 rounded border bg-muted px-2 font-mono text-sm font-medium">
                {shortcut.key}
              </kbd>
            </div>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  )
}
