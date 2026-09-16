/**
 * Seed script -- populates StudySync with demo subjects + tasks.
 * Usage:  npx tsx scripts/seed.ts <user-email>
 * Example: npx tsx scripts/seed.ts 2024cs_shivamanand_c@nie.ac.in
 */

import mysql from "mysql2/promise";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, "..", ".env.local") });
dotenv.config({ path: path.join(__dirname, "..", ".env") });

const userEmail = process.argv[2];
if (!userEmail) {
  console.error("Please provide a user email as the first argument.");
  console.error("Usage: npx tsx scripts/seed.ts <user-email>");
  process.exit(1);
}

function daysFromNow(days: number, hours = 9): string {
  const d = new Date();
  d.setDate(d.getDate() + days);
  d.setHours(hours, 0, 0, 0);
  return d.toISOString().slice(0, 19).replace("T", " ");
}

const subjects = [
  "Data Structures & Algorithms",
  "Operating Systems",
  "Database Management Systems",
  "Computer Networks",
  "Machine Learning",
];

interface SeedTask {
  subject: string;
  title: string;
  description: string;
  deadlineOffset: number;
  deadlineHour: number;
  category: "Exam" | "Quiz" | "Project" | "Assignment";
  effort: number;
  status: "Pending" | "Done";
}

const tasks: SeedTask[] = [
  {
    subject: "Data Structures & Algorithms",
    title: "Implement AVL Tree",
    description: "Code a self-balancing AVL tree with insert, delete, and rotations. Write unit tests for each operation.",
    deadlineOffset: 2, deadlineHour: 23, category: "Assignment", effort: 3, status: "Pending",
  },
  {
    subject: "Data Structures & Algorithms",
    title: "DSA Mid-Term Exam",
    description: "Covers arrays, linked lists, stacks, queues, trees, graphs, sorting, and searching algorithms.",
    deadlineOffset: 5, deadlineHour: 10, category: "Exam", effort: 5, status: "Pending",
  },
  {
    subject: "Data Structures & Algorithms",
    title: "Graph Traversal Assignment",
    description: "Implement BFS and DFS for both directed and undirected graphs. Include time-complexity analysis.",
    deadlineOffset: -1, deadlineHour: 23, category: "Assignment", effort: 2, status: "Done",
  },
  {
    subject: "Operating Systems",
    title: "Process Scheduling Simulation",
    description: "Build a simulation of Round Robin, FCFS, and SJF scheduling algorithms and compare performance.",
    deadlineOffset: 3, deadlineHour: 23, category: "Project", effort: 4, status: "Pending",
  },
  {
    subject: "Operating Systems",
    title: "OS Quiz - Memory Management",
    description: "Quiz on paging, segmentation, virtual memory, page replacement algorithms (LRU, FIFO, Optimal).",
    deadlineOffset: 5, deadlineHour: 14, category: "Quiz", effort: 2, status: "Pending",
  },
  {
    subject: "Operating Systems",
    title: "Deadlock Detection Report",
    description: "Write a 3-page report on deadlock detection and avoidance strategies including Bankers Algorithm.",
    deadlineOffset: 7, deadlineHour: 23, category: "Assignment", effort: 2, status: "Pending",
  },
  {
    subject: "Database Management Systems",
    title: "ER Diagram for E-Commerce DB",
    description: "Design a complete ER diagram for an e-commerce platform with users, products, orders, and reviews.",
    deadlineOffset: 1, deadlineHour: 23, category: "Assignment", effort: 2, status: "Pending",
  },
  {
    subject: "Database Management Systems",
    title: "SQL Query Optimization Lab",
    description: "Optimize 10 given slow SQL queries using indexes, query rewriting, and EXPLAIN plans.",
    deadlineOffset: 4, deadlineHour: 23, category: "Assignment", effort: 3, status: "Pending",
  },
  {
    subject: "Database Management Systems",
    title: "DBMS End-Semester Exam",
    description: "Covers relational algebra, SQL, normalization (1NF-BCNF), transactions, and concurrency control.",
    deadlineOffset: 10, deadlineHour: 9, category: "Exam", effort: 5, status: "Pending",
  },
  {
    subject: "Computer Networks",
    title: "OSI vs TCP/IP Presentation",
    description: "Prepare a 10-slide presentation comparing the OSI and TCP/IP models with real-world protocol examples.",
    deadlineOffset: 6, deadlineHour: 11, category: "Assignment", effort: 2, status: "Pending",
  },
  {
    subject: "Computer Networks",
    title: "Socket Programming Mini-Project",
    description: "Build a chat application using TCP sockets in Python. Must support multiple clients via threading.",
    deadlineOffset: 8, deadlineHour: 23, category: "Project", effort: 4, status: "Pending",
  },
  {
    subject: "Computer Networks",
    title: "Networks Quiz - Routing Protocols",
    description: "Quiz covering RIP, OSPF, BGP, and distance-vector vs link-state routing.",
    deadlineOffset: 3, deadlineHour: 10, category: "Quiz", effort: 2, status: "Pending",
  },
  {
    subject: "Machine Learning",
    title: "Linear Regression from Scratch",
    description: "Implement linear regression using only NumPy (no sklearn). Train on the Boston Housing dataset.",
    deadlineOffset: 4, deadlineHour: 23, category: "Assignment", effort: 3, status: "Done",
  },
  {
    subject: "Machine Learning",
    title: "ML Project - Image Classifier",
    description: "Train a CNN on CIFAR-10 using PyTorch. Achieve at least 75% test accuracy. Submit code + report.",
    deadlineOffset: 12, deadlineHour: 23, category: "Project", effort: 5, status: "Pending",
  },
  {
    subject: "Machine Learning",
    title: "ML Mid-Term Exam",
    description: "Topics: supervised vs unsupervised, bias-variance tradeoff, gradient descent, decision trees, SVM.",
    deadlineOffset: 5, deadlineHour: 15, category: "Exam", effort: 4, status: "Pending",
  },
];

async function seed() {
  const pool = await mysql.createPool({
    host: process.env.DB_HOST || "localhost",
    port: Number(process.env.DB_PORT) || 3306,
    user: process.env.DB_USER || "root",
    password: process.env.DB_PASSWORD || "",
    database: process.env.DB_NAME || "deadline_db",
  });

  console.log("Connected to MySQL");

  const [userRows]: any = await pool.execute(
    "SELECT user_id FROM users WHERE email = ?",
    [userEmail]
  );

  if (!userRows.length) {
    console.error(`No user found with email "${userEmail}".`);
    console.error("Make sure you have logged in to StudySync at least once.");
    await pool.end();
    process.exit(1);
  }

  const userId: number = userRows[0].user_id;
  console.log(`Found user_id = ${userId} for ${userEmail}`);

  const subjectIdMap: Record<string, number> = {};

  for (const name of subjects) {
    const [existing]: any = await pool.execute(
      "SELECT subject_id FROM subjects WHERE user_id = ? AND subject_name = ?",
      [userId, name]
    );
    if (existing.length > 0) {
      subjectIdMap[name] = existing[0].subject_id;
      console.log(`Subject already exists: "${name}" (id=${existing[0].subject_id})`);
    } else {
      const [res]: any = await pool.execute(
        "INSERT INTO subjects (user_id, subject_name) VALUES (?, ?)",
        [userId, name]
      );
      subjectIdMap[name] = res.insertId;
      console.log(`Created subject: "${name}" (id=${res.insertId})`);
    }
  }

  let created = 0;
  let skipped = 0;

  for (const t of tasks) {
    const subjectId = subjectIdMap[t.subject];
    const deadline = daysFromNow(t.deadlineOffset, t.deadlineHour);

    const [existing]: any = await pool.execute(
      "SELECT id FROM tasks WHERE subject_id = ? AND title = ?",
      [subjectId, t.title]
    );

    if (existing.length > 0) {
      console.log(`Task already exists: "${t.title}"`);
      skipped++;
      continue;
    }

    await pool.execute(
      "INSERT INTO tasks (subject_id, title, description, deadline, category, estimated_effort, status) VALUES (?, ?, ?, ?, ?, ?, ?)",
      [subjectId, t.title, t.description, deadline, t.category, t.effort, t.status]
    );

    console.log(`Task: [${t.category}] "${t.title}" -> ${deadline}`);
    created++;
  }

  console.log(`\nSeed complete! ${created} tasks created, ${skipped} skipped.`);
  await pool.end();
}

seed().catch((err) => {
  console.error("Seed failed:", err.message);
  process.exit(1);
});
