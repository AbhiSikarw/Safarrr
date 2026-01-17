// /lib/trust.ts

/**
 * Author Trust Score (0–100)
 *
 * Rules (simple & explainable):
 * - Everyone starts at 50
 * - +1 trust per 100 views (max +20)
 * - +2 trust per like (max +20)
 * - +5 trust per SAFE post (max +20)
 * - -10 trust per UNSAFE post
 * - +5 bonus if active in last 30 days
 */

export function calculateAuthorTrust(posts: any[]) {
  let trust = 50;

  if (!posts || posts.length === 0) {
    return {
      trustScore: trust,
      totalViews: 0,
      totalLikes: 0,
      safePosts: 0,
      unsafePosts: 0,
    };
  }

  const totalViews = posts.reduce(
    (sum, post) => sum + (post.views || 0),
    0
  );

  const totalLikes = posts.reduce(
    (sum, post) => sum + (post.likes || 0),
    0
  );

  const safePosts = posts.filter(
    (p) => p.safety_level === "SAFE"
  ).length;

  const unsafePosts = posts.filter(
    (p) => p.safety_level === "UNSAFE"
  ).length;

  // Rewards
  trust += Math.min(Math.floor(totalViews / 100), 20);
  trust += Math.min(totalLikes * 2, 20);
  trust += Math.min(safePosts * 5, 20);

  // Penalties
  trust -= unsafePosts * 10;

  // Activity bonus (posted in last 30 days)
  const recentlyActive = posts.some(
    (p) =>
      Date.now() - new Date(p.created_at).getTime() <
      1000 * 60 * 60 * 24 * 30
  );

  if (recentlyActive) trust += 5;

  trust = Math.max(0, Math.min(100, trust));

  return {
    trustScore: trust,
    totalViews,
    totalLikes,
    safePosts,
    unsafePosts,
  };
}
