"use client";

import Link from "next/link";
import { Cloud, Mountain, ThumbsUp, Eye } from "lucide-react";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase/client";

interface PostCardProps {
  post: {
    id: string;
    title: string;
    location: string;
    img_url: string | null;
    created_at: string;
    weather_condition: string | null;
    terrain_type: string | null;
    likes: number;
    views: number;
  };
}

export function PostCard({ post }: PostCardProps) {
  const [userId, setUserId] = useState<string | null>(null);
  const [liked, setLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(post.likes);

  /* ---------------- CHECK IF USER LIKED ---------------- */
  useEffect(() => {
    const load = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) return;
      setUserId(user.id);

      const { data } = await supabase
        .from("likes")
        .select("id")
        .eq("post_id", post.id)
        .eq("user_id", user.id)
        .maybeSingle();

      setLiked(!!data);
    };

    load();
  }, [post.id]);

  /* ---------------- TOGGLE LIKE ---------------- */
  const toggleLike = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!userId) return;

    if (liked) {
      await supabase
        .from("likes")
        .delete()
        .eq("post_id", post.id)
        .eq("user_id", userId);

      setLiked(false);
      setLikesCount((c) => Math.max(c - 1, 0));
    } else {
      await supabase.from("likes").insert({
        post_id: post.id,
        user_id: userId,
      });

      setLiked(true);
      setLikesCount((c) => c + 1);
    }
  };

  return (
    <Link href={`/post/${post.id}`}>
      <div className="bg-white rounded-2xl border shadow-sm overflow-hidden hover:shadow-md transition cursor-pointer">
        {/* IMAGE */}
        <div className="relative h-52 bg-gray-100">
          {post.img_url ? (
            <img
              src={post.img_url}
              alt={post.title}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-400 text-sm">
              No image
            </div>
          )}

          {/* TOP RIGHT STATS */}
          <div className="absolute top-3 right-3 bg-white/90 backdrop-blur rounded-full px-3 py-1 flex items-center gap-3 text-xs text-gray-700 shadow">
            <span className="flex items-center gap-1">
              <Eye className="h-4 w-4" />
              {post.views}
            </span>
            <span className="flex items-center gap-1">
              <ThumbsUp className="h-4 w-4" />
              {likesCount}
            </span>
          </div>
        </div>

        {/* CONTENT */}
        <div className="p-5">
          <h3 className="text-gray-900 font-semibold line-clamp-2">
            {post.title}
          </h3>
          <p className="text-sm text-gray-500 mt-1">{post.location}</p>

          {/* ENV */}
          {(post.weather_condition || post.terrain_type) && (
            <div className="flex items-center mt-3 text-xs text-gray-500">
              {post.weather_condition && (
                <>
                  <Cloud className="h-4 w-4 mr-1" />
                  {post.weather_condition}
                </>
              )}
              {post.terrain_type && (
                <>
                  <Mountain className="h-4 w-4 ml-4 mr-1" />
                  {post.terrain_type}
                </>
              )}
            </div>
          )}

          {/* ACTION */}
          <button
            onClick={toggleLike}
            className={`mt-4 inline-flex items-center gap-2 text-sm px-4 py-2 rounded-full border transition ${
              liked
                ? "bg-emerald-600 text-white border-emerald-600"
                : "bg-white text-gray-700 hover:bg-gray-50"
            }`}
          >
            <ThumbsUp className="h-4 w-4" />
            {liked ? "Liked" : "Like"}
          </button>
        </div>
      </div>
    </Link>
  );
}
