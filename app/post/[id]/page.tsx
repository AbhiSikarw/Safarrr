"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
  ArrowLeft,
  Cloud,
  Mountain,
  AlertTriangle,
  Shield,
  MapPin,
} from "lucide-react";
import { supabase } from "@/lib/supabase/client";

export default function PostDetailPage() {
  const params = useParams();
  const id = params.id as string;

  const [post, setPost] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;

    const load = async () => {
      setLoading(true);

      /* 1️⃣ Fetch post */
      const { data: postData, error } = await supabase
        .from("posts")
        .select("*")
        .eq("id", id)
        .single();

      if (error || !postData) {
        setLoading(false);
        return;
      }

      /* 2️⃣ Fetch author profile */
   const { data: profile } = await supabase
  .from("profiles")
  .select("name")
  .eq("id", postData.user_id)
  .maybeSingle();


  let trustScore = 50; // sane default

const { data: trustData, error: trustError } = await supabase.rpc(
  "calculate_author_trust",
  { p_user_id: postData.user_id }
);

if (!trustError && typeof trustData === "number") {
  trustScore = trustData;
}


  


      /* 3️⃣ Normalize EXACTLY like mock data */
      setPost({
        id: postData.id,
        title: postData.title,
        content: postData.content,
        image: postData.img_url,
        location: postData.location,
        date: postData.created_at,

        safetyLevel: postData.safety_level,
        safetyScore: postData.safety_score,

        weather: {
          condition: postData.weather_condition,
          risk: postData.weather_risk_level,
        },

        terrain: {
          type: postData.terrain_type,
          risk: postData.terrain_risk_level,
        },

        tags: postData.tags || [],

        author: {
          name: profile?.name || postData.author_name || "Anonymous",
          avatar: "/avatar-placeholder.png",
    trustScore: trustScore,
        },
      });

      setLoading(false);
    };

    load();
  }, [id]);

  /* ---------------- LOADING ---------------- */

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center text-gray-500">
        Loading post…
      </div>
    );
  }

  if (!post) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl text-gray-900 mb-2">Post not found</h2>
          <Link href="/" className="text-emerald-600 hover:text-emerald-700">
            ← Back to explore
          </Link>
        </div>
      </div>
    );
  }

  /* ---------------- UI HELPERS (UNCHANGED) ---------------- */

  const getSafetyBadgeColor = (level: string) => {
    switch (level) {
      case "SAFE":
        return "bg-emerald-500";
      case "MODERATE":
        return "bg-amber-500";
      case "RISKY":
        return "bg-red-500";
      default:
        return "bg-gray-500";
    }
  };

  const getRiskBadgeColor = (risk: "low" | "medium" | "high") => {
    switch (risk) {
      case "low":
        return "bg-emerald-100 text-emerald-800 border-emerald-200";
      case "medium":
        return "bg-amber-100 text-amber-800 border-amber-200";
      case "high":
        return "bg-red-100 text-red-800 border-red-200";
    }
  };

  /* ---------------- UI (IDENTICAL) ---------------- */

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Back Button */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <Link
            href="/"
            className="inline-flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors"
          >
            <ArrowLeft className="h-5 w-5" />
            <span>Back to Explore</span>
          </Link>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* SAFETY & TRUST */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
          <div className="flex items-center space-x-2 mb-4">
            <Shield className="h-5 w-5 text-emerald-600" />
            <h2 className="text-gray-900">Safety & Risk Overview</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="flex items-center space-x-3 p-4 bg-gray-50 rounded-lg">
              <div
                className={`${getSafetyBadgeColor(
                  post.safetyLevel
                )} h-12 w-12 rounded-full flex items-center justify-center text-white text-xl`}
              >
                {post.safetyLevel === "SAFE" && "🟢"}
                {post.safetyLevel === "MODERATE" && "🟡"}
                {post.safetyLevel === "RISKY" && "🔴"}
              </div>
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wide">
                  Risk Level
                </p>
                <p className="text-gray-900">{post.safetyLevel}</p>
              </div>
            </div>

            <div className="flex items-center space-x-3 p-4 bg-gray-50 rounded-lg">
              <div className="h-12 w-12 rounded-full bg-emerald-100 flex items-center justify-center">
                <Shield className="h-6 w-6 text-emerald-600" />
              </div>
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wide">
                  Safety Score
                </p>
                <p className="text-gray-900">{post.safetyScore}/100</p>
              </div>
            </div>

            <div className="flex items-center space-x-3 p-4 bg-gray-50 rounded-lg">
              <img
                src={post.author.avatar}
                alt={post.author.name}
                className="h-12 w-12 rounded-full"
              />
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wide">
                  Author Trust
                </p>
                <p className="text-gray-900">
                  {post.author.trustScore}%
                </p>
              </div>
            </div>
          </div>

          <div className="border-t border-gray-200 pt-4">
            <h3 className="text-sm text-gray-700 mb-3">
              Environmental Risk Indicators
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div
                className={`flex items-center justify-between p-3 rounded-lg border ${getRiskBadgeColor(
                  post.weather.risk
                )}`}
              >
                <div className="flex items-center space-x-2">
                  <Cloud className="h-5 w-5" />
                  <div>
                    <p className="text-sm">Weather Condition</p>
                    <p className="text-xs opacity-80">
                      {post.weather.condition}
                    </p>
                  </div>
                </div>
                <span className="text-xs uppercase px-2 py-1 bg-white/50 rounded">
                  {post.weather.risk} risk
                </span>
              </div>

              <div
                className={`flex items-center justify-between p-3 rounded-lg border ${getRiskBadgeColor(
                  post.terrain.risk
                )}`}
              >
                <div className="flex items-center space-x-2">
                  <Mountain className="h-5 w-5" />
                  <div>
                    <p className="text-sm">Terrain Type</p>
                    <p className="text-xs opacity-80">
                      {post.terrain.type}
                    </p>
                  </div>
                </div>
                <span className="text-xs uppercase px-2 py-1 bg-white/50 rounded">
                  {post.terrain.risk} risk
                </span>
              </div>
            </div>
          </div>

          {post.safetyLevel === "RISKY" && (
            <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start space-x-3">
              <AlertTriangle className="h-5 w-5 text-red-600 mt-0.5" />
              <p className="text-sm text-red-800">
                <strong>High Risk Location:</strong> This destination requires
                experienced travelers, proper planning, and professional guides.
              </p>
            </div>
          )}
        </div>

        {/* CONTENT */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
          <div className="flex items-center space-x-2 text-emerald-600 mb-2">
            <MapPin className="h-4 w-4" />
            <span className="text-sm">{post.location}</span>
          </div>

          <h1 className="text-3xl sm:text-4xl mb-4">{post.title}</h1>

          <div className="flex items-center space-x-3 pb-6 border-b">
            <img
              src={post.author.avatar}
              alt={post.author.name}
              className="h-12 w-12 rounded-full"
            />
            <div>
              <p>{post.author.name}</p>
              <p className="text-sm text-gray-500">
                {new Date(post.date).toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </p>
            </div>
          </div>

          <div className="my-6 rounded-lg overflow-hidden">
            <img
              src={post.image}
              alt={post.title}
              className="w-full h-96 object-cover"
            />
          </div>

          <div className="prose prose-gray max-w-none">
            {post.content.split("\n\n").map((p: string, i: number) => (
              <p key={i}>{p}</p>
            ))}
          </div>

          <div className="mt-6 pt-6 border-t">
            <div className="flex flex-wrap gap-2">
              {post.tags.map((tag: string) => (
                <span
                  key={tag}
                  className="px-3 py-1 bg-gray-100 text-gray-700 text-sm rounded-full"
                >
                  #{tag}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* COMMENTS */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-gray-900 mb-4">Comments</h2>
          <div className="text-center py-8 text-gray-500">
            No comments yet. Be the first to share your thoughts!
          </div>
        </div>
      </div>
    </div>
  );
}
