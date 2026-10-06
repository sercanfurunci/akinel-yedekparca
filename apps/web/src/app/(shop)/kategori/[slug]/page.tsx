import { redirect } from 'next/navigation';

interface Props {
  params: Promise<{ slug: string }>;
}

export default async function KategoriRedirect({ params }: Props) {
  const { slug } = await params;
  redirect(`/yedek-parcalar/${slug}`);
}
