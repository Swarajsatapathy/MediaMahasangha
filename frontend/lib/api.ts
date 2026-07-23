const API_URL = process.env.NEXT_PUBLIC_API_URL?.replace(/\/+$/, "");

type APIResponse<T> = {
  success: boolean;
  message?: string;
  data: T;
};

type FetchOptions = {
  revalidate?: number;
  timeout?: number;
};

async function fetchFromAPI<T>(
  endpoint: string,
  options: FetchOptions = {}
): Promise<T | null> {
  const { revalidate = 60, timeout = 12000 } = options;

  if (!API_URL) {
    console.error("API Error: NEXT_PUBLIC_API_URL is missing");
    return null;
  }

  const controller = new AbortController();

  const timeoutId = setTimeout(() => {
    controller.abort();
  }, timeout);

  try {
    const res = await fetch(`${API_URL}${endpoint}`, {
      next: {
        revalidate,
      },
      headers: {
        Accept: "application/json",
      },
      signal: controller.signal,
    });

    const responseText = await res.text();

    let data: APIResponse<T>;

    try {
      data = JSON.parse(responseText);
    } catch {
      throw new Error(
        `Invalid API response. Status: ${res.status} ${res.statusText}`
      );
    }

    if (!res.ok) {
      throw new Error(
        data?.message ||
          `API request failed with status ${res.status}`
      );
    }

    if (!data.success) {
      throw new Error(data.message || "API request failed");
    }

    return data.data ?? null;
  } catch (error: unknown) {
    if (error instanceof Error && error.name === "AbortError") {
      console.error(
        `API Timeout [${endpoint}]: Request exceeded ${timeout}ms`
      );
    } else {
      console.error(`API Error [${endpoint}]:`, error);
    }

    return null;
  } finally {
    clearTimeout(timeoutId);
  }
}

/* ======================================================
   ARTICLES
====================================================== */

export async function getArticles() {
  return fetchFromAPI<{
    articles: any[];
    total?: number;
  }>("/api/articles", {
    revalidate: 60,
  });
}

export async function getFlashArticles() {
  return fetchFromAPI<any[]>("/api/articles/flash", {
    revalidate: 30,
  });
}

export async function getPresidentPicks() {
  return fetchFromAPI<any[]>("/api/articles/editors-picks", {
    revalidate: 60,
  });
}

export async function getTrendingArticles() {
  return fetchFromAPI<{
    articles: any[];
    total?: number;
  }>("/api/articles?trending=true", {
    revalidate: 60,
  });
}

export async function getFeaturedArticles() {
  return fetchFromAPI<any[]>("/api/articles/featured", {
    revalidate: 60,
  });
}

export async function getArticleById(id: string) {
  return fetchFromAPI<any>(
    `/api/articles/${encodeURIComponent(id)}`,
    {
      revalidate: 60,
    }
  );
}

/* ======================================================
   VIDEOS
====================================================== */

export async function getVideos() {
  return fetchFromAPI<{
    videos: any[];
    total?: number;
  }>("/api/videos", {
    revalidate: 60,
  });
}

export async function getFeaturedVideos() {
  return fetchFromAPI<any[]>("/api/videos/featured", {
    revalidate: 60,
  });
}

export async function getFlashVideos() {
  return fetchFromAPI<any[]>("/api/videos/flash", {
    revalidate: 30,
  });
}

export async function getPresidentPickVideos() {
  return fetchFromAPI<{
    videos: any[];
    total?: number;
  }>("/api/videos?editorsPick=true", {
    revalidate: 60,
  });
}

export async function getTrendingVideos() {
  return fetchFromAPI<{
    videos: any[];
    total?: number;
  }>("/api/videos?trending=true", {
    revalidate: 60,
  });
}

export async function getVideoById(id: string) {
  return fetchFromAPI<any>(
    `/api/videos/${encodeURIComponent(id)}`,
    {
      revalidate: 60,
    }
  );
}

/* ======================================================
   MEMBERS
====================================================== */

export async function getMembers() {
  return fetchFromAPI<{
    members: any[];
    total?: number;
  }>("/api/members", {
    revalidate: 300,
  });
}

export async function getMemberById(id: string) {
  return fetchFromAPI<any>(
    `/api/members/${encodeURIComponent(id)}`,
    {
      revalidate: 300,
    }
  );
}

/* ======================================================
   MENTORS
====================================================== */

export async function getMentors() {
  return fetchFromAPI<{
    mentors: any[];
    total?: number;
  }>("/api/mentors", {
    revalidate: 600,
  });
}

export async function getMentorById(id: string) {
  return fetchFromAPI<any>(
    `/api/mentors/${encodeURIComponent(id)}`,
    {
      revalidate: 600,
    }
  );
}

/* ======================================================
   MEMBER NEWS CHANNELS
====================================================== */

export async function getMemberNewsChannels() {
  return fetchFromAPI<{
    memberNewsChannels: any[];
    total?: number;
  }>("/api/member-news-channels", {
    revalidate: 600,
  });
}

export async function getMemberNewsChannelById(id: string) {
  return fetchFromAPI<any>(
    `/api/member-news-channels/${encodeURIComponent(id)}`,
    {
      revalidate: 600,
    }
  );
}

/* ======================================================
   SRB MEMBERS
====================================================== */

export async function getSrbMembers() {
  return fetchFromAPI<{
    srbMembers: any[];
    total?: number;
  }>("/api/srb-members", {
    revalidate: 600,
  });
}

export async function getSrbMemberById(id: string) {
  return fetchFromAPI<any>(
    `/api/srb-members/${encodeURIComponent(id)}`,
    {
      revalidate: 600,
    }
  );
}

/* ======================================================
   GALLERY
====================================================== */

export async function getGalleryItems() {
  return fetchFromAPI<{
    galleryItems: any[];
    total?: number;
  }>("/api/gallery", {
    revalidate: 120,
  });
}

export async function getGalleryItemById(id: string) {
  return fetchFromAPI<any>(
    `/api/gallery/${encodeURIComponent(id)}`,
    {
      revalidate: 120,
    }
  );
}