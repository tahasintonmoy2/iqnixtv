"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Search, Plus, Heart, Eye, MessageCircle, Crown, ArrowLeft, Filter } from "lucide-react"
import Link from "next/link"
import { useCreateDiscussion } from "@/hooks/use-discussion"

interface ForumCategoryProps {
  slug: string
}
