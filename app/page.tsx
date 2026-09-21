"use client";
import { signInWithPopup } from "firebase/auth";
import { auth, googleProvider } from "@/lib/firebase";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();

  const handleGoogleLogin = async () => {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;

      // Extract name, email, and profile picture
      const userData = {
        name: user.displayName || "No Name",
        email: user.email || "No Email",
        photoURL: user.photoURL || "",
      };

      // Store in localStorage for session persistence
      localStorage.setItem("user", JSON.stringify(userData));
      console.log(userData)
      // Redirect to dashboard
      router.push("/dashboard");
      console.log(userData)
    } catch (error) {
      console.error("Google Sign-in failed", error);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center h-screen">
      <h1 className="text-2xl font-bold mb-4">Login</h1>
      <button
        onClick={handleGoogleLogin}
        className="px-4 py-2 bg-blue-500 text-white rounded-md"
      >
        Sign in with Google
      </button>
    </div>
  );
}
