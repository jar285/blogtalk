import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import { getAllPosts } from '@/lib/markdown';
import AdminPanel from '@/components/AdminPanel';

export const metadata = {
  title: 'Admin — Jesus\u2019s Blog',
};

export default async function AdminPage() {
  const session = await auth();

  if (!session?.user) {
    redirect('/sign-in');
  }

  // Server-side admin check — middleware only checks for session presence
  if (session.user.role !== 'admin') {
    redirect('/');
  }

  // Build slug→title map from markdown files
  const posts = getAllPosts();
  const postTitles: Record<string, string> = {};
  for (const post of posts) {
    postTitles[post.slug] = post.title;
  }

  return (
    <div className="admin-page">
      <AdminPanel postTitles={postTitles} />
    </div>
  );
}
