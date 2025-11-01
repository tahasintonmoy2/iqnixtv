"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useCreateThreads } from "@/hooks/use-create-threads";
import { Filter, Plus, Search } from "lucide-react";
import { useState } from "react";

export const ForumHeaderAction = () => {
  const { onOpen } = useCreateThreads();
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("recent");

  return (
    <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
      <div className="relative flex-1 max-w-md">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search threads..."
          className="pl-10"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      <div className="flex gap-2">
        <Select onValueChange={(value) => setSortBy(value)}>
          <SelectTrigger className="w-[140px]">
            <SelectValue defaultValue={sortBy} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="recent">Most Recent</SelectItem>
            <SelectItem value="popular">Most Popular</SelectItem>
            <SelectItem value="replies">Most Replies</SelectItem>
          </SelectContent>
        </Select>

        <Button variant="outline" size="sm">
          <Filter className="h-4 w-4" />
          Filter
        </Button>

        <Button size="sm" onClick={onOpen}>
          <Plus className="h-4 w-4" />
          New Thread
        </Button>
      </div>
    </div>
  );
};
