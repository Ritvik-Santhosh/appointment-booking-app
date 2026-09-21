"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export default function ProfilePage() {
  const router = useRouter();
  const [user, setUser] = useState<{ name: string; email: string; photoURL: string } | null>(null);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (!storedUser) {
      router.push("/");
    } else {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Profile</h1>
      {user ? (
        <div className="flex items-center space-x-4">
          <Avatar className="w-16 h-16">
            {user.photoURL ? (
              <AvatarImage src={user.photoURL} alt="Profile" />
            ) : (
              <AvatarFallback>{user.name ? user.name.charAt(0) : "U"}</AvatarFallback>
            )}
          </Avatar>
          <div>
            <p className="text-lg font-medium">{user.name}</p>
            <p className="text-gray-500">{user.email}</p>
          </div>
        </div>
      ) : (
        <p>Loading...</p>
      )}
    </div>
  );
}
