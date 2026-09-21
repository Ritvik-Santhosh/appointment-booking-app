"use client";
import { useState, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import { auth } from "@/lib/firebaseConfig"; 
import { signOut } from "firebase/auth";
import { Sheet, SheetTitle, SheetDescription, SheetContent } from "@/components/ui/sheet";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Home, CalendarCheck, PersonStanding,History,
  Settings, User, Menu, ChevronLeft, ChevronRight, LogOut, Loader2} from "lucide-react";
import { toast } from "sonner";

const navItems = [
  { name: "Home", href: "/dashboard", icon: Home },
  { name: "Book Appointments", href: "/dashboard/book-appointments", icon: CalendarCheck },
  { name: "Walk-In Registration", href: "/dashboard/walk-in", icon: PersonStanding },
  { name: "Appointment History", href: "/dashboard/appointments", icon: History },
  { name: "Settings", href: "/dashboard/settings", icon: Settings },
  { name: "Profile", href: "/dashboard/profile", icon: User },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [loading, setLoading] = useState(false); // Track logout state
  const [user, setUser] = useState<{ name: string; email: string; photoURL: string } | null>(null);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  const handleLogout = async () => {
    try {
      setLoading(true); // Show loading state
      await signOut(auth); // Logs out user from Firebase
      localStorage.removeItem("user"); // Clears stored user data

      toast.success("Logout successful", {
        description: "You have been logged out.",
        duration: 3000,
      });

      setTimeout(() => {
        router.push("/"); // Redirect after a short delay
      }, 2000);
    } catch (error) {
      console.error("Logout failed", error);
      toast.error("Logout failed. Please try again.");
    } finally {
      setLoading(false); // Reset loading state (just in case)
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-100">
      {/* Sidebar for Desktop */}
      <div className={`hidden md:flex flex-col h-screen bg-white fixed z-101 border-r transition-all duration-300 ${
          isCollapsed ? "w-16" : "w-64"
        } p-3`}
      >
        {/* Sidebar Toggle Button */}
        <button
          className="mb-6 flex items-center space-x-4  p-2 rounded-lg hover:bg-gray-100 transition"
          onClick={() => setIsCollapsed(!isCollapsed)}
        >
          {isCollapsed ? <ChevronRight className="w-6 h-6 flex-shrink-0" /> : <ChevronLeft className="w-6 h-6 flex-shrink-0" />}
          <span className={`text-sm font-bold whitespace-nowrap transition-all duration-300 ${isCollapsed ? "opacity-0 w-0" : "opacity-100 w-auto"}`}>
            Dashboard
          </span>
        </button>

        {/* Navigation Links */}
        <nav className="flex-1 space-y-4">
          {navItems.map(({ name, href, icon: Icon }) => (
            <Link
              key={name}
              href={href}
              className={`flex items-center space-x-4 p-2 rounded-lg transition-all ${
                pathname === href ? "bg-gray-200" : "hover:bg-gray-100"
              }`}
            >
              <Icon className="w-6 h-6 flex-shrink-0" />
              <span className={`text-sm font-medium whitespace-nowrap transition-all duration-300 ${isCollapsed ? "opacity-0 w-0" : "opacity-100 w-auto"}`}>
                {name}
              </span>
            </Link>
          ))}
        </nav>

        {/* Profile Section */}
        <div className="mt-auto flex items-center space-x-3">
          {user && (
            <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="flex items-center space-x-3">
                <Avatar className="w-10 h-10 cursor-pointer">
                  {user.photoURL ? (
                    <AvatarImage src={user.photoURL} alt="Profile" />
                  ) : (
                    <AvatarFallback>{user.name ? user.name.charAt(0).toUpperCase() : "U"}</AvatarFallback>
                  )}
                </Avatar>
                <div
                className={`overflow-hidden transition-all duration-300 ${
                  isCollapsed ? "opacity-0 w-0" : "opacity-100 w-auto"
                }`}
              >
                <p className="text-sm text-left font-medium truncate w-40">{user.name}</p>
                <p className="text-xs text-gray-500 truncate w-40">{user.email}</p>
              </div>
              </button>
            </DropdownMenuTrigger>

            <DropdownMenuContent align="end" className="w-48 z-99999999 bg-white shadow-md rounded-lg p-2">
            <DropdownMenuItem
                onClick={handleLogout}
                disabled={loading} // Disable button when logging out
                className="flex items-center space-x-2 text-red-600 cursor-pointer hover:bg-gray-100 p-2 rounded"
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <LogOut className="w-4 h-4" />}
                <span>{loading ? "Logging out..." : "Logout"}</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          )}
        </div>
      </div>

      {/* Mobile Sidebar using ShadCN Sheet */}
      <Sheet open={isMobileOpen} onOpenChange={setIsMobileOpen}>
        <SheetContent side="left" className="w-64 z-99900">
          <nav className="flex flex-col h-full space-y-4 mt-12 p-3">
            {navItems.map(({ name, href, icon: Icon }) => (
              <Link
                key={name}
                href={href}
                className={`flex items-center space-x-4 p-3 rounded-lg transition ${
                  pathname === href ? "bg-gray-200" : "hover:bg-gray-100"
                }`}
                onClick={() => setIsMobileOpen(false)}
              >
                <Icon className="w-6 h-6" />
                <span className="text-sm font-medium">{name}</span>
              </Link>
            ))}
            <div className="mt-auto flex items-center space-x-3 p-4">
            {user && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="flex items-center space-x-3">
                    <Avatar className="w-10 h-10 cursor-pointer">
                      {user.photoURL ? (
                        <AvatarImage src={user.photoURL} alt="Profile" />
                      ) : (
                        <AvatarFallback>{user.name ? user.name.charAt(0).toUpperCase() : "U"}</AvatarFallback>
                      )}
                    </Avatar>

                    <div className="text-left">
                      <p className="text-sm font-medium truncate w-40">{user.name}</p>
                      <p className="text-xs text-gray-500 truncate w-40">{user.email}</p>
                    </div>
                  </button>
                </DropdownMenuTrigger>

                <DropdownMenuContent align="end" className="w-48 z-99999999 bg-white shadow-md rounded-lg p-2">
                  <DropdownMenuItem
                    onClick={handleLogout}
                    disabled={loading} // Disable button when logging out
                    className="flex items-center space-x-2 text-red-600 cursor-pointer hover:bg-gray-100 p-2 rounded"
                  >
                    {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <LogOut className="w-4 h-4" />}
                    <span>{loading ? "Logging out..." : "Logout"}</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>

          </nav>
          <SheetTitle className="sr-only"> Navigiation Menu</SheetTitle>
            <SheetDescription className="sr-only">Navigate to different menus Booking dashboard</SheetDescription>
        </SheetContent>
      </Sheet>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        <header className={`bg-white z-99900 shadow px-2 py-2 md:py-4 md:ml-16 flex justify-start items-center fixed w-full
           transition-all duration-300 ${isCollapsed ? "md:ml-16" : "md:ml-64"}`}>
          <button className="md:hidden p-4" onClick={() => setIsMobileOpen(true)}>
            <Menu className="w-6 h-6" />
          </button>
          <p className="text-md font-medium">
            Dashboard → {pathname.replace("/dashboard", "").replace(/^\//, "").replace("-", " ") || "Home"}
          </p>
        </header>
        <main className={`mt-16 p-6 items-center md:px-10 md:py-8 w-full max-w-6xl mx-auto
         transition-all duration-300 ${isCollapsed ? "" : "md:pl-64"}`}>{children}</main>
      </div>
    </div>
  );
}
