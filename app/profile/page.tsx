"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import {
  Shield,
  TrendingUp,
  MapPin,
  Calendar,
} from "lucide-react";

import { supabase } from "@/lib/supabase/client";
import { PostCard } from "@/components/PostCard";
import { calculateAuthorTrust } from "@/lib/trust";

export default function ProfilePage() {
  const fileRef = useRef<HTMLInputElement | null>(null);

  const [profile, setProfile] = useState<any>(null);
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const [editOpen, setEditOpen] = useState(false);
  const [name, setName] = useState("");
  const [bio, setBio] = useState("");
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [saving, setSaving] = useState(false);

  /* ---------------- LOAD PROFILE ---------------- */
  useEffect(() => {
    const loadProfile = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return setLoading(false);

      const { data: profileData } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .maybeSingle();

      const safeProfile =
        profileData || {
          id: user.id,
          name: "User",
          bio: "",
          avatar: null,
          created_at: new Date().toISOString(),
        };

      setProfile(safeProfile);
      setName(safeProfile.name);
      setBio(safeProfile.bio || "");

      const { data: postsData } = await supabase
        .from("posts")
        .select("*")
        .eq("user_id", user.id)
        .eq("status", "published")
        .order("created_at", { ascending: false });

      setPosts(postsData || []);
      setLoading(false);
    };

    loadProfile();
  }, []);

  /* ---------------- UPDATE PROFILE ---------------- */
  const updateProfile = async () => {
    if (!profile) return;
    setSaving(true);

    let avatarUrl = profile.avatar;

    if (avatarFile) {
      const ext = avatarFile.name.split(".").pop();
      const fileName = `${profile.id}.${ext}`;

      await supabase.storage
        .from("avatars")
        .upload(fileName, avatarFile, { upsert: true });

      avatarUrl = supabase.storage
        .from("avatars")
        .getPublicUrl(fileName).data.publicUrl;
    }

    await supabase.from("profiles").upsert({
      id: profile.id,
      name,
      bio,
      avatar: avatarUrl,
    });

    setEditOpen(false);
    location.reload();
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-500">
        Loading profile…
      </div>
    );
  }

  /* ---------------- TRUST CALCULATION ---------------- */
  const trust = calculateAuthorTrust(posts);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">

        {/* PROFILE HEADER */}
        <div className="bg-white border rounded-xl overflow-hidden mb-8">
          <div className="h-48 bg-gradient-to-r from-emerald-600 to-teal-600" />

          <div className="relative px-6 pb-6">
            <div className="absolute -top-16 left-6">
              <img
                src={profile.avatar || "/avatar-placeholder.png"}
                className="h-32 w-32 rounded-full border-4 border-white shadow-lg object-cover"
              />
            </div>

            <div className="pt-20 max-w-xl">
              <h1 className="text-3xl font-semibold">{profile.name}</h1>

              <p className="mt-3 text-gray-600">
                {profile.bio || "No bio yet"}
              </p>

              <div className="flex items-center mt-3 text-sm text-gray-500">
                <Calendar className="h-4 w-4 mr-1" />
                Joined{" "}
                {new Date(profile.created_at).toLocaleDateString("en-US", {
                  month: "long",
                  year: "numeric",
                })}
              </div>

              <button
                onClick={() => setEditOpen(true)}
                className="mt-4 px-6 py-2 bg-emerald-600 text-white rounded-lg"
              >
                Edit Profile
              </button>
            </div>
          </div>
        </div>

        {/* STATS */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <Stat
            icon={<Shield className="h-6 w-6 text-emerald-600" />}
            value={trust.trustScore}
            label="Author Trust"
          />

          <Stat
            icon={<TrendingUp className="h-6 w-6 text-purple-600" />}
            value={trust.totalViews}
            label="Total Views"
          />

          <Stat
            icon={<MapPin className="h-6 w-6 text-blue-600" />}
            value={trust.safePosts}
            label="Safe Posts"
          />
        </div>

        {/* POSTS */}
        <h2 className="text-2xl mb-6">Published Posts</h2>

        {posts.length > 0 ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {posts.map((post) => (
              <PostCard key={post.id} post={post} />
            ))}
          </div>
        ) : (
          <div className="bg-white border p-12 rounded-xl text-center">
            <p className="mb-4">No posts yet</p>
            <Link
              href="/create"
              className="px-6 py-3 bg-emerald-600 text-white rounded-lg"
            >
              Create Your First Post
            </Link>
          </div>
        )}
      </div>

      {/* EDIT PROFILE MODAL */}
      {editOpen && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center">
          <div className="bg-white rounded-xl w-full max-w-md p-6">
            <h2 className="text-xl mb-4">Edit Profile</h2>

            <div className="flex items-center gap-4 mb-4">
              <img
                src={profile.avatar || "/avatar-placeholder.png"}
                className="h-20 w-20 rounded-full object-cover border"
              />

              <button
                onClick={() => fileRef.current?.click()}
                className="px-4 py-2 border rounded-lg text-sm"
              >
                Change Avatar
              </button>

              <input
                ref={fileRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) =>
                  e.target.files && setAvatarFile(e.target.files[0])
                }
              />
            </div>

            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full border rounded-lg px-3 py-2 mb-3"
              placeholder="Name"
            />

            <textarea
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              rows={4}
              className="w-full border rounded-lg px-3 py-2 mb-4"
              placeholder="Bio"
            />

            <div className="flex justify-end gap-3">
              <button
                onClick={() => setEditOpen(false)}
                className="px-4 py-2 border rounded-lg"
              >
                Cancel
              </button>

              <button
                onClick={updateProfile}
                disabled={saving}
                className="px-4 py-2 bg-emerald-600 text-white rounded-lg"
              >
                {saving ? "Saving…" : "Save"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* ---------------- STAT COMPONENT ---------------- */
function Stat({
  icon,
  value,
  label,
}: {
  icon: React.ReactNode;
  value: number | string;
  label: string;
}) {
  return (
    <div className="bg-white border p-6 rounded-xl">
      {icon}
      <p className="text-3xl font-semibold mt-2">{value}</p>
      <p className="text-sm text-gray-500">{label}</p>
    </div>
  );
}
