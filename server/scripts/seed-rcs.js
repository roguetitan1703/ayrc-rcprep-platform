import "dotenv/config";
import { connectDB } from "../src/lib/db.js";
import { RcPassage } from "../src/models/RcPassage.js";
import { User } from "../src/models/User.js";

function startOfIST(d = new Date()) {
  const utc = d.getTime() + d.getTimezoneOffset() * 60000;
  const ist = new Date(utc + 5.5 * 3600000);
  ist.setHours(0, 0, 0, 0);
  return ist;
}

async function main() {
  await connectDB();
  const admin = await User.findOne({ role: "admin" });
  if (!admin) {
    console.log("No admin user found. Seed admin first.");
    process.exit(1);
  }
  const today = startOfIST();
  const base = {
    passageText:
      "Reading comprehension sample passage. The author argues for careful analysis of assumptions in modern discourse. The text examines implications and presents counterarguments to common positions.",
    source: "ARC Seed",
    topicTags: ["philosophy", "analysis"],
    status: "scheduled",
    scheduledDate: today,
    questions: [
      {
        questionText: "What is the primary aim of the passage?",
        options: [
          { id: "A", text: "To narrate a historical event" },
          { id: "B", text: "To argue for analyzing assumptions" },
          { id: "C", text: "To provide statistical evidence" },
          { id: "D", text: "To entertain with anecdotes" },
        ],
        correctAnswerId: "B",
        explanation: "The passage promotes careful analysis of assumptions.",
      },
      {
        questionText: "Which of the following best describes the tone?",
        options: [
          { id: "A", text: "Satirical" },
          { id: "B", text: "Expository and analytical" },
          { id: "C", text: "Casual and humorous" },
          { id: "D", text: "Nostalgic" },
        ],
        correctAnswerId: "B",
        explanation: "The tone is explanatory and analytical.",
      },
      {
        questionText: "The author would most likely agree that:",
        options: [
          { id: "A", text: "Assumptions rarely affect arguments" },
          { id: "B", text: "Statistics always resolve disputes" },
          { id: "C", text: "Interrogating premises strengthens conclusions" },
          { id: "D", text: "Counterarguments are distractions" },
        ],
        correctAnswerId: "C",
        explanation: "The passage endorses examining premises.",
      },
      {
        questionText: "Which option weakens the passage’s claim the most?",
        options: [
          {
            id: "A",
            text: "Examples where assumptions were explicit and harmless",
          },
          { id: "B", text: "Cases where analysis revealed flaws" },
          { id: "C", text: "Instances confirming the claim" },
          { id: "D", text: "None of the above" },
        ],
        correctAnswerId: "A",
        explanation:
          "Harmless assumptions would weaken the necessity to analyze.",
      },
    ],
  };

  const titles = [
    "RC #1: Assumptions in Discourse",
    "RC #2: Reasoning and Counterarguments",
  ];

  for (const title of titles) {
    let rc = await RcPassage.findOne({ title });
    if (rc) {
      rc.set({ ...base, title, createdBy: admin._id });
      await rc.save();
      console.log("Updated RC:", title);
    } else {
      await RcPassage.create({ ...base, title, createdBy: admin._id });
      console.log("Created RC:", title);
    }
  }

  console.log("Done.");
  process.exit(0);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
