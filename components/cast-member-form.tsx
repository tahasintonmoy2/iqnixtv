"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  MultiSelect,
  MultiSelectContent,
  MultiSelectGroup,
  MultiSelectItem,
  MultiSelectTrigger,
  MultiSelectValue,
} from "@/components/ui/multi-select";
import { Textarea } from "@/components/ui/textarea";
import { Cast } from "@/lib/generated/prisma";
import { zodResolver } from "@hookform/resolvers/zod";
import axios from "axios";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import * as z from "zod";
import { FileUpload } from "./media-upload";
import { DatePicker } from "./ui/date-picker";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { Switch } from "./ui/switch";

const formSchema = z.object({
  name: z.string().min(1, "Name is required"),
  alsoKnownAs: z.string().optional(),
  image: z.string().min(1),
  dateOfBirth: z.date().optional(),
  gender: z.string().min(1),
  height: z.string().optional(),
  weight: z.string().optional(),
  age: z.string().min(2),
  region: z.string().min(4),
  career: z.array(z.string()).min(1, "Required"),
  bio: z.string().optional(),
  isFeatured: z.boolean().optional(),
});

interface CastFormProps {
  initialData: Cast | null;
  seasonId: string;
}

export function CastForm({ initialData, seasonId }: CastFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const router = useRouter();

  const title = initialData ? (
    <p>
      Edit <span className="text-violet-500">{`${initialData.name}`}</span>
    </p>
  ) : (
    "Add new cast"
  );
  const description = initialData
    ? `Edit ${initialData.name} details`
    : "Create a new cast for your series. Fill in the details below.";
  const toastMessage = initialData
    ? "Cast has been updated"
    : "Cast has been created!";
  const action = initialData ? "Save change" : "Create cast";
  const actionLoad = initialData && isLoading ? "Updating" : "Creating";

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: initialData?.name || "",
      alsoKnownAs: initialData?.alsoKnownAs || "",
      image: initialData?.image || "",
      dateOfBirth: initialData?.dateOfBirth
        ? new Date(initialData.dateOfBirth)
        : undefined,
      gender: initialData?.gender || "",
      height: initialData?.height || "",
      weight: initialData?.weight || "",
      age: initialData?.age || "",
      region: initialData?.region || "",
      career: Array.isArray(initialData?.career) ? initialData.career : [],
      bio: initialData?.bio || "",
      isFeatured: initialData?.isFeatured || false,
    },
  });

  const { isSubmitting, isValid } = form.formState;

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      setIsLoading(true);
      if (initialData) {
        await axios.patch(
          `/api/series/season/${seasonId}/cast/${initialData.id}`,
          values
        );
        router.push("/cast");
      } else {
        await axios.post(`/api/series/season/${seasonId}/cast`, values);
        router.push("/cast");
      }

      toast.success(toastMessage);
      router.refresh();
    } catch (error) {
      console.log(error);
      setIsLoading(false);
      toast.error("Failed to create cast");
    } finally {
      setIsLoading(false);
    }
  };

  if (!isMounted) {
    return null;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="flex items-center gap-4 mb-6">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-4">
                  <div className="space-y-2">
                    <FormField
                      control={form.control}
                      name="image"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Cast image</FormLabel>
                          <FormControl>
                            <FileUpload
                              endPoint="videoImage"
                              onChange={(url)=> field.onChange(url)}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <p className="text-xs text-muted-foreground">
                      Recommended: Square image, at least 300x300px
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Name</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Enter full name"
                        disabled={isLoading || isSubmitting}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="alsoKnownAs"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Also known as</FormLabel>
                    <Input
                      placeholder="Enter name"
                      disabled={isLoading || isSubmitting}
                      {...field}
                    />
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="region"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nationality</FormLabel>
                    <Input
                      placeholder="Enter nationality"
                      disabled={isLoading || isSubmitting}
                      {...field}
                    />
                    <FormControl></FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="dateOfBirth"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Birth Date</FormLabel>
                    <FormControl>
                      <DatePicker
                        value={field.value}
                        onChange={field.onChange}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Career field - fix Controller usage to avoid setState during render */}
              <FormField
                control={form.control}
                name="career"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Career</FormLabel>
                    <FormControl>
                      <MultiSelect
                        values={field.value ?? []}
                        onValuesChange={(vals) => field.onChange(vals)}
                      >
                        <MultiSelectTrigger
                          className="w-auto"
                          disabled={isLoading || isSubmitting}
                        >
                          <MultiSelectValue
                            placeholder="Select career..."
                            disabled={isLoading || isSubmitting}
                          />
                        </MultiSelectTrigger>
                        <MultiSelectContent>
                          <MultiSelectGroup>
                            <MultiSelectItem value="actress">
                              Actress
                            </MultiSelectItem>
                            <MultiSelectItem value="actor">
                              Actor
                            </MultiSelectItem>
                            <MultiSelectItem value="singer">
                              Singer
                            </MultiSelectItem>
                            <MultiSelectItem value="songwriter">
                              Songwriter
                            </MultiSelectItem>
                            <MultiSelectItem value="model">
                              Model
                            </MultiSelectItem>
                          </MultiSelectGroup>
                        </MultiSelectContent>
                      </MultiSelect>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="bio"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Biography</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Enter biographical information"
                        className="min-h-[120px]"
                        disabled={isLoading || isSubmitting}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="gender"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Gender</FormLabel>
                    <FormControl>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                        disabled={isLoading || isSubmitting}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select gender" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="female">Female</SelectItem>
                          <SelectItem value="male">Male</SelectItem>
                        </SelectContent>
                      </Select>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="height"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Height</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Enter height"
                        disabled={isLoading || isSubmitting}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="age"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Age</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Enter age"
                        disabled={isLoading || isSubmitting}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="weight"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Weight</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Enter weight"
                        disabled={isLoading || isSubmitting}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="isFeatured"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                    <div className="space-y-0.5">
                      <FormLabel>Featured cast</FormLabel>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                        disabled={isSubmitting || isLoading}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
            </div>

            <div className="flex justify-end space-x-4">
              <Button
                variant="outline"
                type="button"
                onClick={() => router.back()}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting || isLoading || !isValid}
              >
                {isSubmitting || isLoading ? (
                  <div className="flex items-center">
                    <div className="loader"></div>
                    <p>{actionLoad}</p>
                  </div>
                ) : (
                  <p>{action}</p>
                )}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
