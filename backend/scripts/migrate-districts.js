import dotenv from "dotenv";
dotenv.config({ path: "./.env" });

import { connectDB } from "../src/config/db.js";
import { DISTRICT_MAP } from "../src/constants/districts.js";

async function runMigration() {
  try {
    const conn = await connectDB();
    console.log("Connected to MongoDB for district migration...");

    const collections = [
      { name: "members", fields: ["district", "committeeDistrict"] },
      { name: "membershipapplications", fields: ["district"] },
      { name: "articles", fields: ["district"] },
      { name: "videos", fields: ["district"] },
      { name: "srbmembers", fields: ["district"] },
      { name: "membernewschannels", fields: ["district"] },
      { name: "galleries", fields: ["district"] },
    ];

    let totalUpdated = 0;

    for (const colInfo of collections) {
      const col = conn.connection.db.collection(colInfo.name);
      for (const field of colInfo.fields) {
        for (const [oldVal, newVal] of Object.entries(DISTRICT_MAP)) {
          const query = { [field]: oldVal };
          const count = await col.countDocuments(query);
          if (count > 0) {
            const res = await col.updateMany(query, {
              $set: { [field]: newVal },
            });
            console.log(
              `Updated ${colInfo.name}.${field}: "${oldVal}" -> "${newVal}" (${res.modifiedCount} documents)`
            );
            totalUpdated += res.modifiedCount;
          }
        }
      }
    }

    console.log(`\nMigration complete! Total fields updated: ${totalUpdated}`);

    console.log("\nVerifying updated collections for Subarnapur/Sonpur:");
    for (const colInfo of collections) {
      const col = conn.connection.db.collection(colInfo.name);
      const dists = await col.distinct("district");
      if (dists.includes("Subarnapur") || dists.includes("Sonpur")) {
        console.log(`  ${colInfo.name}.district contains:`, dists.filter(d => d === "Subarnapur" || d === "Sonpur"));
      }
      if (colInfo.fields.includes("committeeDistrict")) {
        const commDists = await col.distinct("committeeDistrict");
        if (commDists.includes("Subarnapur") || commDists.includes("Sonpur")) {
          console.log(`  ${colInfo.name}.committeeDistrict contains:`, commDists.filter(d => d === "Subarnapur" || d === "Sonpur"));
        }
      }
    }

    process.exit(0);
  } catch (error) {
    console.error("Migration failed:", error);
    process.exit(1);
  }
}

runMigration();
