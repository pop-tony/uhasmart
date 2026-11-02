import { MetadataRoute } from "next";
import { categories, campusLocations } from "@/lib/data";

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = "https://varsmartgh.com";
  const lastModified = new Date();

  // 1. Core Platform Pages
  const coreRoutes: MetadataRoute.Sitemap = [
    {
      url: `${baseUrl}`,
      lastModified,
      changeFrequency: "daily",
      priority: 1.0,
    },
    {
      url: `${baseUrl}/marketplace`,
      lastModified,
      changeFrequency: "daily",
      priority: 0.95,
    },
    {
      url: `${baseUrl}/help`,
      lastModified,
      changeFrequency: "weekly",
      priority: 0.85,
    },
    {
      url: `${baseUrl}/seller`,
      lastModified,
      changeFrequency: "weekly",
      priority: 0.85,
    },
    {
      url: `${baseUrl}/register-business`,
      lastModified,
      changeFrequency: "weekly",
      priority: 0.8,
    },
    {
      url: `${baseUrl}/login`,
      lastModified,
      changeFrequency: "monthly",
      priority: 0.5,
    },
    {
      url: `${baseUrl}/register`,
      lastModified,
      changeFrequency: "monthly",
      priority: 0.5,
    },
  ];

  // 2. High-intent Category Landing Filters (Hostels, Food, Electronics, Fashion, etc.)
  const categoryRoutes: MetadataRoute.Sitemap = categories.map((cat) => ({
    url: `${baseUrl}/marketplace?category=${encodeURIComponent(cat.id)}`,
    lastModified,
    changeFrequency: "daily",
    priority: 0.85,
  }));

  // 3. Location Landing Filters in Ho (Sokode, Dave, Trafalgar, Bankoe, Dome, etc.)
  const locationRoutes: MetadataRoute.Sitemap = campusLocations.slice(0, 10).map((loc) => ({
    url: `${baseUrl}/marketplace?location=${encodeURIComponent(loc.name)}`,
    lastModified,
    changeFrequency: "daily",
    priority: 0.75,
  }));

  return [...coreRoutes, ...categoryRoutes, ...locationRoutes];
}
