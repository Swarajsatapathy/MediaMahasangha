"use client";

import Link from "next/link";
import { useMemo, useState } from "react";

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
  "Ghumsar",
  "Jagatsinghpur",
  "Jajpur Road",
  "Jajpur Town",
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

  const filteredMembers = useMemo(() => {
    if (committeeFilter === "all") {
      return members;
    }

    if (committeeFilter === "state") {
      return members.filter(
        (member) => member.committeeType === "state",
      );
    }

    if (
      committeeFilter === "district" &&
      selectedDistrict
    ) {
      return members.filter(
        (member) =>
          member.committeeType === "district" &&
          member.committeeDistrict === selectedDistrict,
      );
    }

    return [];
  }, [
    members,
    committeeFilter,
    selectedDistrict,
  ]);

  const handleCommitteeChange = (
    event: React.ChangeEvent<HTMLSelectElement>,
  ) => {
    const selectedValue =
      event.target.value as CommitteeFilter;

    setCommitteeFilter(selectedValue);

    if (selectedValue !== "district") {
      setSelectedDistrict("");
    }
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

  return (
    <>
      <section className="memberFilterSection">
        <div className="memberFilterControls">
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
                onChange={(event) =>
                  setSelectedDistrict(
                    event.target.value,
                  )
                }
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
              : `${filteredMembers.length} ${
                  filteredMembers.length === 1
                    ? "Member"
                    : "Members"
                }`}
          </p>
        </div>
      </section>

      <section className="membersListingGrid">
        {filteredMembers.length > 0 ? (
          filteredMembers.map((member) => (
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
            {committeeFilter === "district" &&
            !selectedDistrict
              ? "Please select a district committee."
              : "No members available in this committee."}
          </p>
        )}
      </section>

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

        .memberFilterField label {
          display: block;
          margin-bottom: 8px;
          color: #26364a;
          font-size: 14px;
          font-weight: 700;
        }

        .memberFilterField select {
          width: 100%;
          min-height: 48px;
          padding: 11px 42px 11px 14px;
          border: 1px solid #ccd5e0;
          border-radius: 9px;
          background: #ffffff;
          color: #182536;
          font-size: 15px;
          outline: none;
          cursor: pointer;
        }

        .memberFilterField select:focus {
          border-color: #1565c0;
          box-shadow: 0 0 0 3px
            rgba(21, 101, 192, 0.12);
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

        @media (max-width: 650px) {
          .memberFilterSection {
            padding: 0 14px;
            margin-bottom: 24px;
          }

          .memberFilterControls {
            display: block;
            padding: 16px;
          }

          .memberFilterField {
            min-width: 0;
            width: 100%;
          }

          .memberFilterField + .memberFilterField {
            margin-top: 16px;
          }

          .selectedMemberGroup h2 {
            font-size: 20px;
          }
        }
      `}</style>
    </>
  );
}