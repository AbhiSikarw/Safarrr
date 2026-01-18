"use client";

import { useEffect, useState } from "react";
import { Search, Filter, Shield } from "lucide-react";
import { PostCard } from "@/components/PostCard";
import { supabase } from "@/lib/supabase/client";

export default function HomePage() {
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const [searchQuery, setSearchQuery] = useState("");
  const [showSafeOnly, setShowSafeOnly] = useState(false);

  useEffect(() => {
    const fetchPosts = async () => {
      const { data, error } = await supabase
        .from("posts")
        .select("*")
        .eq("status", "published")
        .order("created_at", { ascending: false });

      if (!error && data) {
        setPosts(data);
      }

      setLoading(false);
    };

    fetchPosts();
  }, []);

  const filteredPosts = posts.filter((post) => {
    const q = searchQuery.toLowerCase();

    const matchesSearch =
      post.title.toLowerCase().includes(q) ||
      post.location.toLowerCase().includes(q) ||
      post.author_name?.toLowerCase().includes(q) ||
      post.tags?.some((tag: string) =>
        tag.toLowerCase().includes(q)
      );

    const matchesSafety =
      !showSafeOnly || post.safety_level === "SAFE";

    return matchesSearch && matchesSafety;
  });

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-emerald-600 to-teal-600 text-white">
        <div className="max-w-7xl mx-auto px-4 py-12 text-center">
          <h1 className="text-4xl sm:text-5xl mb-4">
            Explore Safe Travel Destinations
          </h1>
          <p className="text-lg text-emerald-50 max-w-2xl mx-auto">
            Discover travel stories with real safety insights. Plan your next adventure with confidence.
          </p>
        </div>
        <div>
          <h1>Abhishek Sikarwar</h1>
          
        </div>

      </div>
      

      {/* Search & Filters */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search location, tag, or username..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none"
              />
            </div>

            {/* Safe filter */}
            <button
              onClick={() => setShowSafeOnly(!showSafeOnly)}
              className={`flex items-center space-x-2 px-6 py-3 rounded-lg border ${
                showSafeOnly
                  ? "bg-emerald-50 border-emerald-500 text-emerald-700"
                  : "bg-white border-gray-300 text-gray-700 hover:bg-gray-50"
              }`}
            >
              <Shield
                className={`h-5 w-5 ${
                  showSafeOnly
                    ? "text-emerald-600"
                    : "text-gray-500"
                }`}
              />
              <span>Show Only Safe</span>
            </button>

            {/* Placeholder filter */}
            <button className="flex items-center space-x-2 px-6 py-3 rounded-lg border border-gray-300 bg-white text-gray-700 hover:bg-gray-50">
              <Filter className="h-5 w-5 text-gray-500" />
              <span>More Filters</span>
            </button>
          </div>
        </div>
      </div>

      {/* Posts */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-6 text-gray-600">
          Showing{" "}
          <span className="text-gray-900">
            {filteredPosts.length}
          </span>{" "}
          {filteredPosts.length === 1
            ? "story"
            : "stories"}
          {showSafeOnly && (
            <span className="text-emerald-600">
              {" "}
              (Safe locations only)
            </span>
          )}
        </div>

        {loading ? (
          <div className="text-center py-12 text-gray-500">
            Loading posts…
          </div>
        ) : filteredPosts.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredPosts.map((post) => (
              <PostCard key={post.id} post={post} />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <Search className="h-16 w-16 mx-auto text-gray-300 mb-4" />
            <h3 className="text-gray-900 mb-2">
              No results found
            </h3>
            <p className="text-gray-600">
              Try adjusting your search or filters
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
