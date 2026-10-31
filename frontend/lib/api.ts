import { cache } from "react";

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
  const { revalidate = 0, timeout = 12000 } = options;

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
    if (
      typeof error === "object" &&
      error !== null &&
      "digest" in error &&
      (error as { digest: string }).digest === "DYNAMIC_SERVER_USAGE"
    ) {
      throw error;
    }

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

export async function getArticles(
  options: {
    page?: number;
    limit?: number;
    all?: boolean;
    published?: boolean;
    search?: string;
  } = {}
) {
  const params = new URLSearchParams();
  if (options.page !== undefined) params.append("page", String(options.page));
  if (options.limit !== undefined) params.append("limit", String(options.limit));
  if (options.all) params.append("all", "true");
  if (options.published !== undefined)
    params.append("published", String(options.published));
  if (options.search) params.append("search", options.search);
  const qs = params.toString();

  return fetchFromAPI<{
    articles: any[];
    total?: number;
    pagination?: {
      total: number;
      page: number;
      limit: number;
      totalPages: number;
    };
  }>(`/api/articles${qs ? `?${qs}` : ""}`, {
    revalidate: 0,
  });
}

export async function getFlashArticles() {
  return fetchFromAPI<any[]>("/api/articles/flash", {
    revalidate: 0,
  });
}

export async function getPresidentPicks() {
  return fetchFromAPI<any[]>("/api/articles/editors-picks", {
    revalidate: 0,
  });
}

export async function getTrendingArticles() {
  return fetchFromAPI<{
    articles: any[];
    total?: number;
  }>("/api/articles?trending=true", {
    revalidate: 0,
  });
}

export async function getFeaturedArticles() {
  return fetchFromAPI<any[]>("/api/articles/featured", {
    revalidate: 0,
  });
}

export const getArticleById = cache(async (id: string) => {
  return fetchFromAPI<any>(
    `/api/articles/${encodeURIComponent(id)}`,
    {
      revalidate: 0,
    }
  );
});

/* ======================================================
   VIDEOS
====================================================== */

export async function getVideos(
  options: {
    page?: number;
    limit?: number;
    all?: boolean;
    published?: boolean;
    search?: string;
  } = {}
) {
  const params = new URLSearchParams();
  if (options.page !== undefined) params.append("page", String(options.page));
  if (options.limit !== undefined) params.append("limit", String(options.limit));
  if (options.all) params.append("all", "true");
  if (options.published !== undefined)
    params.append("published", String(options.published));
  if (options.search) params.append("search", options.search);
  const qs = params.toString();

  return fetchFromAPI<{
    videos: any[];
    total?: number;
    pagination?: {
      total: number;
      page: number;
      limit: number;
      totalPages: number;
    };
  }>(`/api/videos${qs ? `?${qs}` : ""}`, {
    revalidate: 0,
  });
}

export async function getFeaturedVideos() {
  return fetchFromAPI<any[]>("/api/videos/featured", {
    revalidate: 0,
  });
}

export async function getFlashVideos() {
  return fetchFromAPI<any[]>("/api/videos/flash", {
    revalidate: 0,
  });
}

export async function getPresidentPickVideos() {
  return fetchFromAPI<{
    videos: any[];
    total?: number;
  }>("/api/videos?editorsPick=true", {
    revalidate: 0,
  });
}

export async function getTrendingVideos() {
  return fetchFromAPI<{
    videos: any[];
    total?: number;
  }>("/api/videos?trending=true", {
    revalidate: 0,
  });
}

export const getVideoById = cache(async (id: string) => {
  return fetchFromAPI<any>(
    `/api/videos/${encodeURIComponent(id)}`,
    {
      revalidate: 0,
    }
  );
});

/* ======================================================
   MEMBERS
====================================================== */

export async function getMembers() {
  return fetchFromAPI<{
    members: any[];
    total?: number;
  }>("/api/members", {
    revalidate: 0,
  });
}

export const getMemberById = cache(async (id: string) => {
  return fetchFromAPI<any>(
    `/api/members/${encodeURIComponent(id)}`,
    {
      revalidate: 0,
    }
  );
});

/* ======================================================
   MENTORS
====================================================== */

export async function getMentors() {
  return fetchFromAPI<{
    mentors: any[];
    total?: number;
  }>("/api/mentors", {
    revalidate: 0,
  });
}

export const getMentorById = cache(async (id: string) => {
  return fetchFromAPI<any>(
    `/api/mentors/${encodeURIComponent(id)}`,
    {
      revalidate: 0,
    }
  );
});

/* ======================================================
   MEMBER NEWS CHANNELS
====================================================== */

export async function getMemberNewsChannels() {
  return fetchFromAPI<{
    memberNewsChannels: any[];
    total?: number;
  }>("/api/member-news-channels", {
    revalidate: 0,
  });
}

export const getMemberNewsChannelById = cache(async (id: string) => {
  return fetchFromAPI<any>(
    `/api/member-news-channels/${encodeURIComponent(id)}`,
    {
      revalidate: 0,
    }
  );
});

/* ======================================================
   SRB MEMBERS
====================================================== */

export async function getSrbMembers() {
  return fetchFromAPI<{
    srbMembers: any[];
    total?: number;
  }>("/api/srb-members", {
    revalidate: 0,
  });
}

export const getSrbMemberById = cache(async (id: string) => {
  return fetchFromAPI<any>(
    `/api/srb-members/${encodeURIComponent(id)}`,
    {
      revalidate: 0,
    }
  );
});

/* ======================================================
   SUPREME COUNCIL
====================================================== */

export async function getSupremeCouncilMembers() {
  return fetchFromAPI<{
    members: any[];
    total?: number;
  }>("/api/supreme-council", {
    revalidate: 0,
  });
}

export const getSupremeCouncilMemberById = cache(async (id: string) => {
  return fetchFromAPI<any>(
    `/api/supreme-council/${encodeURIComponent(id)}`,
    {
      revalidate: 0,
    }
  );
});

/* ======================================================
   WOMEN CELL
====================================================== */

export async function getWomenCellMembers() {
  return fetchFromAPI<{
    members: any[];
    total?: number;
  }>("/api/women-cell", {
    revalidate: 0,
  });
}

export const getWomenCellMemberById = cache(async (id: string) => {
  return fetchFromAPI<any>(
    `/api/women-cell/${encodeURIComponent(id)}`,
    {
      revalidate: 0,
    }
  );
});

/* ======================================================
   GALLERY
====================================================== */

export async function getGalleryItems() {
  return fetchFromAPI<{
    galleryItems: any[];
    total?: number;
  }>("/api/gallery", {
    revalidate: 0,
  });
}

export const getGalleryItemById = cache(async (id: string) => {
  return fetchFromAPI<any>(
    `/api/gallery/${encodeURIComponent(id)}`,
    {
      revalidate: 0,
    }
  );
});

/* ======================================================
   NOTICES
====================================================== */

export interface Notice {
  _id: string;
  title: string;
  pdf: {
    url: string;
    key: string;
  };
  date: string;
  websiteLink?: string;
  isActive: boolean;
  createdAt?: string;
}

export async function getNotices(options: {
  page?: number;
  limit?: number;
  search?: string;
} = {}) {
  const { page = 1, limit = 10, search = "" } = options;
  const params = new URLSearchParams();
  if (page) params.append("page", String(page));
  if (limit) params.append("limit", String(limit));
  if (search) params.append("search", search);

  const query = params.toString() ? `?${params.toString()}` : "";
  return fetchFromAPI<{
    notices: Notice[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }>(`/api/notices${query}`, {
    revalidate: 0,
  });
}

export const getNoticeById = cache(async (id: string) => {
  return fetchFromAPI<Notice>(
    `/api/notices/${encodeURIComponent(id)}`,
    {
      revalidate: 0,
    }
  );
});

/* ======================================================
   HOMEPAGE CONSOLIDATED DATA
====================================================== */

export interface HomepageData {
  articles: any[];
  flashArticles: any[];
  videos: any[];
  members: any[];
  mentors: any[];
  supremeCouncil: any[];
  womenCell: any[];
  srbMembers: any[];
  memberNewsChannels: any[];
  galleryItems: any[];
  notices: any[];
}

export async function getHomepageData(): Promise<HomepageData | null> {
  const data = await fetchFromAPI<HomepageData>("/api/homepage", {
    revalidate: 60,
    timeout: 15000,
  });

  if (data && Array.isArray(data.members) && data.members.length > 0) {
    return data;
  }

  // Graceful fallback to individual fetchers if /api/homepage is unavailable
  try {
    const [
      articlesRes,
      flashRes,
      videosRes,
      membersRes,
      mentorsRes,
      supremeCouncilRes,
      womenCellRes,
      srbMembersRes,
      memberNewsChannelsRes,
      galleryRes,
      noticesRes,
    ] = await Promise.allSettled([
      getArticles({ limit: 12, published: true }),
      getFlashArticles(),
      getVideos({ limit: 12, published: true }),
      getMembers(),
      getMentors(),
      getSupremeCouncilMembers(),
      getWomenCellMembers(),
      getSrbMembers(),
      getMemberNewsChannels(),
      getGalleryItems(),
      getNotices({ limit: 10 }),
    ]);

    return {
      articles:
        (articlesRes.status === "fulfilled"
          ? articlesRes.value?.articles
          : []) || [],
      flashArticles:
        (flashRes.status === "fulfilled"
          ? Array.isArray(flashRes.value)
            ? flashRes.value
            : (flashRes.value as any)?.flashArticles ||
              (flashRes.value as any)?.articles
          : []) || [],
      videos:
        (videosRes.status === "fulfilled" ? videosRes.value?.videos : []) || [],
      members:
        (membersRes.status === "fulfilled" ? membersRes.value?.members : []) ||
        [],
      mentors:
        (mentorsRes.status === "fulfilled"
          ? Array.isArray(mentorsRes.value)
            ? mentorsRes.value
            : (mentorsRes.value as any)?.mentors
          : []) || [],
      supremeCouncil:
        (supremeCouncilRes.status === "fulfilled"
          ? Array.isArray(supremeCouncilRes.value)
            ? supremeCouncilRes.value
            : (supremeCouncilRes.value as any)?.members
          : []) || [],
      womenCell:
        (womenCellRes.status === "fulfilled"
          ? Array.isArray(womenCellRes.value)
            ? womenCellRes.value
            : (womenCellRes.value as any)?.members
          : []) || [],
      srbMembers:
        (srbMembersRes.status === "fulfilled"
          ? Array.isArray(srbMembersRes.value)
            ? srbMembersRes.value
            : (srbMembersRes.value as any)?.srbMembers
          : []) || [],
      memberNewsChannels:
        (memberNewsChannelsRes.status === "fulfilled"
          ? (memberNewsChannelsRes.value as any)?.memberNewsChannels
          : []) || [],
      galleryItems:
        (galleryRes.status === "fulfilled"
          ? (galleryRes.value as any)?.galleryItems
          : []) || [],
      notices:
        (noticesRes.status === "fulfilled" ? noticesRes.value?.notices : []) ||
        [],
    };
  } catch {
    return null;
  }
}
