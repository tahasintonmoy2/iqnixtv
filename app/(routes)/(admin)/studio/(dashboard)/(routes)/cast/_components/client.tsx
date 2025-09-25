"use client";
import React from "react";
import { column, CastColumn } from "./columns";
import { Heading } from "@/components/ui/heading";
import { Separator } from "@/components/ui/separator";
import { DataTable } from "@/components/ui/data-table";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
// import { Apilist } from "@/components/ui/api-list";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { CastGrid } from "@/components/cast-grid";

interface CastClientProps {
  data: CastColumn[];
}

export const CastClient = ({ data }: CastClientProps) => {
  return (
    <>
      <div className="flex items-center justify-between">
        <Heading
          title={`Cast Management (${data.length})`}
          description="Manage cast members for your movies and series"
        />
        <Link href="/cast/new">
          <Button>
            <Plus className="size-5 mr-2" />
            Add new
          </Button>
        </Link>
      </div>
      <Separator />
      <Tabs defaultValue="grid" className="space-y-4">
        <TabsList>
          <TabsTrigger value="grid">Grid View</TabsTrigger>
          <TabsTrigger value="table">Table View</TabsTrigger>
        </TabsList>

        <TabsContent value="grid" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Cast Members</CardTitle>
              <CardDescription>
                Browse and manage cast members for your productions
              </CardDescription>
            </CardHeader>
            <CardContent>
              <CastGrid searchQuery={""} filters={{}} data={data}/>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="table" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Cast Members</CardTitle>
              <CardDescription>
                Detailed list of all cast members
              </CardDescription>
            </CardHeader>
            <CardContent>
              <DataTable searchKey="name" columns={column} data={data} />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      <Heading title="APIs" description="API call for all casts" />
      <Separator />
      {/* <Apilist entityName="casts" entityIdName="{castId}" /> */}
    </>
  );
};
