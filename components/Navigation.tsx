"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Menu, X, Shield, Plus, User, Compass, LogOut } from "lucide-react";
import { supabase } from "@/lib/supabase/client";

export function Navigation() {
  const pathname = usePathname();
  const router = useRouter();
  const dropdownRef = useRef<HTMLDivElement>(null);

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  const navLinks = [
    { path: "/", label: "Explore", icon: Compass },
    { path: "/create", label: "Create", icon: Plus },
    { path: "/safety", label: "Safety", icon: Shield },
  ];

  // Load user once
  useEffect(() => {
    const loadUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
      
      if (user) {
        const { data } = await supabase
          .from("profiles")
          .select("name, avatar")
          .eq("id", user.id)
          .maybeSingle();
        setProfile(data);
      }
      setLoading(false);
    };
    
    loadUser();
    
    // Auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(() => {
      loadUser();
    });
    
    return () => subscription.unsubscribe();
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    };
    
    if (dropdownOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [dropdownOpen]);

  const logout = useCallback(async () => {
    await supabase.auth.signOut();
    setDropdownOpen(false);
    router.push("/login");
  }, [router]);

  const isActive = (path: string) => pathname === path;

  if (loading) {
    return (
      <nav className="bg-white border-b border-gray-200 sticky top-0 z-50 h-16">
        <div className="max-w-7xl mx-auto px-4 h-full flex items-center">
          <div className="h-8 w-32 bg-gray-200 rounded animate-pulse"></div>
        </div>
      </nav>
    );
  }

  return (
    <nav className="bg-white border-b border-gray-200 sticky top-0 z-50 shadow-sm">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2">
            <Shield className="h-8 w-8 text-emerald-600" />
            <span className="text-xl font-bold text-gray-900">Banzara</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-2">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                href={link.path}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium ${
                  isActive(link.path)
                    ? "bg-emerald-50 text-emerald-700"
                    : "text-gray-600 hover:bg-gray-50"
                }`}
              >
                <link.icon className="h-4 w-4" />
                <span>{link.label}</span>
              </Link>
            ))}

            {/* Auth */}
            <div className="ml-4 pl-4 border-l border-gray-200">
              {!user ? (
                <div className="flex items-center space-x-2">
                  <Link href="/login" className="px-4 py-2 text-gray-600 hover:text-gray-900 text-sm">
                    Login
                  </Link>
                  <Link href="/signup" className="px-4 py-2 bg-emerald-600 text-white rounded-lg text-sm hover:bg-emerald-700">
                    Sign Up
                  </Link>
                </div>
              ) : (
                <div className="relative" ref={dropdownRef}>
                  <button
                    onClick={() => setDropdownOpen(!dropdownOpen)}
                    className="flex items-center space-x-2"
                  >
                    <div className="h-9 w-9 rounded-full bg-emerald-100 border-2 border-white flex items-center justify-center overflow-hidden">
                      {profile?.avatar ? (
                        <img src={profile.avatar} alt={profile.name} className="h-full w-full object-cover" />
                      ) : (
                        <User className="h-5 w-5 text-emerald-600" />
                      )}
                    </div>
                  </button>

                  {dropdownOpen && (
                    <div className="absolute right-0 mt-2 w-48 bg-white border rounded-lg shadow-lg py-1">
                      <Link
                        href="/profile"
                        onClick={() => setDropdownOpen(false)}
                        className="flex items-center space-x-2 px-4 py-3 hover:bg-gray-50"
                      >
                        <User className="h-4 w-4" />
                        <span>Profile</span>
                      </Link>
                      <button
                        onClick={logout}
                        className="w-full flex items-center space-x-2 px-4 py-3 hover:bg-gray-50 text-red-600"
                      >
                        <LogOut className="h-4 w-4" />
                        <span>Logout</span>
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 rounded-lg text-gray-600 hover:bg-gray-100"
          >
            {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t bg-white">
          <div className="px-4 py-2 space-y-1">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                href={link.path}
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center space-x-3 px-3 py-3 rounded-lg hover:bg-gray-50"
              >
                <link.icon className="h-5 w-5" />
                <span>{link.label}</span>
              </Link>
            ))}
            
            <div className="border-t pt-2 mt-2">
              {!user ? (
                <>
                  <Link href="/login" onClick={() => setMobileMenuOpen(false)} className="block px-3 py-3 rounded-lg hover:bg-gray-50">
                    Login
                  </Link>
                  <Link href="/signup" onClick={() => setMobileMenuOpen(false)} className="block px-3 py-3 bg-emerald-600 text-white rounded-lg mt-1 text-center">
                    Sign Up
                  </Link>
                </>
              ) : (
                <>
                  <Link href="/profile" onClick={() => setMobileMenuOpen(false)} className="block px-3 py-3 rounded-lg hover:bg-gray-50">
                    Profile
                  </Link>
                  <button onClick={() => { setMobileMenuOpen(false); logout(); }} className="w-full text-left px-3 py-3 rounded-lg hover:bg-gray-50 text-red-600">
                    Logout
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}