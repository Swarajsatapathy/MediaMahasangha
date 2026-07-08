const API_URL = process.env.NEXT_PUBLIC_API_URL;

async function fetchFromAPI(endpoint: string) {
  try {
    if (!API_URL) {
      throw new Error("NEXT_PUBLIC_API_URL is missing");
    }

    const res = await fetch(`${API_URL}${endpoint}`, {
      cache: "no-store",
    });

    const data = await res.json();

    if (!res.ok || !data.success) {
      throw new Error(data.message || "API request failed");
    }

    return data.data;
  } catch (error) {
    console.error(`API Error [${endpoint}]:`, error);
    return null;
  }
}

// Articles
export async function getArticles() {
  return await fetchFromAPI("/api/articles");
}

export async function getFlashArticles() {
  return await fetchFromAPI("/api/articles/flash");
}

export async function getPresidentPicks() {
  return await fetchFromAPI("/api/articles/editors-picks");
}

export async function getTrendingArticles() {
  return await fetchFromAPI("/api/articles?trending=true");
}

export async function getFeaturedArticles() {
  return await fetchFromAPI("/api/articles/featured");
}

export async function getArticleById(id: string) {
  return await fetchFromAPI(`/api/articles/${id}`);
}

// Videos
export async function getVideos() {
  return await fetchFromAPI("/api/videos");
}

export async function getFeaturedVideos() {
  return await fetchFromAPI("/api/videos/featured");
}

export async function getFlashVideos() {
  return await fetchFromAPI("/api/videos/flash");
}

export async function getPresidentPickVideos() {
  return await fetchFromAPI("/api/videos?editorsPick=true");
}

export async function getTrendingVideos() {
  return await fetchFromAPI("/api/videos?trending=true");
}

export async function getVideoById(id: string) {
  return await fetchFromAPI(`/api/videos/${id}`);
}

// Members
export async function getMembers() {
  return await fetchFromAPI("/api/members");
}

export async function getMemberById(id: string) {
  return await fetchFromAPI(`/api/members/${id}`);
}

// Mentors
export async function getMentors() {
  return await fetchFromAPI("/api/mentors");
}

export async function getMentorById(id: string) {
  return await fetchFromAPI(`/api/mentors/${id}`);
}

// Member News Channels
export async function getMemberNewsChannels() {
  return await fetchFromAPI("/api/member-news-channels");
}

export async function getMemberNewsChannelById(id: string) {
  return await fetchFromAPI(`/api/member-news-channels/${id}`);
}

// SRB Members
export async function getSrbMembers() {
  return await fetchFromAPI("/api/srb-members");
}

export async function getSrbMemberById(id: string) {
  return await fetchFromAPI(`/api/srb-members/${id}`);
}

// Gallery
export async function getGalleryItems() {
  return await fetchFromAPI("/api/gallery");
}

export async function getGalleryItemById(id: string) {
  return await fetchFromAPI(`/api/gallery/${id}`);
}