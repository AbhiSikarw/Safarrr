"use client";

import { useEffect } from "react";
import { supabase } from "@/lib/supabase/client";

export default function Home() {
  useEffect(() => {
    supabase.auth.getSession().then(console.log);
  }, []);

  return (
    <main className="p-8">
      <h1 className="text-3xl font-bold">Hare ka sahara baba shyam Hamara !!</h1>
      <p className="mt-2">Supabase connected ✅</p>
    </main>
  );
}
