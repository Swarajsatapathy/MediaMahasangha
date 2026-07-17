"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import ArticlesSection from "./components/ArticlesSection";
import VideosSection from "./components/VideosSection";
import MembersSection from "./components/MembersSection";
import MentorsSection from "./components/MentorsSection";
import MemberNewsChannelsSection from "./components/MemberNewsChannelSection";
import SRBMemberSection from "./components/SRBMemberSection";
import GallerySection from "./components/GallerySection";

type Admin = {
  id: string;
  name: string;
  email: string;
};

type ActiveTab =
  | "articles"
  | "videos"
  | "members"
  | "mentors"
  | "member-news-channels"
  | "srb-members"
  | "gallery";

export default function DashboardPage() {
  const router = useRouter();

  const [admin, setAdmin] = useState<Admin | null>(null);
  const [activeTab, setActiveTab] = useState<ActiveTab>("articles");

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
          <button
            className={activeTab === "articles" ? "active" : ""}
            onClick={() => setActiveTab("articles")}
          >
            Articles
          </button>

          <button
            className={activeTab === "videos" ? "active" : ""}
            onClick={() => setActiveTab("videos")}
          >
            Video News
          </button>

          <button
            className={activeTab === "members" ? "active" : ""}
            onClick={() => setActiveTab("members")}
          >
            Members
          </button>

          <button
            className={activeTab === "mentors" ? "active" : ""}
            onClick={() => setActiveTab("mentors")}
          >
            Mentors
          </button>

          <button
            className={activeTab === "member-news-channels" ? "active" : ""}
            onClick={() => setActiveTab("member-news-channels")}
          >
            Member News Channels
          </button>

          <button
            className={activeTab === "srb-members" ? "active" : ""}
            onClick={() => setActiveTab("srb-members")}
          >
            SRB Members
          </button>

          <button
            className={activeTab === "gallery" ? "active" : ""}
            onClick={() => setActiveTab("gallery")}
          >
            Gallery
          </button>
        </nav>

        <div className="section">
          {activeTab === "articles" && <ArticlesSection />}

          {activeTab === "videos" && <VideosSection />}

          {activeTab === "members" && <MembersSection />}

          {activeTab === "mentors" && <MentorsSection />}

          {activeTab === "member-news-channels" && (
            <MemberNewsChannelsSection />
          )}

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
        }

        .right button:hover {
          color: #00d5ff;
          border-color: #00d5ff;
        }

        .content {
          max-width: 1320px;
          margin: 0 auto;
          padding: 28px 24px;
        }

        .tabBar {
          background: #101827;
          border: 1px solid #223047;
          border-radius: 14px;
          padding: 8px;
          display: flex;
          gap: 8px;
          margin-bottom: 24px;
        }

        .tabBar button {
          background: transparent;
          color: #9db4da;
          border: none;
          padding: 12px 22px;
          border-radius: 10px;
          font-size: 15px;
          font-weight: 700;
          cursor: pointer;
        }

        .tabBar button.active {
          background: #00d5ff;
          color: #06111f;
        }

        .tabBar button:hover {
          background: #122236;
          color: #ffffff;
        }

        .tabBar button.active:hover {
          background: #00d5ff;
          color: #06111f;
        }

        .section {
          min-height: 500px;
        }

        .placeholder {
          background: #101827;
          border: 1px solid #223047;
          border-radius: 16px;
          padding: 28px;
        }

        .placeholder h2 {
          margin: 0 0 8px;
          font-size: 22px;
        }

        .placeholder p {
          margin: 0;
          color: #8ea2c4;
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
