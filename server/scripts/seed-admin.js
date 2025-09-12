import "dotenv/config";
import { connectDB } from "../src/lib/db.js";
import { User } from "../src/models/User.js";
import bcrypt from "bcryptjs";

async function main() {
  await connectDB();
  const email = process.argv[2] || "admin@arc.local";
  const name = process.argv[3] || "Admin";
  const password = process.argv[4] || "admin123";
  const hash = await bcrypt.hash(password, 10);
  const existing = await User.findOne({ email });
  if (existing) {
    existing.name = name;
    existing.role = "admin";
    existing.password = hash;
    await existing.save();
    console.log("Updated admin:", email);
  } else {
    await User.create({ name, email, password: hash, role: "admin" });
    console.log("Created admin:", email);
  }
  process.exit(0);
}
main().catch((e) => {
  console.error(e);
  process.exit(1);
});
