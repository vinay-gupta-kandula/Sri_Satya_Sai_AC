export default function sitemap() {
  const baseUrl = 'https://sri-satya-sai-ac.vercel.app';
  return [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 1.0,
    },
  ];
}
