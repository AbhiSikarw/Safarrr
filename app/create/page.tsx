"use client";

import { useState, useRef } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Upload,
  Shield,
  AlertCircle,
  Loader2,
  X,
} from "lucide-react";
import { supabase } from "@/lib/supabase/client";

export default function CreatePostPage() {
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const [title, setTitle] = useState("");
  const [location, setLocation] = useState("");
  const [content, setContent] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);

  /* 🏷 TAGS */
  const [tagInput, setTagInput] = useState("");
  const [tags, setTags] = useState<string[]>([]);

  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const resetForm = () => {
    setTitle("");
    setLocation("");
    setContent("");
    setImageFile(null);
    setTags([]);
    setTagInput("");
  };

  /* ---------------- TAG HANDLERS ---------------- */

  const addTag = () => {
    const value = tagInput.trim().toLowerCase();
    if (!value || tags.includes(value)) return;
    setTags([...tags, value]);
    setTagInput("");
  };

  const removeTag = (tag: string) => {
    setTags(tags.filter((t) => t !== tag));
  };

  /* ---------------- SUBMIT ---------------- */

 const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  setError(null);

  if (content.trim().length < 100) {
    setError("Post content must be at least 100 characters.");
    return;
  }

  try {
    setLoading(true);

    /* 1️⃣ AUTH */
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setError("You must be logged in to publish a post.");
      return;
    }

    /* 2️⃣ IMAGE UPLOAD */
    let img_url: string | null = null;

    if (imageFile) {
      const ext = imageFile.name.split(".").pop();
      const fileName = `${user.id}-${Date.now()}.${ext}`;

      const { error: uploadError } = await supabase.storage
        .from("post-images")
        .upload(fileName, imageFile, {
          cacheControl: "3600",
          upsert: false,
          contentType: imageFile.type,
        });

      if (uploadError) {
        setError(uploadError.message);
        return;
      }

      const { data } = supabase.storage
        .from("post-images")
        .getPublicUrl(fileName);

      img_url = data.publicUrl;
    }

    /* 3️⃣ FETCH LOCATION INSIGHTS */
    const res = await fetch(
      `/api/location-insights?location=${encodeURIComponent(location)}`
    );

    if (!res.ok) {
      setError("Failed to analyze location safety.");
      return;
    }

    const insights = await res.json();

    /* 4️⃣ INSERT POST (ONCE, FULL DATA) */
    const { error: insertError } = await supabase.from("posts").insert({
      user_id: user.id,
      author_name:
        user.user_metadata?.full_name ||
        user.user_metadata?.name ||
        user.email ||
        "Anonymous",

      title,
      location,
      content,
      img_url,
      tags,

      status: "published",

      views: 0,
      likes: 0,

      // 🌦 WEATHER
      weather_condition: insights.weather_condition,
      weather_risk_score: insights.weather_risk_score,
      weather_risk_level: insights.weather_risk_level,

      // ⛰ TERRAIN
      terrain_type: insights.terrain_type,
      terrain_risk_score: insights.terrain_risk_score,
      terrain_risk_level: insights.terrain_risk_level,

      // 🛡 SAFETY
      safety_score: insights.safety_score,
      safety_level: insights.safety_level,

      calculated_at: insights.calculated_at,
    });

    if (insertError) {
      setError(insertError.message);
      return;
    }

    resetForm();
    setSubmitted(true);
  } catch (err) {
    console.error(err);
    setError("Something went wrong. Please try again.");
  } finally {
    setLoading(false);
  }
};


  /* ---------------- SUCCESS ---------------- */

  if (submitted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
        <div className="bg-white rounded-xl border shadow-sm p-8 max-w-md text-center">
          <div className="mx-auto mb-4 h-14 w-14 flex items-center justify-center rounded-full bg-emerald-100">
            <Shield className="h-7 w-7 text-emerald-600" />
          </div>
          <h2 className="text-2xl font-semibold text-gray-900 mb-2">
            Post Published
          </h2>
          <p className="text-gray-600 mb-6">
            Your travel post is live and visible to others.
          </p>
          <Link
            href="/"
            className="inline-flex px-6 py-3 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700"
          >
            Back to Explore
          </Link>
        </div>
      </div>
    );
  }

  /* ---------------- FORM ---------------- */

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <Link href="/" className="inline-flex gap-2 text-gray-600">
            <ArrowLeft className="h-5 w-5" /> Back to Explore
          </Link>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-10">
        <div className="bg-white border rounded-xl shadow-sm p-6 sm:p-10">
          <h1 className="text-3xl font-semibold mb-2">Create Travel Post</h1>
          <p className="text-gray-600 mb-8">
            Share your experience, tips, and safety insights.
          </p>

          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 text-sm p-3 rounded-lg">
                {error}
              </div>
            )}

            {/* Title */}
            <input
              placeholder="Post title (e.g. Solo trek in Spiti Valley)"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full rounded-lg border px-4 py-3"
              required
            />

            {/* Location */}
            <input
              placeholder="Location (City, State, Country)"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="w-full rounded-lg border px-4 py-3"
              required
            />

            {/* Tags */}
            <div>
              <label className="block text-sm font-medium mb-1">
                Tags (press Enter to add)
              </label>
              <input
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addTag())}
                placeholder="trekking, solo, budget, himalayas"
                className="w-full rounded-lg border px-4 py-3"
              />

              {tags.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-3">
                  {tags.map((tag) => (
                    <span
                      key={tag}
                      className="flex items-center gap-1 bg-emerald-100 text-emerald-800 px-3 py-1 rounded-full text-sm"
                    >
                      #{tag}
                      <button type="button" onClick={() => removeTag(tag)}>
                        <X className="h-4 w-4" />
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Content */}
            <textarea
              rows={10}
              placeholder="Describe your journey, safety tips, costs, risks, and recommendations…"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="w-full rounded-lg border px-4 py-3 resize-none"
              required
            />

            {/* Image */}
            <div
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed rounded-lg p-6 text-center cursor-pointer"
            >
              <Upload className="h-10 w-10 mx-auto text-gray-400 mb-2" />
              <p className="text-sm text-gray-600">
                Click to upload a cover image (optional)
              </p>
              {imageFile && (
                <p className="mt-2 text-xs text-emerald-600">
                  {imageFile.name}
                </p>
              )}
            </div>

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) =>
                e.target.files && setImageFile(e.target.files[0])
              }
            />

            <div className="bg-emerald-50 border rounded-lg p-4 flex gap-3">
              <AlertCircle className="h-5 w-5 text-emerald-600" />
              <p className="text-sm text-emerald-800">
                Posts are analyzed for safety and trust indicators.
              </p>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="inline-flex gap-2 px-8 py-3 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700"
            >
              {loading ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" /> Publishing…
                </>
              ) : (
                <>
                  <Shield className="h-5 w-5" /> Publish Post
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
