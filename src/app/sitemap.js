export default function sitemap() {
  const baseUrl = 'https://srisatyasaiac.vercel.app';
  return [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 1.0,
    },
  ];
}
