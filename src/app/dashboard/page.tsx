import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import { getAllPosts } from '@/lib/markdown';
import DashboardTabs from '@/components/DashboardTabs';

export const metadata = {
  title: 'Dashboard — Jesus\u2019s Blog',
};

export default async function DashboardPage() {
  const session = await auth();

  if (!session?.user) {
    redirect('/sign-in');
  }

  // Build slug→title map from markdown files (server-side only)
  const posts = getAllPosts();
  const postTitles: Record<string, string> = {};
  for (const post of posts) {
    postTitles[post.slug] = post.title;
  }

  return (
    <div className="dashboard-page">
      <DashboardTabs postTitles={postTitles} />
    </div>
  );
}
