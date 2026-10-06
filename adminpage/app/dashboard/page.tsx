"use client";

import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import ArticlesSection from "./components/ArticlesSection";
import VideosSection from "./components/VideosSection";
import MembersSection from "./components/MembersSection";
import MentorsSection from "./components/MentorsSection";
import SupremeCouncilSection from "./components/SupremeCouncilSection";
import WomenCellSection from "./components/WomenCellSection";
import MemberNewsChannelsSection from "./components/MemberNewsChannelSection";
import SRBMemberSection from "./components/SRBMemberSection";
import GallerySection from "./components/GallerySection";
import MembershipApplicationsSection from "./components/MembershipApplicationsSection";

type Admin = {
  id: string;
  name: string;
  email: string;
};

type ActiveTab =
  | "articles"
  | "videos"
  | "members"
  | "membership-applications"
  | "mentors"
  | "supreme-council"
  | "women-cell"
  | "member-news-channels"
  | "srb-members"
  | "gallery";

type TabConfig = {
  id: ActiveTab;
  label: string;
  icon: React.ReactNode;
};

const TABS: TabConfig[] = [
  {
    id: "articles",
    label: "Articles",
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M4 22h16a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2H8a2 2 0 0 0-2 2v16a2 2 0 0 1-2 2Zm0 0a2 2 0 0 1-2-2v-9c0-1.1.9-2 2-2h2" />
        <path d="M18 14h-8" />
        <path d="M15 18h-5" />
        <path d="M10 6h8v4h-8V6Z" />
      </svg>
    ),
  },
  {
    id: "videos",
    label: "Video News",
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polygon points="23 7 16 12 23 17 23 7" />
        <rect x="1" y="5" width="15" height="14" rx="2" ry="2" />
      </svg>
    ),
  },
  {
    id: "members",
    label: "Members",
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
        <path d="M16 3.13a4 4 0 0 1 0 7.75" />
      </svg>
    ),
  },
  {
    id: "membership-applications",
    label: "Applications",
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" />
        <rect x="8" y="2" width="8" height="4" rx="1" ry="1" />
        <path d="M9 14h6" />
        <path d="M9 18h6" />
        <path d="M9 10h6" />
      </svg>
    ),
  },
  {
    id: "mentors",
    label: "Mentors",
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M22 10v6M2 10l10-5 10 5-10 5z" />
        <path d="M6 12v5c3 3 9 3 12 0v-5" />
      </svg>
    ),
  },
  {
    id: "supreme-council",
    label: "Supreme Council",
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
      </svg>
    ),
  },
  {
    id: "women-cell",
    label: "Women Cell",
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="8" r="5" />
        <path d="M12 13v8" />
        <path d="M9 18h6" />
      </svg>
    ),
  },
  {
    id: "member-news-channels",
    label: "News Channels",
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="7" width="20" height="15" rx="2" ry="2" />
        <polyline points="17 2 12 7 7 2" />
      </svg>
    ),
  },
  {
    id: "srb-members",
    label: "SRB Members",
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
      </svg>
    ),
  },
  {
    id: "gallery",
    label: "Gallery",
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
        <circle cx="8.5" cy="8.5" r="1.5" />
        <polyline points="21 15 16 10 5 21" />
      </svg>
    ),
  },
];

function DashboardContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [admin, setAdmin] = useState<Admin | null>(null);
  const initialTab = (searchParams.get("tab") as ActiveTab) || "articles";
  const [activeTab, setActiveTab] = useState<ActiveTab>(initialTab);

  useEffect(() => {
    const token = localStorage.getItem("odmm_admin_token");
    const adminData = localStorage.getItem("odmm_admin");

    if (!token) {
      router.push("/login");
      return;
    }

    if (adminData) {
      setAdmin(JSON.parse(adminData));
    }
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem("odmm_admin_token");
    localStorage.removeItem("odmm_admin");
    router.push("/login");
  };

  return (
    <main className="dashboard">
      <header className="header">
        <div className="brand">
          <div className="logo" aria-label="ODMM logo">
            <svg
              width="23"
              height="23"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M7 3H17C18.1046 3 19 3.89543 19 5V19C19 20.1046 18.1046 21 17 21H7C5.89543 21 5 20.1046 5 19V5C5 3.89543 5.89543 3 7 3Z"
                stroke="currentColor"
                strokeWidth="2"
              />
              <path
                d="M9 8H15"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
              />
              <path
                d="M9 12H15"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
              />
              <path
                d="M9 16H13"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
              />
            </svg>
          </div>
          <div>
            <h1>ODMM</h1>
            <p>Admin Dashboard</p>
          </div>
        </div>

        <div className="right">
          <span>{admin?.name || "Admin"}</span>
          <button onClick={handleLogout}>Logout</button>
        </div>
      </header>

      <section className="content">
        <nav className="tabBar">
          {TABS.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                className={`tabBtn ${isActive ? "active" : ""}`}
                onClick={() => setActiveTab(tab.id)}
                type="button"
              >
                <span className="tabIcon">{tab.icon}</span>
                <span className="tabText">{tab.label}</span>
              </button>
            );
          })}
        </nav>

        <div className="section">
          {activeTab === "articles" && <ArticlesSection />}
          {activeTab === "videos" && <VideosSection />}
          {activeTab === "members" && <MembersSection />}
          {activeTab === "membership-applications" && <MembershipApplicationsSection />}
          {activeTab === "mentors" && <MentorsSection />}
          {activeTab === "supreme-council" && <SupremeCouncilSection />}
          {activeTab === "women-cell" && <WomenCellSection />}
          {activeTab === "member-news-channels" && <MemberNewsChannelsSection />}
          {activeTab === "srb-members" && <SRBMemberSection />}
          {activeTab === "gallery" && <GallerySection />}
        </div>
      </section>

      <style jsx>{`
        .dashboard {
          min-height: 100vh;
          background: #070d18;
          color: #ffffff;
        }

        .header {
          height: 76px;
          background: #101827;
          border-bottom: 1px solid #223047;
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0 42px;
        }

        .brand {
          display: flex;
          align-items: center;
          gap: 14px;
        }

        .logo {
          width: 42px;
          height: 42px;
          border-radius: 10px;
          background: #00d5ff;
          color: #06111f;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 0 18px rgba(0, 213, 255, 0.25);
        }

        .brand h1 {
          margin: 0;
          font-size: 20px;
          font-weight: 800;
        }

        .brand p {
          margin: 4px 0 0;
          color: #8ea2c4;
          font-size: 13px;
        }

        .right {
          display: flex;
          align-items: center;
          gap: 16px;
          color: #8ea2c4;
          font-size: 14px;
        }

        .right button {
          background: transparent;
          border: 1px solid #2a3a58;
          color: #8ea2c4;
          padding: 9px 15px;
          border-radius: 9px;
          cursor: pointer;
          font-weight: 600;
          transition: all 0.2s ease;
        }

        .right button:hover {
          color: #00d5ff;
          border-color: #00d5ff;
        }

        .content {
          max-width: 1360px;
          margin: 0 auto;
          padding: 28px 24px;
        }

        .tabBar {
          background: #101827;
          border: 1px solid #223047;
          border-radius: 14px;
          padding: 6px;
          display: flex;
          gap: 6px;
          margin-bottom: 24px;
          overflow-x: auto;
          scrollbar-width: thin;
          scrollbar-color: rgba(0, 213, 255, 0.25) transparent;
        }

        .tabBar::-webkit-scrollbar {
          height: 4px;
        }

        .tabBar::-webkit-scrollbar-track {
          background: transparent;
        }

        .tabBar::-webkit-scrollbar-thumb {
          background: rgba(0, 213, 255, 0.25);
          border-radius: 4px;
        }

        .tabBtn {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          background: transparent;
          color: #8ea2c4;
          border: 1px solid transparent;
          padding: 11px 18px;
          border-radius: 10px;
          font-size: 14px;
          font-weight: 700;
          cursor: pointer;
          flex-shrink: 0;
          white-space: nowrap;
          transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .tabIcon {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          opacity: 0.75;
          transition: opacity 0.2s ease, transform 0.2s ease;
        }

        .tabBtn:hover {
          background: rgba(255, 255, 255, 0.04);
          color: #ffffff;
          border-color: rgba(42, 58, 88, 0.5);
        }

        .tabBtn:hover .tabIcon {
          opacity: 1;
          color: #00d5ff;
          transform: scale(1.1);
        }

        .tabBtn.active {
          background: linear-gradient(135deg, #00d5ff 0%, #009acc 100%);
          color: #06111f;
          border-color: rgba(0, 213, 255, 0.6);
          box-shadow: 0 2px 14px rgba(0, 213, 255, 0.35);
        }

        .tabBtn.active .tabIcon {
          opacity: 1;
          color: #06111f;
        }

        .tabBtn.active:hover {
          background: linear-gradient(135deg, #00e1ff 0%, #00a8e0 100%);
          color: #06111f;
        }

        .section {
          min-height: 500px;
        }

        @media (max-width: 700px) {
          .header {
            padding: 0 20px;
          }

          .right span {
            display: none;
          }

          .tabBar {
            overflow-x: auto;
          }
        }
      `}</style>
    </main>
  );
}

export default function DashboardPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <DashboardContent />
    </Suspense>
  );
}

