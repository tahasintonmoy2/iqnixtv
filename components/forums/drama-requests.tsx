"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Film, Search, MessageCircle, Calendar, Globe, Users, ArrowUp, Plus } from "lucide-react"
import Link from "next/link"
import { toast } from "sonner"
import { RequestDramaDialog } from "../models/request-drama-model"

// Mock data for drama requests
const dramaRequests = [
  {
    id: 1,
    title: "My Demon",
    type: "K-Drama",
    year: "2023",
    genres: ["Romance", "Fantasy", "Comedy"],
    requestedBy: "DramaFan123",
    avatar: "/placeholder.svg?height=40&width=40",
    requestDate: "2024-01-15",
    votes: 234,
    comments: 45,
    status: "pending",
    priority: "high",
    dubbingLanguages: ["English", "Hindi", "Spanish"],
    description: "A romantic fantasy about a demon who loses his powers and a cold-hearted heiress.",
    supporters: 156,
    hasVoted: false,
  },
  {
    id: 2,
    title: "The Glory Season 2",
    type: "K-Drama",
    year: "2023",
    genres: ["Thriller", "Drama"],
    requestedBy: "RevengeStory",
    avatar: "/placeholder.svg?height=40&width=40",
    requestDate: "2024-01-10",
    votes: 189,
    comments: 67,
    status: "in-progress",
    priority: "urgent",
    dubbingLanguages: ["Hindi", "English"],
    description: "Continuation of the revenge thriller series.",
    supporters: 98,
    hasVoted: true,
  },
  {
    id: 3,
    title: "Love Like the Galaxy",
    type: "C-Drama",
    year: "2022",
    genres: ["Historical", "Romance"],
    requestedBy: "HistoryLover",
    avatar: "/placeholder.svg?height=40&width=40",
    requestDate: "2024-01-08",
    votes: 145,
    comments: 23,
    status: "fulfilled",
    priority: "medium",
    dubbingLanguages: ["English", "Spanish"],
    description: "A historical romance set in ancient China.",
    supporters: 78,
    hasVoted: false,
  },
  {
    id: 4,
    title: "Hidden Love",
    type: "C-Drama",
    year: "2023",
    genres: ["Romance", "Youth"],
    requestedBy: "YouthDrama",
    avatar: "/placeholder.svg?height=40&width=40",
    requestDate: "2024-01-05",
    votes: 298,
    comments: 89,
    status: "pending",
    priority: "high",
    dubbingLanguages: ["English", "Portuguese", "French"],
    description: "A sweet youth romance about secret crushes and growing up.",
    supporters: 201,
    hasVoted: false,
  },
]

const statusColors = {
  pending: "bg-yellow-100 text-yellow-800 border-yellow-200",
  "in-progress": "bg-blue-100 text-blue-800 border-blue-200",
  fulfilled: "bg-green-100 text-green-800 border-green-200",
}

const priorityColors = {
  low: "bg-gray-100 text-gray-700",
  medium: "bg-blue-100 text-blue-700",
  high: "bg-orange-100 text-orange-700",
  urgent: "bg-red-100 text-red-700",
}

export function DramaRequests() {
  const [searchQuery, setSearchQuery] = useState("")
  const [sortBy, setSortBy] = useState("votes")
  const [filterStatus, setFilterStatus] = useState("all")
  const [activeTab, setActiveTab] = useState("all")
  const [isRequestDialogOpen, setIsRequestDialogOpen] = useState(false)
  const [requests, setRequests] = useState(dramaRequests)

  const handleVote = (requestId: number) => {
    setRequests((prev) =>
      prev.map((request) => {
        if (request.id === requestId) {
          const hasVoted = request.hasVoted
          return {
            ...request,
            votes: hasVoted ? request.votes - 1 : request.votes + 1,
            hasVoted: !hasVoted,
          }
        }
        return request
      }),
    )

    const request = requests.find((r) => r.id === requestId)
    if (request) {
        if (request.hasVoted) {
            toast.success("Vote removed", {
                description: `You removed your vote for "${request.title}"`,
            });
        } else {
            toast.success("Vote success", {
                description: `You voted for "${request.title}"`,
            });
        }
    }
  }

  const filteredRequests = requests
    .filter((request) => {
      const matchesSearch =
        request.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        request.type.toLowerCase().includes(searchQuery.toLowerCase()) ||
        request.genres.some((genre) => genre.toLowerCase().includes(searchQuery.toLowerCase()))

      const matchesStatus = filterStatus === "all" || request.status === filterStatus
      const matchesTab =
        activeTab === "all" ||
        (activeTab === "k-dramas" && request.type === "K-Drama") ||
        (activeTab === "c-dramas" && request.type === "C-Drama")

      return matchesSearch && matchesStatus && matchesTab
    })
    .sort((a, b) => {
      switch (sortBy) {
        case "votes":
          return b.votes - a.votes
        case "recent":
          return new Date(b.requestDate).getTime() - new Date(a.requestDate).getTime()
        case "comments":
          return b.comments - a.comments
        default:
          return 0
      }
    })

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  }

  return (
    <div className="container mx-auto px-4 py-6 space-y-6">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="text-center space-y-4">
        <div className="flex items-center justify-center gap-2 mb-2">
          <Film className="h-8 w-8 text-primary" />
          <h1 className="text-3xl md:text-4xl font-bold">Drama Requests</h1>
        </div>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Browse community requests for new dramas with dubbing support. Vote for your favorites to help us prioritize
          which content to add next.
        </p>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-2xl mx-auto">
          <div className="text-center">
            <div className="text-2xl font-bold text-primary">456</div>
            <div className="text-sm text-muted-foreground">Total Requests</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-500">89</div>
            <div className="text-sm text-muted-foreground">In Progress</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-500">234</div>
            <div className="text-sm text-muted-foreground">Fulfilled</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-orange-500">133</div>
            <div className="text-sm text-muted-foreground">This Month</div>
          </div>
        </div>
      </motion.div>

      {/* Search and Filters */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="flex flex-col md:flex-row gap-4 items-center justify-between"
      >
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search drama requests..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>

        <div className="flex gap-2 flex-wrap">
          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-[140px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="votes">Most Voted</SelectItem>
              <SelectItem value="recent">Most Recent</SelectItem>
              <SelectItem value="comments">Most Discussed</SelectItem>
            </SelectContent>
          </Select>

          <Select value={filterStatus} onValueChange={setFilterStatus}>
            <SelectTrigger className="w-[120px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="in-progress">In Progress</SelectItem>
              <SelectItem value="fulfilled">Fulfilled</SelectItem>
            </SelectContent>
          </Select>

          <Button onClick={() => setIsRequestDialogOpen(true)} className="bg-gradient-to-r from-blue-600 to-purple-600">
            <Plus className="h-4 w-4 mr-2" />
            New Request
          </Button>
        </div>
      </motion.div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="all">All Requests</TabsTrigger>
          <TabsTrigger value="k-dramas">K-Dramas</TabsTrigger>
          <TabsTrigger value="c-dramas">C-Dramas</TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab}>
          <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-4">
            {filteredRequests.map((request) => (
              <motion.div key={request.id} variants={itemVariants}>
                <Card className="hover:shadow-lg transition-all duration-300">
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4">
                      {/* Vote Section */}
                      <div className="flex flex-col items-center gap-1 min-w-[60px]">
                        <Button
                          variant={request.hasVoted ? "default" : "outline"}
                          size="sm"
                          onClick={() => handleVote(request.id)}
                          className="h-8 w-8 p-0"
                        >
                          <ArrowUp className={`h-4 w-4 ${request.hasVoted ? "text-white" : ""}`} />
                        </Button>
                        <span className="text-sm font-semibold">{request.votes}</span>
                        <span className="text-xs text-muted-foreground">votes</span>
                      </div>

                      {/* Main Content */}
                      <div className="flex-1 space-y-3">
                        <div className="flex items-start justify-between gap-4">
                          <div className="space-y-2">
                            <div className="flex items-center gap-2 flex-wrap">
                              <h3 className="text-xl font-semibold">{request.title}</h3>
                              <Badge variant="secondary">{request.type}</Badge>
                              <Badge variant="outline">{request.year}</Badge>
                              <Badge className={statusColors[request.status as keyof typeof statusColors]}>
                                {request.status === "in-progress"
                                  ? "In Progress"
                                  : request.status === "fulfilled"
                                    ? "Fulfilled"
                                    : "Pending"}
                              </Badge>
                            </div>

                            <p className="text-muted-foreground">{request.description}</p>

                            <div className="flex items-center gap-4 text-sm text-muted-foreground">
                              <div className="flex items-center gap-1">
                                <Avatar className="h-5 w-5">
                                  <AvatarImage src={request.avatar || "/placeholder.svg"} />
                                  <AvatarFallback className="text-xs">{request.requestedBy[0]}</AvatarFallback>
                                </Avatar>
                                <span>by {request.requestedBy}</span>
                              </div>
                              <div className="flex items-center gap-1">
                                <Calendar className="h-4 w-4" />
                                <span>{new Date(request.requestDate).toLocaleDateString()}</span>
                              </div>
                            </div>
                          </div>

                          <div
                            className={`px-2 py-1 rounded text-xs font-medium ${priorityColors[request.priority as keyof typeof priorityColors]}`}
                          >
                            {request.priority.charAt(0).toUpperCase() + request.priority.slice(1)} Priority
                          </div>
                        </div>

                        {/* Genres */}
                        <div className="flex gap-1 flex-wrap">
                          {request.genres.map((genre) => (
                            <Badge key={genre} variant="outline" className="text-xs">
                              {genre}
                            </Badge>
                          ))}
                        </div>

                        {/* Dubbing Languages */}
                        <div className="flex items-center gap-2">
                          <Globe className="h-4 w-4 text-muted-foreground" />
                          <div className="flex gap-1 flex-wrap">
                            {request.dubbingLanguages.map((lang) => (
                              <Badge key={lang} variant="secondary" className="text-xs">
                                {lang}
                              </Badge>
                            ))}
                          </div>
                        </div>

                        {/* Stats */}
                        <div className="flex items-center gap-6 text-sm">
                          <div className="flex items-center gap-1">
                            <Users className="h-4 w-4" />
                            <span>{request.supporters} supporters</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <MessageCircle className="h-4 w-4" />
                            <span>{request.comments} comments</span>
                          </div>
                          <Link href={`/forum/thread/request-${request.id}`} className="text-primary hover:underline">
                            View Discussion →
                          </Link>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        </TabsContent>
      </Tabs>

      {/* Request Dialog */}
      <RequestDramaDialog open={isRequestDialogOpen} onOpenChange={setIsRequestDialogOpen} />
    </div>
  )
}
