import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { DashboardHeader } from "@/components/dashboard-header"
import { UploadsList } from "@/components/uploads-list"
import { Upload } from "lucide-react"

export default function UploadsPage() {
  return (
    <>
      <DashboardHeader heading="Content Uploads" text="Manage and track your content uploads">
        <Button>
          <Upload className="mr-2 h-4 w-4" />
          Upload Content
        </Button>
      </DashboardHeader>

      <Card>
        <CardHeader>
          <CardTitle>Recent Uploads</CardTitle>
          <CardDescription>Track the status of your recent content uploads</CardDescription>
        </CardHeader>
        <CardContent>
          <UploadsList />
        </CardContent>
      </Card>
    </>
  )
}
