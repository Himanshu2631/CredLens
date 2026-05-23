export default async function sitemap() {
  return [
    {
      url: 'https://credlens.com',
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 1.0,
    },
  ];
}
