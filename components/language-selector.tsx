"use client";

import { useState } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Check, Globe } from "lucide-react";

type Language = {
  code: string;
  name: string;
};

export function LanguageSelector() {
  const [selectedLanguage, setSelectedLanguage] = useState<Language>({
    code: "en",
    name: "English",
  });

  const languages: Language[] = [
    { code: "en", name: "English" },
    { code: "es", name: "Spanish" },
    { code: "fr", name: "French" },
    { code: "de", name: "German" },
    { code: "ja", name: "Japanese" },
    { code: "ko", name: "Korean" },
    { code: "zh", name: "Chinese" },
    { code: "hi", name: "Hindi" },
  ];

  const handleLanguageChange = (language: Language) => {
    setSelectedLanguage(language);
    // In a real app, you would change the audio track here
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="bg-background/30 backdrop-blur-sm hover:bg-background/50"
        >
          <Globe className="h-5 w-5" />
          <span className="sr-only">Select language</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel>Audio Language</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {languages.map((language) => (
          <DropdownMenuItem
            key={language.code}
            className={
              selectedLanguage.code === language.code ? "bg-muted" : ""
            }
            onClick={() => handleLanguageChange(language)}
          >
            {language.name}
            {selectedLanguage.code === language.code && (
              <span className="ml-auto">
                <Check />
              </span>
            )}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
