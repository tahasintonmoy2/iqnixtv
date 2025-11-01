"use client";

import type React from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useRequestContent } from "@/hooks/use-request-content";
import { cn } from "@/lib/utils";
import { AnimatePresence, motion } from "framer-motion";
import {
  Film,
  Globe,
  Loader2,
  Plus,
  Star,
  X
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

const dramaTypes = [
  { value: "k-drama", label: "K-Drama (Korean)" },
  { value: "k-movie", label: "K-Movie (Korean)" },
  { value: "k-variety", label: "K-Variety (Korean)" },
  { value: "c-drama", label: "C-Drama (Chinese)" },
  { value: "c-movie", label: "C-Movie (Chinese)" },
  { value: "c-variety", label: "C-Variety (Chinese)" },
  { value: "j-drama", label: "J-Drama (Japanese)" },
];

const genres = [
  "Romance",
  "Comedy",
  "Drama",
  "Thriller",
  "Action",
  "Historical",
  "Fantasy",
  "Sci-Fi",
  "Mystery",
  "Horror",
  "Slice of Life",
  "Medical",
];

const dubbingLanguages = [
  { value: "english", label: "English" },
  { value: "hindi", label: "Hindi" },
  { value: "indonesian", label: "Indonesian" },
  { value: "spanish", label: "Spanish" },
  { value: "french", label: "French" },
  { value: "german", label: "German" },
  { value: "portuguese", label: "Portuguese" },
  { value: "arabic", label: "Arabic" },
];

const priorities = [
  {
    value: "low",
    label: "Low - Whenever possible",
    color: "bg-gray-100 text-gray-700",
  },
  {
    value: "medium",
    label: "Medium - Would love to see it",
    color: "bg-blue-100 text-blue-700",
  },
  {
    value: "high",
    label: "High - Really want this!",
    color: "bg-orange-100 text-orange-700",
  },
  {
    value: "urgent",
    label: "Urgent - My most wanted drama",
    color: "bg-red-100 text-red-700",
  },
];

export function RequestDramaDialog() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const { isOpen, onClose } = useRequestContent();
  const [formData, setFormData] = useState({
    title: "",
    type: "",
    year: "",
    genres: [] as string[],
    dubbingLanguages: [] as string[],
    priority: "",
    description: "",
    reason: "",
    existingPlatform: "",
    notifyUpdates: true,
  });

  const handleGenreToggle = (genre: string) => {
    setFormData((prev) => ({
      ...prev,
      genres: prev.genres.includes(genre)
        ? prev.genres.filter((g) => g !== genre)
        : [...prev.genres, genre],
    }));
  };

  const handleLanguageToggle = (language: string) => {
    setFormData((prev) => ({
      ...prev,
      dubbingLanguages: prev.dubbingLanguages.includes(language)
        ? prev.dubbingLanguages.filter((l) => l !== language)
        : [...prev.dubbingLanguages, language],
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 2000));

    setIsSubmitting(false);
    setIsSubmitted(true);

    toast.success("Request Submitted Successfully!", {
      description:
        "Your drama request has been added to our community queue. You'll be notified of any updates.",
    });

    // Reset form after a delay
    setTimeout(() => {
      setIsSubmitted(false);
      setFormData({
        title: "",
        type: "",
        year: "",
        genres: [],
        dubbingLanguages: [],
        priority: "",
        description: "",
        reason: "",
        existingPlatform: "",
        notifyUpdates: true,
      });
      onClose();
    }, 4000);
  };

  const isFormValid =
    formData.title &&
    formData.type &&
    formData.dubbingLanguages.length > 0 &&
    formData.priority;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <Film className="h-6 w-6 text-primary" />
            Request a Drama
          </DialogTitle>
          <DialogDescription>
            Help us expand our library! Tell us about the content you&apos;d
            like to see with dubbing support.
          </DialogDescription>
        </DialogHeader>

        <AnimatePresence mode="wait">
          {isSubmitted ? (
            <motion.div
              key="success"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="flex flex-col items-center justify-center py-8 text-center"
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, stiffness: 200 }}
              >
                <motion.svg
                  role="img"
                  aria-label="Success"
                  width="80"
                  height="80"
                  viewBox="0 0 80 80"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  className="mb-4 text-green-500"
                >
                  {/* Animated circle stroke */}
                  <motion.circle
                    cx="40"
                    cy="40"
                    r="30"
                    stroke="currentColor"
                    strokeWidth="5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    initial={{ pathLength: 0, opacity: 0.6 }}
                    animate={{ pathLength: 1, opacity: 1 }}
                    transition={{ duration: 0.7, ease: "easeOut" }}
                  />

                  {/* Animated check path */}
                  <motion.path
                    d="M26 40 L36 50 L54 32"
                    stroke="currentColor"
                    strokeWidth="5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    fill="none"
                    initial={{ pathLength: 0 }}
                    animate={{ pathLength: 1 }}
                    transition={{ delay: 0.65, duration: 0.45, ease: "easeOut" }}
                  />

                  {/* subtle pop after draw */}
                  <motion.circle
                    cx="40"
                    cy="40"
                    r="30"
                    fill="currentColor"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 0 }}
                    whileTap={{ scale: 0.98 }}
                    transition={{ duration: 0.2 }}
                  />
                </motion.svg>
              </motion.div>
              <h3 className="text-xl font-semibold mb-2">Request Submitted!</h3>
              <p className="text-muted-foreground mb-4">
                Thank you for your request. Our team will review it and
                you&apos;ll be notified of any updates.
              </p>
            </motion.div>
          ) : (
            <motion.form
              key="form"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onSubmit={handleSubmit}
              className="space-y-6"
            >
              {/* Basic Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  <Star className="h-5 w-5 text-yellow-500" />
                  Basic Information
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="title">Content Title *</Label>
                    <Input
                      id="title"
                      placeholder="e.g., Crash Landing on You"
                      value={formData.title}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          title: e.target.value,
                        }))
                      }
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="type">Content Type *</Label>
                    <Select
                      value={formData.type}
                      onValueChange={(value) =>
                        setFormData((prev) => ({ ...prev, type: value }))
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select content type" />
                      </SelectTrigger>
                      <SelectContent>
                        {dramaTypes.map((type) => (
                          <SelectItem key={type.value} value={type.value}>
                            {type.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="year">Release Year</Label>
                    <Input
                      id="year"
                      placeholder="e.g., 2024"
                      value={formData.year}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          year: e.target.value,
                        }))
                      }
                    />
                  </div>
                </div>
              </div>

              {/* Genres */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Genres</h3>
                <div className="flex flex-wrap gap-2">
                  {genres.map((genre) => (
                    <Badge
                      key={genre}
                      variant={
                        formData.genres.includes(genre) ? "default" : "outline"
                      }
                      className={cn(
                        "cursor-pointer hover:bg-primary/75 transition-colors",
                        formData.genres.includes(genre)
                          ? "hover:bg-primary/75"
                          : "hover:bg-primary/30"
                      )}
                      onClick={() => handleGenreToggle(genre)}
                    >
                      {genre}
                      {formData.genres.includes(genre) && (
                        <X className="h-3 w-3 ml-1" />
                      )}
                    </Badge>
                  ))}
                </div>
              </div>

              {/* Dubbing Languages */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  <Globe className="h-5 w-5 text-blue-500" />
                  Preferred Dubbing Languages *
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {dubbingLanguages.map((language) => (
                    <div
                      key={language.value}
                      className="flex items-center space-x-2"
                    >
                      <Checkbox
                        id={language.value}
                        checked={formData.dubbingLanguages.includes(
                          language.value
                        )}
                        onCheckedChange={() =>
                          handleLanguageToggle(language.value)
                        }
                      />
                      <Label
                        htmlFor={language.value}
                        className="text-sm font-medium"
                      >
                        {language.label}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>

              {/* Priority */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Request Priority *</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {priorities.map((priority) => (
                    <div
                      key={priority.value}
                      className={`p-3 rounded-lg border-2 cursor-pointer transition-all ${
                        formData.priority === priority.value
                          ? "border-primary bg-primary/5"
                          : "border-border hover:border-primary/50"
                      }`}
                      onClick={() =>
                        setFormData((prev) => ({
                          ...prev,
                          priority: priority.value,
                        }))
                      }
                    >
                      <div className="flex items-center space-x-2">
                        <div
                          className={`w-3 h-3 rounded-full ${priority.color.split(" ")[0]}`}
                        />
                        <span className="font-medium">{priority.label}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Notifications */}
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="notifications"
                  checked={formData.notifyUpdates}
                  onCheckedChange={(checked) =>
                    setFormData((prev) => ({
                      ...prev,
                      notifyUpdates: !!checked,
                    }))
                  }
                />
                <Label htmlFor="notifications" className="text-sm">
                  Notify me when this request is fulfilled or when there are
                  updates
                </Label>
              </div>

              {/* Submit Button */}
              <div className="flex gap-3 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={onClose}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={!isFormValid || isSubmitting}
                  className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Submitting...
                    </>
                  ) : (
                    <>
                      <Plus className="h-4 w-4 mr-2" />
                      Submit Request
                    </>
                  )}
                </Button>
              </div>
            </motion.form>
          )}
        </AnimatePresence>
      </DialogContent>
    </Dialog>
  );
}
