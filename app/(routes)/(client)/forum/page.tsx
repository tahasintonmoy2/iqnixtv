"use client";

import { CreateDiscussionModal } from "@/components/models/create-discussion-model";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useCreateDiscussion } from "@/hooks/use-discussion";
import { motion } from "framer-motion";
import {
  ArrowRight,
  Film,
  MessageCircle,
  MessageSquarePlus,
  PenTool, Plus,
  TrendingUp,
  Users
} from "lucide-react";
import Link from "next/link";
// import { RequestDramaDialog } from "./request-drama-dialog"
// import { NewDiscussionDialog } from "./new-discussion-dialog"

const categories = [
  {
    id: 1,
    name: "K-Drama Discussions",
    description:
      "Talk about your favorite Korean dramas, share reviews, and discover new shows",
    slug: "k-dramas",
    icon: "🇰🇷",
    topics: 2341,
    posts: 15678,
    lastPost: {
      title: "My Demon Episode 12 Discussion",
      author: "DramaFan123",
      time: "2 hours ago",
      avatar: "/placeholder.svg?height=32&width=32",
    },
    trending: true,
  },
  {
    id: 2,
    name: "C-Drama Discussions",
    description:
      "Chinese dramas, historical epics, modern romances, and everything in between",
    slug: "c-dramas",
    icon: "🇨🇳",
    topics: 1876,
    posts: 12456,
    lastPost: {
      title: "Hidden Love Season 2 Predictions",
      author: "YouthDrama",
      time: "4 hours ago",
      avatar: "/placeholder.svg?height=32&width=32",
    },
    trending: false,
  },
  {
    id: 3,
    name: "Drama Recommendations",
    description:
      "Get personalized recommendations and help others discover amazing dramas",
    slug: "recommendations",
    icon: "⭐",
    topics: 987,
    posts: 8765,
    lastPost: {
      title: "Looking for Historical Romance Dramas",
      author: "HistoryLover",
      time: "1 hour ago",
      avatar: "/placeholder.svg?height=32&width=32",
    },
    trending: false,
  },
  {
    id: 4,
    name: "Dubbing & Subtitles",
    description:
      "Discuss dubbing quality, subtitle accuracy, and language preferences",
    slug: "dubbing",
    icon: "🎭",
    topics: 543,
    posts: 4321,
    lastPost: {
      title: "English Dub Quality Comparison",
      author: "AudioPhile",
      time: "6 hours ago",
      avatar: "/placeholder.svg?height=32&width=32",
    },
    trending: false,
  },
  {
    id: 5,
    name: "Off-Topic",
    description: "General discussions, introductions, and community chat",
    slug: "off-topic",
    icon: "💬",
    topics: 1234,
    posts: 9876,
    lastPost: {
      title: "Introduce Yourself - New Members",
      author: "ModeratorSarah",
      time: "30 minutes ago",
      avatar: "/placeholder.svg?height=32&width=32",
    },
    trending: false,
  },
];

const ForumPage = () => {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  };

  const { onOpen } = useCreateDiscussion();

  return (
    <div className="pt-28 mx-auto px-4 py-6 space-y-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center space-y-4"
      >
        <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
          Community Forum
        </h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          Connect with fellow drama enthusiasts, share your thoughts, and
          discover your next favorite show
        </p>
      </motion.div>

      {/* Action Buttons Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* New Discussion CTA */}
          <Card className="bg-gradient-to-r from-green-500/20 to-emerald-500/20 border-green-400">
            <CardContent className="p-6">
              <div className="flex flex-col sm:flex-row items-center gap-4">
                <div className="flex-shrink-0">
                  <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center">
                    <MessageSquarePlus className="h-8 w-8 text-green-600" />
                  </div>
                </div>
                <div className="flex-1 text-center sm:text-left">
                  <h3 className="text-xl font-bold mb-2 text-green-700">
                    Start a New Community
                  </h3>
                  <p className="text-green-600 mb-4">
                    Share your thoughts, ask questions, or start conversations
                    about your favorite dramas with the community.
                  </p>
                  <Button
                    onClick={onOpen}
                    className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white"
                  >
                    <PenTool className="h-4 w-4 mr-2" />
                    Create Community
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Drama Request CTA */}
          <Card className="bg-gradient-to-r from-blue-500/20 to-indigo-500/20 border-blue-600">
            <CardContent className="p-6">
              <div className="flex flex-col sm:flex-row items-center gap-4">
                <div className="flex-shrink-0">
                  <div className="w-16 h-16 bg-blue-500/20 rounded-full flex items-center justify-center">
                    <Film className="h-8 w-8 text-blue-600" />
                  </div>
                </div>
                <div className="flex-1 text-center sm:text-left">
                  <h3 className="text-xl font-bold mb-2 text-blue-500">
                    Request a Drama
                  </h3>
                  <p className="dark:text-blue-400 text-blue-500 mb-4">
                    Can&apos;t find a drama with your preferred dubbing? Let us
                    know what you&apos;d like to see added!
                  </p>
                  <Button
                    onClick={() => {}}
                    className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white"
                  >
                    <Plus className="size-4 mr-2" />
                    Request Drama
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Categories */}
        <div className="lg:col-span-2 space-y-6">
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="space-y-4"
          >
            {categories.map((category) => (
              <motion.div key={category.id} variants={itemVariants}>
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4">
                      <div className="text-3xl">{category.icon}</div>
                      <div className="flex-1 space-y-2">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Link
                              href={`/forum/category/${category.slug}`}
                              className="text-xl font-semibold hover:text-primary transition-colors"
                            >
                              {category.name}
                            </Link>
                            {category.trending && (
                              <Badge
                                variant="secondary"
                                className="bg-orange-100 text-orange-700"
                              >
                                <TrendingUp className="h-3 w-3 mr-1" />
                                Trending
                              </Badge>
                            )}
                          </div>
                          <ArrowRight className="h-5 w-5 text-muted-foreground" />
                        </div>
                        <p className="text-muted-foreground">
                          {category.description}
                        </p>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4 text-sm text-muted-foreground">
                            <div className="flex items-center gap-1">
                              <MessageCircle className="h-4 w-4" />
                              <span>
                                {category.topics.toLocaleString()} topics
                              </span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Users className="h-4 w-4" />
                              <span>
                                {category.posts.toLocaleString()} posts
                              </span>
                            </div>
                          </div>
                          {category.lastPost && (
                            <div className="flex items-center gap-2 text-sm">
                              <Avatar className="h-6 w-6">
                                <AvatarImage
                                  src={
                                    category.lastPost.avatar ||
                                    "/placeholder.svg"
                                  }
                                />
                                <AvatarFallback>
                                  {category.lastPost.author[0]}
                                </AvatarFallback>
                              </Avatar>
                              <div className="text-right">
                                <div className="font-medium">
                                  {category.lastPost.title}
                                </div>
                                <div className="text-muted-foreground">
                                  by {category.lastPost.author} •{" "}
                                  {category.lastPost.time}
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </div>

      {/* Dialogs */}
      {/* <RequestDramaDialog open={isRequestDialogOpen} onOpenChange={setIsRequestDialogOpen} /> */}
      <CreateDiscussionModal />
    </div>
  );
};

export default ForumPage;
