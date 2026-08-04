"use client";

import Link from "next/link";
import {
  type ChangeEvent,
  useMemo,
  useState,
} from "react";

const MEMBERS_PER_PAGE = 30;

const DISTRICTS = [
  "Angul",
  "Balangir",
  "Balasore",
  "Bargarh",
  "Bhadrak",
  "Bhubaneswar",
  "Boudh",
  "Cuttack",
  "Deogarh",
  "Dhenkanal",
  "Gajapati",
  "Ganjam",
  "Jagatsinghpur",
  "Jajpur",
  "Jharsuguda",
  "Kalahandi",
  "Kandhamal",
  "Kendrapara",
  "Keonjhar",
  "Khordha",
  "Koraput",
  "Malkangiri",
  "Mayurbhanj",
  "Nabarangpur",
  "Nayagarh",
  "Nuapada",
  "Puri",
  "Rayagada",
  "Rourkela",
  "Sambalpur",
  "Subarnapur",
  "Sundargarh",
];

type CommitteeFilter = "all" | "state" | "district";

type Member = {
  _id: string;
  serialNumber?: number;
  memberId?: string;
  name?: string;
  designation?: string;
  district?: string;
  mobileNumber?: string;

  committeeType?: "state" | "district" | null;
  committeeDistrict?: string;

  photo?: {
    url?: string;
    key?: string;
  };

  isActive?: boolean;
};

type MembersDirectoryProps = {
  members: Member[];
};

export default function MembersDirectory({
  members,
}: MembersDirectoryProps) {
  const [committeeFilter, setCommitteeFilter] =
    useState<CommitteeFilter>("all");

  const [selectedDistrict, setSelectedDistrict] =
    useState("");

  const [searchQuery, setSearchQuery] = useState("");

  const [currentPage, setCurrentPage] = useState(1);

  const filteredMembers = useMemo(() => {
    let committeeMembers: Member[] = [];

    if (committeeFilter === "all") {
      committeeMembers = members;
    } else if (committeeFilter === "state") {
      committeeMembers = members.filter(
        (member) => member.committeeType === "state",
      );
    } else if (
      committeeFilter === "district" &&
      selectedDistrict
    ) {
      committeeMembers = members.filter(
        (member) =>
          member.committeeType === "district" &&
          member.committeeDistrict === selectedDistrict,
      );
    }

    const normalizedSearch = searchQuery
      .trim()
      .toLowerCase();

    if (!normalizedSearch) {
      return committeeMembers;
    }

    return committeeMembers.filter((member) => {
      const name = member.name?.toLowerCase() || "";
      const district =
        member.district?.toLowerCase() || "";
      const designation =
        member.designation?.toLowerCase() || "";

      return (
        name.includes(normalizedSearch) ||
        district.includes(normalizedSearch) ||
        designation.includes(normalizedSearch)
      );
    });
  }, [
    members,
    committeeFilter,
    selectedDistrict,
    searchQuery,
  ]);

  const totalPages = Math.max(
    1,
    Math.ceil(
      filteredMembers.length / MEMBERS_PER_PAGE,
    ),
  );

  const safeCurrentPage = Math.min(
    currentPage,
    totalPages,
  );

  const paginatedMembers = useMemo(() => {
    const startIndex =
      (safeCurrentPage - 1) * MEMBERS_PER_PAGE;

    const endIndex = startIndex + MEMBERS_PER_PAGE;

    return filteredMembers.slice(startIndex, endIndex);
  }, [filteredMembers, safeCurrentPage]);

  const startMemberNumber =
    filteredMembers.length > 0
      ? (safeCurrentPage - 1) * MEMBERS_PER_PAGE + 1
      : 0;

  const endMemberNumber = Math.min(
    safeCurrentPage * MEMBERS_PER_PAGE,
    filteredMembers.length,
  );

  const handleCommitteeChange = (
    event: ChangeEvent<HTMLSelectElement>,
  ) => {
    const selectedValue =
      event.target.value as CommitteeFilter;

    setCommitteeFilter(selectedValue);
    setCurrentPage(1);

    if (selectedValue !== "district") {
      setSelectedDistrict("");
    }
  };

  const handleDistrictChange = (
    event: ChangeEvent<HTMLSelectElement>,
  ) => {
    setSelectedDistrict(event.target.value);
    setCurrentPage(1);
  };

  const handleSearchChange = (
    event: ChangeEvent<HTMLInputElement>,
  ) => {
    setSearchQuery(event.target.value);
    setCurrentPage(1);
  };

  const clearSearch = () => {
    setSearchQuery("");
    setCurrentPage(1);
  };

  const changePage = (page: number) => {
    if (page < 1 || page > totalPages) {
      return;
    }

    setCurrentPage(page);

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  const getSelectedTitle = () => {
    if (committeeFilter === "state") {
      return "State Committee";
    }

    if (
      committeeFilter === "district" &&
      selectedDistrict
    ) {
      return `${selectedDistrict} District Committee`;
    }

    if (committeeFilter === "district") {
      return "District Committee";
    }

    return "All Members";
  };

  const getEmptyMessage = () => {
    if (
      committeeFilter === "district" &&
      !selectedDistrict
    ) {
      return "Please select a district committee.";
    }

    if (searchQuery.trim()) {
      return `No member found for "${searchQuery.trim()}".`;
    }

    return "No members available in this committee.";
  };

  return (
    <>
      <section className="memberFilterSection">
        <div className="memberFilterControls">
          <div className="memberFilterField memberSearchField">
            <label htmlFor="memberSearch">
              Search Members
            </label>

            <div className="memberSearchInputWrapper">
              <span
                className="memberSearchIcon"
                aria-hidden="true"
              >
                🔍
              </span>

              <input
                id="memberSearch"
                type="search"
                value={searchQuery}
                onChange={handleSearchChange}
                placeholder="Search by name, district or designation"
                autoComplete="off"
              />

              {searchQuery && (
                <button
                  type="button"
                  className="clearSearchButton"
                  onClick={clearSearch}
                  aria-label="Clear member search"
                >
                  ×
                </button>
              )}
            </div>
          </div>

          <div className="memberFilterField">
            <label htmlFor="committeeFilter">
              View Members
            </label>

            <select
              id="committeeFilter"
              value={committeeFilter}
              onChange={handleCommitteeChange}
            >
              <option value="all">
                All Members
              </option>

              <option value="state">
                State Committee
              </option>

              <option value="district">
                District Committee
              </option>
            </select>
          </div>

          {committeeFilter === "district" && (
            <div className="memberFilterField">
              <label htmlFor="districtFilter">
                Select District Committee
              </label>

              <select
                id="districtFilter"
                value={selectedDistrict}
                onChange={handleDistrictChange}
              >
                <option value="">
                  Select District Committee
                </option>

                {DISTRICTS.map((district) => (
                  <option
                    key={district}
                    value={district}
                  >
                    {district} District Committee
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>

        <div className="selectedMemberGroup">
          <h2>{getSelectedTitle()}</h2>

          <p>
            {committeeFilter === "district" &&
            !selectedDistrict
              ? "Select a district committee to view its members."
              : filteredMembers.length > 0
                ? `Showing ${startMemberNumber}–${endMemberNumber} of ${filteredMembers.length} ${
                    filteredMembers.length === 1
                      ? "member"
                      : "members"
                  }`
                : "0 members"}
          </p>
        </div>
      </section>

      <section className="membersListingGrid">
        {paginatedMembers.length > 0 ? (
          paginatedMembers.map((member) => (
            <Link
              href={`/members/${member._id}`}
              className="memberListingCard"
              key={member._id}
            >
              <div className="memberListingPhoto">
                {member.photo?.url ? (
                  <img
                    src={member.photo.url}
                    alt={member.name || "ODMM Member"}
                    loading="lazy"
                    decoding="async"
                  />
                ) : (
                  <span>
                    {member.name?.charAt(0) || "M"}
                  </span>
                )}
              </div>

              <div className="memberListingInfo">
                <p className="memberListingId">
                  ID: {member.memberId}
                </p>

                <h2>{member.name}</h2>

                <p>{member.designation}</p>

                <span>{member.district}</span>

                {member.mobileNumber && (
                  <p className="memberListingPhone">
                    📞 {member.mobileNumber}
                  </p>
                )}
              </div>
            </Link>
          ))
        ) : (
          <p className="emptyListing">
            {getEmptyMessage()}
          </p>
        )}
      </section>

      {filteredMembers.length > MEMBERS_PER_PAGE && (
        <nav
          className="memberPagination"
          aria-label="Members pagination"
        >
          <button
            type="button"
            onClick={() =>
              changePage(safeCurrentPage - 1)
            }
            disabled={safeCurrentPage === 1}
          >
            Previous
          </button>

          <div className="paginationStatus">
            Page{" "}
            <strong>{safeCurrentPage}</strong> of{" "}
            <strong>{totalPages}</strong>
          </div>

          <button
            type="button"
            onClick={() =>
              changePage(safeCurrentPage + 1)
            }
            disabled={safeCurrentPage === totalPages}
          >
            Next
          </button>
        </nav>
      )}

      <style jsx>{`
        .memberFilterSection {
          max-width: 1200px;
          margin: 0 auto 30px;
          padding: 0 20px;
        }

        .memberFilterControls {
          display: flex;
          align-items: flex-end;
          gap: 18px;
          flex-wrap: wrap;
          padding: 20px;
          background: #ffffff;
          border: 1px solid #e3e8ef;
          border-radius: 14px;
          box-shadow: 0 5px 20px
            rgba(15, 23, 42, 0.06);
        }

        .memberFilterField {
          flex: 1;
          min-width: 250px;
        }

        .memberSearchField {
          flex-basis: 100%;
          min-width: 100%;
        }

        .memberFilterField label {
          display: block;
          margin-bottom: 8px;
          color: #26364a;
          font-size: 14px;
          font-weight: 700;
        }

        .memberFilterField select,
        .memberFilterField input {
          width: 100%;
          min-height: 48px;
          border: 1px solid #ccd5e0;
          border-radius: 9px;
          background: #ffffff;
          color: #182536;
          font-size: 15px;
          outline: none;
        }

        .memberFilterField select {
          padding: 11px 42px 11px 14px;
          cursor: pointer;
        }

        .memberFilterField select:focus,
        .memberFilterField input:focus {
          border-color: #1565c0;
          box-shadow: 0 0 0 3px
            rgba(21, 101, 192, 0.12);
        }

        .memberSearchInputWrapper {
          position: relative;
        }

        .memberSearchInputWrapper input {
          padding: 11px 48px 11px 45px;
        }

        .memberSearchInputWrapper
          input::-webkit-search-cancel-button {
          display: none;
        }

        .memberSearchIcon {
          position: absolute;
          top: 50%;
          left: 15px;
          z-index: 1;
          transform: translateY(-50%);
          font-size: 16px;
          pointer-events: none;
        }

        .clearSearchButton {
          position: absolute;
          top: 50%;
          right: 12px;
          width: 30px;
          height: 30px;
          padding: 0;
          transform: translateY(-50%);
          border: none;
          border-radius: 50%;
          background: #edf2f7;
          color: #415268;
          font-size: 22px;
          line-height: 1;
          cursor: pointer;
        }

        .clearSearchButton:hover {
          background: #dfe7f0;
          color: #172536;
        }

        .selectedMemberGroup {
          margin-top: 18px;
          text-align: center;
        }

        .selectedMemberGroup h2 {
          margin: 0;
          color: #142337;
          font-size: 24px;
          font-weight: 800;
        }

        .selectedMemberGroup p {
          margin: 6px 0 0;
          color: #68778a;
          font-size: 14px;
        }

        .memberPagination {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 18px;
          max-width: 1200px;
          margin: 35px auto 10px;
          padding: 0 20px;
        }

        .memberPagination button {
          min-width: 110px;
          min-height: 44px;
          padding: 10px 18px;
          border: 1px solid #1565c0;
          border-radius: 9px;
          background: #1565c0;
          color: #ffffff;
          font-size: 14px;
          font-weight: 700;
          cursor: pointer;
          transition:
            background 0.2s ease,
            border-color 0.2s ease,
            transform 0.2s ease;
        }

        .memberPagination button:hover:not(:disabled) {
          background: #0d4f9c;
          border-color: #0d4f9c;
          transform: translateY(-1px);
        }

        .memberPagination button:disabled {
          border-color: #ccd5e0;
          background: #e8edf3;
          color: #8a97a7;
          cursor: not-allowed;
        }

        .paginationStatus {
          min-width: 120px;
          color: #526174;
          font-size: 14px;
          text-align: center;
        }

        .paginationStatus strong {
          color: #172536;
        }

        @media (max-width: 650px) {
          .memberFilterSection {
            padding: 0 14px;
            margin-bottom: 24px;
          }

          .memberFilterControls {
            display: block;
            padding: 16px;
          }

          .memberFilterField,
          .memberSearchField {
            min-width: 0;
            width: 100%;
          }

          .memberFilterField + .memberFilterField {
            margin-top: 16px;
          }

          .memberSearchInputWrapper input {
            padding-left: 42px;
            font-size: 14px;
          }

          .selectedMemberGroup h2 {
            font-size: 20px;
          }

          .memberPagination {
            gap: 10px;
            margin-top: 28px;
            padding: 0 14px;
          }

          .memberPagination button {
            min-width: 85px;
            padding: 9px 12px;
            font-size: 13px;
          }

          .paginationStatus {
            min-width: auto;
            font-size: 13px;
          }
        }
      `}</style>
    </>
  );
}