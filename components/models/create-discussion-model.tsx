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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useCreateDiscussion } from "@/hooks/use-discussion";
import { AnimatePresence, motion } from "framer-motion";
import {
  CheckCircle,
  Clock,
  Eye,
  Hash,
  MessageSquarePlus,
  Send,
  Tag,
  Users,
  X,
} from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { FormError } from "../form-error";

const categories = [
  { value: "k-dramas", label: "K-Drama Discussions", icon: "🇰🇷" },
  { value: "c-dramas", label: "C-Drama Discussions", icon: "🇨🇳" },
  { value: "recommendations", label: "Drama Recommendations", icon: "⭐" },
  { value: "reviews", label: "Reviews & Ratings", icon: "📝" },
  { value: "dubbing", label: "Dubbing & Subtitles", icon: "🎭" },
  { value: "off-topic", label: "Off-Topic", icon: "💬" },
];

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

const discussionTypes = [
  {
    value: "general",
    label: "General Discussion",
    description: "Start a conversation about any drama-related topic",
    icon: MessageSquarePlus,
  },
  {
    value: "episode",
    label: "Episode Discussion",
    description: "Discuss specific episodes with spoiler warnings",
    icon: Eye,
  },
  {
    value: "review",
    label: "Drama Review",
    description: "Share your detailed review and rating of a drama",
    icon: CheckCircle,
  },
];

export function CreateDiscussionModal() {
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [discussionType, setDiscussionType] = useState("");
  const [category, setCategory] = useState("");
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [newTag, setNewTag] = useState("");
  const [allowNotifications, setAllowNotifications] = useState(true);
  const { isOpen, onClose } = useCreateDiscussion();
  const [error, setError] = useState<string | undefined>("");

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
    if (!title.trim() || !content.trim() || !category || !discussionType) {
      setError("Please fill in all required fields before submitting.");
      return;
    }

    setIsSubmitting(true);

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 2000));

    toast.success("Discussion Created Successfully! 🎉");

    // Reset form
    setCurrentStep(1);
    setDiscussionType("");
    setCategory("");
    setTitle("");
    setContent("");
    setTags([]);
    setNewTag("");
    setAllowNotifications(true);
    setIsSubmitting(false);
    onClose();
  };

  const handleNext = () => {
    if (currentStep === 1 && !discussionType) {
      setError("Please select a discussion type");
      return;
    }
    if (currentStep === 2 && (!title.trim() || !category)) {
      setError("Please fill in the title and select a category");
      return;
    }
    setCurrentStep(currentStep + 1);
  };

  const handleBack = () => {
    setCurrentStep(currentStep - 1);
  };

  const resetForm = () => {
    setCurrentStep(1);
    setDiscussionType("");
    setCategory("");
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
            Start a New Discussion
          </DialogTitle>
          <DialogDescription>
            Share your thoughts, ask questions, or start conversations with the
            community
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Progress Indicator */}
          <div>
            <div className="flex items-center justify-center space-x-2">
              {[1, 2, 3].map((step) => (
                <div key={step} className="flex items-center">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-all ${
                      step <= currentStep
                        ? "bg-green-600 text-white"
                        : "bg-gray-200 text-gray-500"
                    }`}
                  >
                    {step}
                  </div>
                  {step < 3 && (
                    <div
                      className={`w-12 h-1 mx-2 transition-all ${step < currentStep ? "bg-green-600" : "bg-gray-200"}`}
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
            {/* Step 1: Discussion Type */}
            {currentStep === 1 && (
              <motion.div
                key="step1"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-4"
              >
                <div>
                  <h3 className="text-lg font-semibold mb-4">
                    What type of discussion would you like to start?
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {discussionTypes.map((type) => (
                      <Card
                        key={type.value}
                        className={`cursor-pointer transition-all hover:shadow-md ${
                          discussionType === type.value
                            ? "ring-2 ring-green-500 bg-green-500/20"
                            : "hover:bg-green-500/20 hover:ring-2 hover:ring-green-500"
                        }`}
                        onClick={() => setDiscussionType(type.value)}
                      >
                        <CardContent className="p-4">
                          <div className="flex items-start gap-3">
                            <type.icon className="h-6 w-6 text-green-600 mt-1" />
                            <div>
                              <h4 className="font-semibold">{type.label}</h4>
                              <p className="text-sm text-muted-foreground mt-1">
                                {type.description}
                              </p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}

            {/* Step 2: Basic Information */}
            {currentStep === 2 && (
              <motion.div
                key="step2"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-4"
              >
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="title" className="text-base font-medium">
                      Discussion Title *
                    </Label>
                    <Input
                      id="title"
                      placeholder="Enter a clear and engaging title for your discussion..."
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
                    <Label htmlFor="category" className="text-base font-medium">
                      Category *
                    </Label>
                    <Select value={category} onValueChange={setCategory}>
                      <SelectTrigger className="mt-2">
                        <SelectValue placeholder="Select a category for your discussion" />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map((cat) => (
                          <SelectItem key={cat.value} value={cat.value}>
                            <div className="flex items-center gap-2">
                              <span>{cat.icon}</span>
                              <span>{cat.label}</span>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="content" className="text-base font-medium">
                      Discussion Content *
                    </Label>
                    <Textarea
                      id="content"
                      placeholder="Share your thoughts, ask questions, or provide details about your discussion topic..."
                      value={content}
                      onChange={(e) => setContent(e.target.value)}
                      className="mt-2 min-h-[120px]"
                      maxLength={2000}
                    />
                    <div className="text-xs text-muted-foreground mt-2">
                      {content.length}/2000 characters
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Step 3: Tags and Settings */}
            {currentStep === 3 && (
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
                        onKeyPress={(e) => {
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
                        <Tag className="h-4 w-4" />
                      </Button>
                    </div>

                    {tags.length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        {tags.map((tag) => (
                          <Badge
                            key={tag}
                            variant="secondary"
                            className="flex items-center gap-1"
                          >
                            #{tag}
                            <X
                              className="h-3 w-3 cursor-pointer hover:text-red-500"
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
                        Notify me when someone replies to this discussion
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
                          <Badge variant="secondary">
                            {
                              categories.find((c) => c.value === category)
                                ?.label
                            }
                          </Badge>
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
              {currentStep < 3 ? (
                <Button
                  onClick={handleNext}
                  className="bg-green-600 hover:bg-green-700"
                >
                  Next
                </Button>
              ) : (
                <Button
                  onClick={handleSubmit}
                  disabled={isSubmitting}
                  className="bg-green-600 hover:bg-green-700"
                >
                  {isSubmitting ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                      Creating...
                    </>
                  ) : (
                    <>
                      <Send className="h-4 w-4 mr-2" />
                      Create Discussion
                    </>
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
