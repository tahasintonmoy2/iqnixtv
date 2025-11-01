"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
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
import { Textarea } from "@/components/ui/textarea";
import { useCreateThreads } from "@/hooks/use-create-threads";
import { cn } from "@/lib/utils";
import axios from "axios";
import { AnimatePresence, motion } from "framer-motion";
import {
  Clock,
  Eye,
  Hash,
  MessageSquarePlus,
  Plus,
  Users,
  X,
} from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { FormError } from "../form-error";
import { useRouter } from "next/navigation";

const popularTags = [
  "romance",
  "thriller",
  "historical",
  "comedy",
  "action",
  "fantasy",
  "slice-of-life",
  "mystery",
  "drama",
  "school",
  "workplace",
  "family",
  "friendship",
  "revenge",
  "time-travel",
  "medical",
  "legal",
  "sports",
];

interface CreateThreadsModelProps {
  forumId: string;
}

export function CreateDiscussionModal({forumId}: CreateThreadsModelProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [newTag, setNewTag] = useState("");
  const [allowNotifications, setAllowNotifications] = useState(true);
  const { isOpen, onClose } = useCreateThreads();
  const [error, setError] = useState<string | undefined>("");

  const router = useRouter();

  useEffect(() => {
    if (!error) return;
    const timeoutId = setTimeout(() => {
      setError(undefined);
    }, 4000);
    return () => clearTimeout(timeoutId);
  }, [error]);

  const handleAddTag = (tag: string) => {
    if (tag && !tags.includes(tag) && tags.length < 5) {
      setTags([...tags, tag.toLowerCase()]);
      setNewTag("");
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter((tag) => tag !== tagToRemove));
  };

  const handleSubmit = async () => {
    try {
      if (!title.trim() || !content.trim()) {
        setError("Please fill in all required fields before submitting.");
        return;
      }

      setIsSubmitting(true);

      if (!forumId || forumId === undefined) {
        toast.error("Something went wrong. Please try again.");
        setIsSubmitting(false);
        return;
      }

      await axios.post(`/api/forum/${forumId}/threads`, {
        title: title.trim(),
        content: content.trim(),
        tags: tags.map((tag) => ({ name: tag })),
      });

      toast.success("Threads posted");

      router.refresh();

      // Reset form
      setCurrentStep(1);
      setTitle("");
      setContent("");
      setTags([]);
      setNewTag("");
      setAllowNotifications(true);
      setIsSubmitting(false);
      onClose();
    } catch (error) {
      console.error("Error creating thread:", error);
      toast.error("Failed to create thread. Please try again.");
      setIsSubmitting(false);
    }
  };

  const handleNext = () => {
    if (currentStep === 1 && (!title.trim() || !content.trim())) {
      setError("Please fill the title and content before processing.");
      return;
    }
    setCurrentStep(currentStep + 1);
  };

  const handleBack = () => {
    setCurrentStep(currentStep - 1);
  };

  const resetForm = () => {
    setCurrentStep(1);
    setTitle("");
    setContent("");
    setTags([]);
    setNewTag("");
    setAllowNotifications(true);
  };

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open) => {
        if (!open) resetForm();
        onClose();
      }}
    >
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-2xl">
            <MessageSquarePlus className="h-6 w-6 text-green-600" />
            Start a New Thread
          </DialogTitle>
          <DialogDescription>
            Share your thoughts, or start conversations with the community
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Progress Indicator */}
          <div>
            <div className="flex items-center justify-center">
              {[1, 2].map((step) => (
                <div key={step} className="flex items-center">
                  <div
                    className={cn(
                      "size-8 rounded-full flex items-center justify-center text-sm font-medium transition-all",
                      step <= currentStep
                        ? "bg-green-600 text-white"
                        : "bg-gray-200 text-gray-500"
                    )}
                  >
                    {step}
                  </div>
                  {step < 2 && (
                    <div
                      className={cn(
                        "w-10 h-1 mx-2 transition-all",
                        step < currentStep ? "bg-green-600" : "bg-gray-200"
                      )}
                    />
                  )}
                </div>
              ))}
            </div>
            <div className="mt-4 flex justify-center">
              <FormError message={error} />
            </div>
          </div>

          <AnimatePresence mode="wait">
            {/* Step 1: Basic Information */}
            {currentStep === 1 && (
              <motion.div
                key="step1"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-4"
              >
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="title" className="text-base font-medium">
                      Title
                    </Label>
                    <Input
                      id="title"
                      placeholder="Enter a clear and engaging title for your thread..."
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      className="mt-2"
                      maxLength={100}
                    />
                    <div className="text-xs text-muted-foreground mt-1">
                      {title.length}/100 characters
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="content" className="text-base font-medium">
                      Content
                    </Label>
                    <Textarea
                      id="content"
                      placeholder="Share your thoughts"
                      value={content}
                      onChange={(e) => setContent(e.target.value)}
                      className="mt-2 resize-none max-h-48"
                      maxLength={2000}
                    />
                    <div className="text-xs text-muted-foreground mt-2">
                      {content.length}/2000 characters
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Step 2: Tags and Settings */}
            {currentStep === 2 && (
              <motion.div
                key="step3"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <div>
                  <Label className="text-base font-medium flex items-center gap-2">
                    <Hash className="h-4 w-4" />
                    Tags (Optional)
                  </Label>
                  <p className="text-sm text-muted-foreground mb-3">
                    Add up to 5 tags to help others discover your discussion
                  </p>

                  <div className="space-y-3">
                    <div className="flex gap-2">
                      <Input
                        placeholder="Add a tag..."
                        value={newTag}
                        onChange={(e) => setNewTag(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            e.preventDefault();
                            handleAddTag(newTag);
                          }
                        }}
                        maxLength={20}
                      />
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => handleAddTag(newTag)}
                        disabled={!newTag.trim() || tags.length >= 5}
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>

                    {tags.length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        {tags.map((tag) => (
                          <Badge
                            key={tag}
                            variant="outline"
                            className="flex items-center gap-1"
                          >
                            #{tag}
                            <X
                              className="size-3.5 cursor-pointer hover:text-red-500"
                              onClick={() => handleRemoveTag(tag)}
                            />
                          </Badge>
                        ))}
                      </div>
                    )}

                    <div>
                      <p className="text-sm font-medium mb-2">Popular tags:</p>
                      <div className="flex flex-wrap gap-2">
                        {popularTags.slice(0, 12).map((tag) => (
                          <Badge
                            key={tag}
                            variant="outline"
                            className="cursor-pointer hover:bg-green-500/20 hover:border-green-400"
                            onClick={() => handleAddTag(tag)}
                          >
                            #{tag}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h4 className="font-medium">Notification Settings</h4>
                  <div className="space-y-3">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="notifications"
                        checked={allowNotifications}
                      />
                      <Label htmlFor="notifications" className="text-sm">
                        Notify me when someone replies to this thread
                      </Label>
                    </div>
                  </div>
                </div>

                {/* Preview */}
                <div className="border-t pt-4">
                  <h4 className="font-medium mb-3">Preview</h4>
                  <Card>
                    <CardContent className="p-4">
                      <div className="space-y-3">
                        <div className="flex items-center gap-2">
                          {tags.map((tag) => (
                            <Badge
                              key={tag}
                              variant="outline"
                              className="text-xs"
                            >
                              #{tag}
                            </Badge>
                          ))}
                        </div>
                        <h3 className="font-semibold text-lg">
                          {title || "Your discussion title"}
                        </h3>
                        <p className="text-muted-foreground">
                          {content ||
                            "Your discussion content will appear here..."}
                        </p>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <Users className="h-4 w-4" />
                            <span>0 replies</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Eye className="h-4 w-4" />
                            <span>0 views</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Clock className="h-4 w-4" />
                            <span>Just now</span>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Navigation Buttons */}
          <div className="flex justify-between pt-4 border-t">
            <div>
              {currentStep > 1 && (
                <Button variant="outline" onClick={handleBack}>
                  Back
                </Button>
              )}
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={onClose}>
                Cancel
              </Button>
              {currentStep < 2 ? (
                <Button onClick={handleNext}>Next</Button>
              ) : (
                <Button onClick={handleSubmit} disabled={isSubmitting}>
                  {isSubmitting ? (
                    <div className="flex items-center">
                      <div className="loader"></div>
                      <p>Loading</p>
                    </div>
                  ) : (
                    <p>Post</p>
                  )}
                </Button>
              )}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
