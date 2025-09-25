import { ProfileSelector } from "@/components/profile-selector"

export default function ProfilesPage() {
  return (
    <div className="container mx-auto flex flex-col items-center justify-center min-h-[80vh] px-4">
      <h1 className="text-3xl font-bold mb-8">Who's watching?</h1>
      <ProfileSelector />
    </div>
  )
}
