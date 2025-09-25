"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"

import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"

const formSchema = z.object({
  platformName: z.string().min(2, {
    message: "Platform name must be at least 2 characters.",
  }),
  supportEmail: z.string().email({
    message: "Please enter a valid email address.",
  }),
  defaultLanguage: z.string({
    required_error: "Please select a language.",
  }),
  description: z.string().optional(),
  enableAutoPublish: z.boolean().default(false),
  enableComments: z.boolean().default(true),
  enableAnalytics: z.boolean().default(true),
})

export function SettingsForm() {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      platformName: "OTT Platform",
      supportEmail: "support@example.com",
      defaultLanguage: "en",
      description: "A streaming platform for movies and series",
      enableAutoPublish: false,
      enableComments: true,
      enableAnalytics: true,
    },
  })

  function onSubmit(values: z.infer<typeof formSchema>) {
    console.log(values)
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="platformName"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Platform Name</FormLabel>
              <FormControl>
                <Input placeholder="Enter platform name" {...field} />
              </FormControl>
              <FormDescription>This is the name of your streaming platform.</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="supportEmail"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Support Email</FormLabel>
              <FormControl>
                <Input placeholder="Enter support email" {...field} />
              </FormControl>
              <FormDescription>This email will be used for support inquiries.</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="defaultLanguage"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Default Language</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a language" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="en">English</SelectItem>
                  <SelectItem value="es">Spanish</SelectItem>
                  <SelectItem value="fr">French</SelectItem>
                  <SelectItem value="de">German</SelectItem>
                  <SelectItem value="ja">Japanese</SelectItem>
                </SelectContent>
              </Select>
              <FormDescription>The default language for your platform.</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Platform Description</FormLabel>
              <FormControl>
                <Textarea placeholder="Enter platform description" className="resize-none" {...field} />
              </FormControl>
              <FormDescription>A brief description of your streaming platform.</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="space-y-4">
          <h3 className="text-lg font-medium">Platform Features</h3>

          <FormField
            control={form.control}
            name="enableAutoPublish"
            render={({ field }) => (
              <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                <FormControl>
                  <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                </FormControl>
                <div className="space-y-1 leading-none">
                  <FormLabel>Auto-publish content</FormLabel>
                  <FormDescription>Automatically publish new content when uploaded.</FormDescription>
                </div>
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="enableComments"
            render={({ field }) => (
              <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                <FormControl>
                  <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                </FormControl>
                <div className="space-y-1 leading-none">
                  <FormLabel>Enable comments</FormLabel>
                  <FormDescription>Allow users to comment on content.</FormDescription>
                </div>
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="enableAnalytics"
            render={({ field }) => (
              <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                <FormControl>
                  <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                </FormControl>
                <div className="space-y-1 leading-none">
                  <FormLabel>Enable analytics</FormLabel>
                  <FormDescription>Collect and analyze user viewing data.</FormDescription>
                </div>
              </FormItem>
            )}
          />
        </div>

        <Button type="submit">Save Changes</Button>
      </form>
    </Form>
  )
}
