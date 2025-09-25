"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { useCreateSeason } from "@/hooks/use-create-season";
import { useCreateSeries } from "@/hooks/use-create-series";
import { Episode, Season, Series } from "@/lib/generated/prisma";
import {
  Calendar,
  Eye,
  FileText,
  Film,
  Play,
  Plus,
  Star,
  TrendingUp,
  Tv,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

interface AddSeasonDialogProps {
  series: (Series & { seasons: Season[]; episodes: Episode[] })[];
}

export function ContentOverview({ series }: AddSeasonDialogProps) {
  const router = useRouter();
  const season = useCreateSeason();
  const { onOpen } = useCreateSeries();

  const stats = {
    totalContent: 1247,
    totalSeries: 45,
    totalSeasons: 156,
    totalEpisodes: 892,
    totalMovies: 234,
    totalViews: 45600000,
    avgRating: 4.2,
    publishedContent: 1089,
    draftContent: 158,
  };

  const recentContent = [
    {
      id: "1",
      title: "Cosmic Odyssey S2E12",
      type: "Episode",
      status: "Published",
      views: 2100000,
      rating: 4.8,
      releaseDate: "2024-01-15",
    },
    {
      id: "2",
      title: "The Last Journey",
      type: "Movie",
      status: "Processing",
      views: 0,
      rating: 0,
      releaseDate: "2024-01-20",
    },
    {
      id: "3",
      title: "Mystery Island S1",
      type: "Season",
      status: "Draft",
      views: 0,
      rating: 0,
      releaseDate: "2024-02-01",
    },
  ];

  const topPerforming = [
    {
      title: "Cosmic Odyssey",
      type: "Series",
      views: 25000000,
      rating: 4.9,
      completionRate: 87,
    },
    {
      title: "The Last Journey",
      type: "Movie",
      views: 18500000,
      rating: 4.6,
      completionRate: 92,
    },
    {
      title: "Eternal Shadows",
      type: "Series",
      views: 15200000,
      rating: 4.7,
      completionRate: 84,
    },
  ];

  return (
    <>
      <div className="space-y-6 mb-4">
        {/* Stats Overview */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card className="py-4">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total Content
              </CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {stats.totalContent.toLocaleString()}
              </div>
              <p className="text-xs text-muted-foreground">
                +12% from last month
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Views</CardTitle>
              <Eye className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {(stats.totalViews / 1000000).toFixed(1)}M
              </div>
              <p className="text-xs text-muted-foreground">
                +8% from last month
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Average Rating
              </CardTitle>
              <Star className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.avgRating}/5</div>
              <p className="text-xs text-muted-foreground">
                +0.2 from last month
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Published Content
              </CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.publishedContent}</div>
              <p className="text-xs text-muted-foreground">
                {stats.draftContent} in draft
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Content Breakdown */}
        <div className="grid gap-6 md:grid-cols-2">
          <Card className="py-4">
            <CardHeader>
              <CardTitle>Content Breakdown</CardTitle>
              <CardDescription>Distribution of content types</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Tv className="h-4 w-4 text-blue-500" />
                  <span className="text-sm">Series</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium">{series.length}</span>
                  <Badge variant="outline">{series[0]?.seasons.length} seasons</Badge>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Play className="h-4 w-4 text-green-500" />
                  <span className="text-sm">Episodes</span>
                </div>
                <span className="text-sm font-medium">
                  {series[0]?.episodes.length}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Film className="h-4 w-4 text-purple-500" />
                  <span className="text-sm">Movies</span>
                </div>
                <span className="text-sm font-medium">{stats.totalMovies}</span>
              </div>
            </CardContent>
          </Card>

          <Card className="py-4">
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
              <CardDescription>Common content management tasks</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button
                className="w-full justify-start"
                variant="outline"
                onClick={onOpen}
              >
                <Plus className="mr-2 h-4 w-4" />
                Add New Movie/Series
              </Button>

              <Button
                className="w-full justify-start"
                variant="outline"
                onClick={season.onOpen}
              >
                <Calendar className="mr-2 h-4 w-4" />
                Add New Season
              </Button>

              <Link href="/series/seasons">
                <Button className="w-full justify-start" variant="outline">
                  <Play className="mr-2 h-4 w-4" />
                  Add New Episode
                </Button>
              </Link>

              <Button
                className="w-full justify-start mt-3"
                variant="outline"
                onClick={() => router.push("/series/seasons")}
              >
                <FileText className="mr-2 h-4 w-4" />
                View All Content
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Recent Content & Top Performing */}
        <div className="grid gap-6 md:grid-cols-2">
          <Card className="py-4">
            <CardHeader>
              <CardTitle>Recent Content</CardTitle>
              <CardDescription>
                Latest additions to your library
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentContent.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between"
                  >
                    <div className="space-y-1">
                      <p className="text-sm font-medium">{item.title}</p>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="text-xs">
                          {item.type}
                        </Badge>
                        <Badge
                          variant={
                            item.status === "Published"
                              ? "default"
                              : item.status === "Processing"
                                ? "outline"
                                : "secondary"
                          }
                          className="text-xs"
                        >
                          {item.status}
                        </Badge>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium">
                        {item.views > 0
                          ? `${(item.views / 1000000).toFixed(1)}M views`
                          : "Not published"}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(item.releaseDate).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className="py-4">
            <CardHeader>
              <CardTitle>Top Performing Content</CardTitle>
              <CardDescription>Your most successful content</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {topPerforming.map((item, index) => (
                  <div key={index} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium">{item.title}</p>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="text-xs">
                            {item.type}
                          </Badge>
                          <span className="text-xs text-muted-foreground">
                            {(item.views / 1000000).toFixed(1)}M views
                          </span>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="flex items-center gap-1">
                          <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                          <span className="text-sm font-medium">
                            {item.rating}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="space-y-1">
                      <div className="flex justify-between text-xs">
                        <span className="text-muted-foreground">
                          Completion Rate
                        </span>
                        <span>{item.completionRate}%</span>
                      </div>
                      <Progress value={item.completionRate} className="h-2" />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
}
