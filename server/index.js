// server/index.ts
import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import path2 from "path";
import fs2 from "fs";
import { createServer as createViteServer } from "vite";

// server/db.ts
import fs from "fs";
import path from "path";
var DATA_DIR = path.resolve(process.cwd(), "data");
var DB_FILE = path.join(DATA_DIR, "capacity_connect_db.json");
var INITIAL_SETTINGS = {
  superAdminEmail: process.env.SUPER_ADMIN_EMAIL || "venkatajaswanthsambangi@gmail.com",
  organizationName: "CAPACITY CONNECT Enterprise",
  defaultUserRole: "learner",
  allowSelfRegistration: true,
  aiModel: "gemini-3.5-flash",
  auditRetentionDays: 90,
  enforceRbacStrict: true,
  supportContactEmail: "support@capacityconnect.org",
  maintenanceMode: false,
  aiAssistantEnabled: true
};
var INITIAL_ROLES = [
  {
    role: "super_admin",
    displayName: "Super Admin",
    description: "Complete application administration privileges, configuration, and security control.",
    permissions: [
      "users.manage",
      "users.roles.assign",
      "settings.manage",
      "audit.view",
      "reports.view",
      "courses.manage",
      "trainings.manage",
      "resources.manage",
      "assessments.manage",
      "competencies.manage",
      "notifications.broadcast",
      "ai.access"
    ]
  },
  {
    role: "admin",
    displayName: "Admin",
    description: "Operational management across courses, cohorts, trainers, and institutional reporting.",
    permissions: [
      "users.read",
      "reports.view",
      "courses.manage",
      "trainings.manage",
      "resources.manage",
      "assessments.manage",
      "competencies.manage",
      "notifications.send",
      "ai.access"
    ]
  },
  {
    role: "trainer",
    displayName: "Trainer",
    description: "Delivers courses, manages cohorts, reviews submissions, validates competencies.",
    permissions: [
      "courses.read",
      "courses.edit_assigned",
      "trainings.conduct",
      "assessments.grade",
      "competencies.validate",
      "resources.create",
      "notifications.cohort",
      "ai.access"
    ]
  },
  {
    role: "learner",
    displayName: "Learner",
    description: "Accesses learning pathways, submits assessments, tracks progress and competencies.",
    permissions: [
      "courses.enroll",
      "courses.learn",
      "assessments.submit",
      "progress.view_own",
      "resources.view",
      "ai.learning_assistant"
    ]
  }
];
var INITIAL_USERS = [
  {
    id: "usr_superadmin",
    email: "venkatajaswanthsambangi@gmail.com",
    name: "Venkata Jaswanth Sambangi",
    role: "super_admin",
    department: "Enterprise Strategy & Governance",
    title: "Chief Capacity Architect & Super Admin",
    bio: "Configured Super Administrator with absolute access control and system governance.",
    avatarUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200",
    createdAt: new Date(Date.now() - 30 * 864e5).toISOString(),
    updatedAt: (/* @__PURE__ */ new Date()).toISOString(),
    isActive: true
  },
  {
    id: "usr_admin",
    email: "admin@capacityconnect.org",
    name: "Elena Rostova",
    role: "admin",
    department: "Capacity Operations",
    title: "Director of Learning Programs",
    bio: "Oversees enterprise curriculum, trainer allocations, and organizational KPI tracking.",
    avatarUrl: "https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&q=80&w=200",
    createdAt: new Date(Date.now() - 25 * 864e5).toISOString(),
    updatedAt: (/* @__PURE__ */ new Date()).toISOString(),
    isActive: true
  },
  {
    id: "usr_trainer",
    email: "trainer@capacityconnect.org",
    name: "Dr. Marcus Vance",
    role: "trainer",
    department: "Cloud & AI Academy",
    title: "Principal Technical Trainer",
    bio: "Specialist in distributed cloud architectures, generative AI systems, and microservices.",
    avatarUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=200",
    createdAt: new Date(Date.now() - 20 * 864e5).toISOString(),
    updatedAt: (/* @__PURE__ */ new Date()).toISOString(),
    isActive: true
  },
  {
    id: "usr_learner",
    email: "learner@capacityconnect.org",
    name: "Aria Chen",
    role: "learner",
    department: "Digital Transformation Cohort",
    title: "Senior Systems Analyst",
    bio: "Upskilling in enterprise architecture, DevOps resilience, and AI integration pipelines.",
    avatarUrl: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=200",
    createdAt: new Date(Date.now() - 15 * 864e5).toISOString(),
    updatedAt: (/* @__PURE__ */ new Date()).toISOString(),
    isActive: true
  }
];
var INITIAL_COURSES = [
  {
    id: "crs_cloud_arch",
    title: "Enterprise Cloud Architecture & Distributed Systems",
    code: "CAP-ARC-401",
    description: "Master large-scale enterprise cloud patterns, reliability engineering, failover strategies, and microservice orchestration.",
    category: "Cloud Engineering",
    level: "Advanced",
    durationHours: 36,
    instructorId: "usr_trainer",
    instructorName: "Dr. Marcus Vance",
    thumbnailUrl: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&q=80&w=600",
    competencyIds: ["comp_cloud", "comp_security"],
    isPublished: true,
    enrolledCount: 48,
    rating: 4.9,
    createdAt: new Date(Date.now() - 20 * 864e5).toISOString(),
    updatedAt: (/* @__PURE__ */ new Date()).toISOString(),
    modules: [
      {
        id: "mod_1",
        title: "Core Architecture Pillars & High Availability",
        description: "Multi-region failover, load balancing algorithms, and resilience engineering.",
        order: 1,
        lessons: [
          {
            id: "les_101",
            title: "Foundations of Modern Distributed Topologies",
            description: "Deconstructing monoliths into bounded context microservices.",
            durationMinutes: 45,
            content: "In distributed systems design, data boundaries determine scalability bottlenecks. We explore CAP theorem trade-offs, consensus algorithms (Raft, Paxos), and zero-trust perimeter segmentation.",
            order: 1
          },
          {
            id: "les_102",
            title: "Resilience Patterns: Circuit Breakers & Retries",
            description: "Implementing fault tolerance using token bucket and exponential backoff.",
            durationMinutes: 60,
            content: "Prevent cascading failures across upstream dependencies using circuit breakers and bulkhead isolations.",
            order: 2
          }
        ]
      },
      {
        id: "mod_2",
        title: "Enterprise Event-Driven Architecture",
        description: "Kafka, event sourcing, CQRS patterns, and asynchronous messaging pipelines.",
        order: 2,
        lessons: [
          {
            id: "les_201",
            title: "Kafka Stream Processing & Schema Registry",
            description: "Topic partitioning, consumer groups, and Avro serialization.",
            durationMinutes: 50,
            content: "Event-driven backbone architecture handles million-scale mutations with sub-millisecond dispatch.",
            order: 1
          }
        ]
      }
    ]
  },
  {
    id: "crs_ai_eng",
    title: "Enterprise AI Strategy, LLMOps & Gemini Integration",
    code: "CAP-AI-502",
    description: "Design and deploy production-grade generative AI workflows, guardrails, retrieval-augmented generation (RAG), and evaluation pipelines.",
    category: "Artificial Intelligence",
    level: "Advanced",
    durationHours: 42,
    instructorId: "usr_trainer",
    instructorName: "Dr. Marcus Vance",
    thumbnailUrl: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&q=80&w=600",
    competencyIds: ["comp_ai", "comp_governance"],
    isPublished: true,
    enrolledCount: 64,
    rating: 4.95,
    createdAt: new Date(Date.now() - 18 * 864e5).toISOString(),
    updatedAt: (/* @__PURE__ */ new Date()).toISOString(),
    modules: [
      {
        id: "mod_ai_1",
        title: "Secure LLM Integration & Enterprise Guardrails",
        description: "Sanitizing prompts, context isolation, PII masking, and output verification.",
        order: 1,
        lessons: [
          {
            id: "les_ai_101",
            title: "Architecture of Secure AI Middlewares",
            description: "Preventing prompt injection and unauthorized administrative escalation.",
            durationMinutes: 55,
            content: "LLMs in enterprise software must never receive direct database execution tokens or system management credentials. All operations require deterministic mediation layers.",
            order: 1
          }
        ]
      }
    ]
  },
  {
    id: "crs_cyber_gov",
    title: "Enterprise Cybersecurity Governance & Zero-Trust Access",
    code: "CAP-SEC-303",
    description: "Institutional security compliance, cryptographic attestation, role-based access control (RBAC), and continuous audit logging.",
    category: "Security & Compliance",
    level: "Intermediate",
    durationHours: 30,
    instructorId: "usr_trainer",
    instructorName: "Dr. Marcus Vance",
    thumbnailUrl: "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&q=80&w=600",
    competencyIds: ["comp_security", "comp_governance"],
    isPublished: true,
    enrolledCount: 52,
    rating: 4.85,
    createdAt: new Date(Date.now() - 14 * 864e5).toISOString(),
    updatedAt: (/* @__PURE__ */ new Date()).toISOString(),
    modules: [
      {
        id: "mod_sec_1",
        title: "Role-Based Authorization & Immutable Auditing",
        description: "Enforcing least-privilege policies across distributed multi-tenant systems.",
        order: 1,
        lessons: [
          {
            id: "les_sec_101",
            title: "RBAC vs ABAC & Token Introspection",
            description: "Claims validation, cryptographically signed tokens, and session revocations.",
            durationMinutes: 40,
            content: "Role matrices require strict boundaries between administrative, instructional, and learner personas.",
            order: 1
          }
        ]
      }
    ]
  }
];
var INITIAL_TRAININGS = [
  {
    id: "tr_q3_cohort_alpha",
    title: "Cloud Leadership Cohort Alpha - Fall 2026",
    courseId: "crs_cloud_arch",
    courseTitle: "Enterprise Cloud Architecture & Distributed Systems",
    trainerId: "usr_trainer",
    trainerName: "Dr. Marcus Vance",
    startDate: "2026-09-01",
    endDate: "2026-10-30",
    meetingSchedule: "Tuesdays & Thursdays, 16:00 - 18:00 UTC",
    location: "Virtual Live Labs & Sydney Innovation Hub",
    capacity: 30,
    enrolledLearnerIds: ["usr_learner"],
    status: "Active",
    createdAt: new Date(Date.now() - 14 * 864e5).toISOString()
  },
  {
    id: "tr_q3_ai_bootcamp",
    title: "Generative AI & LLMOps Accelerator",
    courseId: "crs_ai_eng",
    courseTitle: "Enterprise AI Strategy, LLMOps & Gemini Integration",
    trainerId: "usr_trainer",
    trainerName: "Dr. Marcus Vance",
    startDate: "2026-09-15",
    endDate: "2026-11-15",
    meetingSchedule: "Mondays & Wednesdays, 14:00 - 16:30 UTC",
    location: "Virtual Immersive Studio",
    capacity: 25,
    enrolledLearnerIds: ["usr_learner"],
    status: "Active",
    createdAt: new Date(Date.now() - 10 * 864e5).toISOString()
  }
];
var INITIAL_RESOURCES = [
  {
    id: "res_01",
    title: "Enterprise Cloud Topology Blueprint 2026",
    category: "Documentation",
    description: "Full architectural diagram covering multi-region high availability, API gateways, and microservice meshes.",
    url: "https://cloud.google.com/architecture",
    fileSize: "4.8 MB PDF",
    tags: ["Cloud", "Architecture", "Reliability"],
    authorName: "Dr. Marcus Vance",
    downloadCount: 238,
    createdAt: new Date(Date.now() - 22 * 864e5).toISOString()
  },
  {
    id: "res_02",
    title: "Secure LLM Orchestration & Prompt Guardrails Whitepaper",
    category: "Research",
    description: "Comprehensive guidelines on isolating LLM queries from internal databases and preventing privilege escalation.",
    url: "https://ai.google.dev/docs",
    fileSize: "3.2 MB PDF",
    tags: ["AI", "Security", "LLMOps", "Governance"],
    authorName: "Dr. Marcus Vance",
    downloadCount: 412,
    createdAt: new Date(Date.now() - 19 * 864e5).toISOString()
  },
  {
    id: "res_03",
    title: "Zero-Trust Role-Based Access Control (RBAC) Matrix Template",
    category: "Template",
    description: "Standardized operational matrix for separating Super Admin, Admin, Trainer, and Learner permissions.",
    url: "https://csrc.nist.gov/publications/detail/sp/800-162/final",
    fileSize: "1.1 MB XLSX",
    tags: ["Security", "RBAC", "Compliance"],
    authorName: "Elena Rostova",
    downloadCount: 189,
    createdAt: new Date(Date.now() - 12 * 864e5).toISOString()
  }
];
var INITIAL_ASSESSMENTS = [
  {
    id: "asm_cloud_midterm",
    title: "Cloud Resilience & Failover Simulation Assessment",
    courseId: "crs_cloud_arch",
    courseTitle: "Enterprise Cloud Architecture & Distributed Systems",
    description: "Evaluate practical architectural resilience against region outage scenarios and latency spikes.",
    type: "Practical_Assignment",
    durationMinutes: 90,
    totalPoints: 100,
    passPercentage: 75,
    dueDate: "2026-09-30T23:59:59Z",
    questions: [
      {
        id: "q1",
        prompt: "Which resilience mechanism prevents an overwhelmed downstream service from causing total system collapse?",
        type: "multiple_choice",
        options: [
          "Aggressive retry loops without backoff",
          "Circuit Breaker pattern with exponential backoff and jitter",
          "Synchronous blocking socket timeouts",
          "Disabling API health checks"
        ],
        correctOptionIndex: 1,
        points: 25
      },
      {
        id: "q2",
        prompt: "In a CAP theorem trade-off during network partitioning, what design choice guarantees immediate consistent state across replica sets?",
        type: "multiple_choice",
        options: [
          "High Availability (AP) with eventual consistency",
          "Strict Consistency (CP) with quorum acknowledgement",
          "Unicast UDP streaming",
          "Ignoring split-brain scenarios"
        ],
        correctOptionIndex: 1,
        points: 25
      },
      {
        id: "q3",
        prompt: "Outline your architectural plan for handling a 10x traffic spike on checkout microservices during peak enterprise enrollment.",
        type: "open_ended",
        rubricCriteria: "Evaluates autoscale configuration, asynchronous message queuing, database read replicas, and caching strategies.",
        points: 50
      }
    ],
    createdAt: new Date(Date.now() - 15 * 864e5).toISOString()
  },
  {
    id: "asm_ai_security",
    title: "AI Guardrails & Safe Integration Quiz",
    courseId: "crs_ai_eng",
    courseTitle: "Enterprise AI Strategy, LLMOps & Gemini Integration",
    description: "Knowledge assessment covering model sandboxing, context isolation, and preventing unintended database execution.",
    type: "Quiz",
    durationMinutes: 45,
    totalPoints: 50,
    passPercentage: 80,
    dueDate: "2026-10-15T23:59:59Z",
    questions: [
      {
        id: "q_ai_1",
        prompt: "Why must an AI assistant NEVER be given administrative database credentials or raw SQL/mutation capabilities?",
        type: "multiple_choice",
        options: [
          "It makes token consumption slightly higher",
          "Prompt injection could trick the model into executing unauthorized data deletions or role escalations",
          "AI models cannot process structured data",
          "There is no reason; AI models should have full root access"
        ],
        correctOptionIndex: 1,
        points: 25
      },
      {
        id: "q_ai_2",
        prompt: "What layer should sit between an LLM and corporate application backends?",
        type: "multiple_choice",
        options: [
          "A deterministic, permission-validated API middleware that rejects unauthenticated actions",
          "Direct open socket connections to the database master node",
          "None, prompt engineering alone is 100% secure",
          "Unencrypted raw text proxies"
        ],
        correctOptionIndex: 0,
        points: 25
      }
    ],
    createdAt: new Date(Date.now() - 10 * 864e5).toISOString()
  }
];
var INITIAL_SUBMISSIONS = [
  {
    id: "sub_aria_01",
    assessmentId: "asm_cloud_midterm",
    assessmentTitle: "Cloud Resilience & Failover Simulation Assessment",
    userId: "usr_learner",
    userName: "Aria Chen",
    answers: {
      q1: 1,
      q2: 1,
      q3: "I implement a decoupled architecture using Kafka queues for transaction buffering, Redis cluster for session cache, and Cloud Run autoscaling from 10 to 120 container instances with p99 latency alerts at 250ms."
    },
    submittedAt: new Date(Date.now() - 3 * 864e5).toISOString(),
    status: "graded",
    score: 95,
    totalPoints: 100,
    feedback: "Outstanding architectural clarity, precise understanding of backpressure buffering and autoscale triggers.",
    gradedBy: "usr_trainer",
    gradedAt: new Date(Date.now() - 2 * 864e5).toISOString()
  }
];
var INITIAL_PROGRESS = [
  {
    id: "prog_aria_cloud",
    userId: "usr_learner",
    courseId: "crs_cloud_arch",
    enrolledAt: new Date(Date.now() - 14 * 864e5).toISOString(),
    completedLessonIds: ["les_101", "les_102"],
    progressPercentage: 66,
    lastAccessedAt: (/* @__PURE__ */ new Date()).toISOString(),
    isCompleted: false
  },
  {
    id: "prog_aria_ai",
    userId: "usr_learner",
    courseId: "crs_ai_eng",
    enrolledAt: new Date(Date.now() - 10 * 864e5).toISOString(),
    completedLessonIds: ["les_ai_101"],
    progressPercentage: 50,
    lastAccessedAt: (/* @__PURE__ */ new Date()).toISOString(),
    isCompleted: false
  }
];
var INITIAL_COMPETENCIES = [
  {
    id: "comp_cloud",
    code: "COMP-ARC-01",
    name: "Distributed Cloud Systems & Resiliency",
    category: "Technical Architecture",
    description: "Ability to architect, deploy, and maintain fault-tolerant, scalable distributed systems across multi-region environments.",
    levels: [
      { level: 1, name: "Foundational", description: "Understands basic virtualization, container concepts, and single-region deployments.", criteria: ["Deploys containers", "Configures basic VPC"] },
      { level: 2, name: "Practitioner", description: "Configures load balancers, managed databases, and multi-tier network security groups.", criteria: ["Sets up SSL/TLS termination", "Configures auto-scaling groups"] },
      { level: 3, name: "Proficient", description: "Designs zero-downtime blue/green deployments and distributed caching tiers.", criteria: ["Executes chaos experiments", "Tunes Redis/Memcached hit ratios"] },
      { level: 4, name: "Advanced", description: "Architects multi-region active-active topologies with automated geo-DNS failover.", criteria: ["Designs cross-region DB sync", "Formulates disaster recovery RTO/RPO"] },
      { level: 5, name: "Master", description: "Sets global enterprise engineering standards and mentors principal architects.", criteria: ["Authors organizational architecture principles", "Advises C-level technology roadmap"] }
    ],
    relatedCourseIds: ["crs_cloud_arch"],
    createdAt: new Date(Date.now() - 30 * 864e5).toISOString()
  },
  {
    id: "comp_ai",
    code: "COMP-AI-02",
    name: "Enterprise Generative AI & LLMOps",
    category: "Applied AI",
    description: "Capability to securely integrate foundation models, build robust guardrails, and evaluate production inference pipelines.",
    levels: [
      { level: 1, name: "Awareness", description: "Familiarity with prompt engineering fundamentals and token limits.", criteria: ["Constructs zero-shot & few-shot prompts"] },
      { level: 2, name: "Integrator", description: "Integrates model APIs with server-side SDKs and handles streaming tokens.", criteria: ["Calls Gemini REST/SDK", "Handles rate-limits gracefully"] },
      { level: 3, name: "Specialist", description: "Designs Retrieval-Augmented Generation (RAG) pipelines with vector embeddings.", criteria: ["Implements semantic vector search", "Constructs chunking strategies"] },
      { level: 4, name: "Architect", description: "Implements enterprise guardrails, prompt injection defenses, and latency optimizations.", criteria: ["Enforces output validation schemas", "Integrates model telemetry"] },
      { level: 5, name: "Authority", description: "Leads organizational AI ethics, governance boards, and proprietary fine-tuning programs.", criteria: ["Audits model safety and bias", "Defines enterprise AI policy"] }
    ],
    relatedCourseIds: ["crs_ai_eng"],
    createdAt: new Date(Date.now() - 30 * 864e5).toISOString()
  },
  {
    id: "comp_security",
    code: "COMP-SEC-03",
    name: "Identity Governance & Zero-Trust RBAC",
    category: "Security & Governance",
    description: "Designing role-based access control, cryptographic verification, and tamper-evident audit logging systems.",
    levels: [
      { level: 1, name: "Basic", description: "Understands authentication vs authorization principles.", criteria: ["Manages passwords & MFA"] },
      { level: 2, name: "Applied", description: "Applies token claims and role guards in web/API routes.", criteria: ["Configures JWT validation"] },
      { level: 3, name: "Advanced", description: "Constructs dynamic policy engines (RBAC + ABAC) and granular permissions.", criteria: ["Writes Firestore Security Rules", "Implements scoped session tokens"] },
      { level: 4, name: "Expert", description: "Conducts threat modeling, pen testing, and privilege escalation mitigation.", criteria: ["Audits authentication pipelines", "Enforces least-privilege automation"] },
      { level: 5, name: "Fellow", description: "Directs global compliance frameworks (SOC2, ISO27001, FedRAMP).", criteria: ["Leads institutional compliance certifications"] }
    ],
    relatedCourseIds: ["crs_cyber_gov", "crs_cloud_arch"],
    createdAt: new Date(Date.now() - 30 * 864e5).toISOString()
  }
];
var INITIAL_LEARNER_COMPETENCIES = [
  {
    userId: "usr_learner",
    competencyId: "comp_cloud",
    competencyName: "Distributed Cloud Systems & Resiliency",
    currentLevel: 3,
    verifiedBy: "usr_trainer",
    verifiedAt: new Date(Date.now() - 5 * 864e5).toISOString()
  },
  {
    userId: "usr_learner",
    competencyId: "comp_ai",
    competencyName: "Enterprise Generative AI & LLMOps",
    currentLevel: 2,
    verifiedBy: "usr_trainer",
    verifiedAt: new Date(Date.now() - 2 * 864e5).toISOString()
  }
];
var INITIAL_NOTIFICATIONS = [
  {
    id: "notif_welcome",
    title: "CAPACITY CONNECT Core Initialized",
    message: "Welcome to CAPACITY CONNECT! Super Admin privileges have been established for venkatajaswanthsambangi@gmail.com.",
    type: "system",
    isRead: false,
    isGlobal: true,
    createdAt: (/* @__PURE__ */ new Date()).toISOString()
  },
  {
    id: "notif_asm_graded",
    userId: "usr_learner",
    title: "Assessment Graded",
    message: 'Dr. Marcus Vance graded your "Cloud Resilience & Failover Simulation" submission with a score of 95/100.',
    type: "assessment",
    isRead: false,
    isGlobal: false,
    link: "/assessments",
    createdAt: new Date(Date.now() - 2 * 864e5).toISOString()
  },
  {
    id: "notif_cohort_alert",
    title: "New Fall 2026 Cohorts Open for Enrollment",
    message: "Registrations are now active for Enterprise Cloud Architecture and Generative AI Accelerator cohorts.",
    type: "info",
    isRead: false,
    isGlobal: true,
    link: "/trainings",
    createdAt: new Date(Date.now() - 1 * 864e5).toISOString()
  }
];
var INITIAL_AUDIT_LOGS = [
  {
    id: "aud_boot",
    timestamp: new Date(Date.now() - 36e5).toISOString(),
    actorId: "usr_superadmin",
    actorEmail: "venkatajaswanthsambangi@gmail.com",
    actorRole: "super_admin",
    action: "SYSTEM_BOOTSTRAP",
    module: "System Settings",
    details: "Capacity Connect database initialized with configured Super Admin email and strict RBAC enforcement.",
    ipAddress: "127.0.0.1",
    status: "SUCCESS"
  },
  {
    id: "aud_role_grant",
    timestamp: new Date(Date.now() - 3e6).toISOString(),
    actorId: "usr_superadmin",
    actorEmail: "venkatajaswanthsambangi@gmail.com",
    actorRole: "super_admin",
    action: "RBAC_VALIDATION",
    module: "RBAC Access Control",
    details: "Verified role permissions hierarchy: Super Admin (12), Admin (9), Trainer (8), Learner (6).",
    ipAddress: "127.0.0.1",
    status: "SUCCESS"
  }
];
var PersistentDatabase = class {
  data;
  constructor() {
    this.data = this.loadData();
  }
  loadData() {
    try {
      if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR, { recursive: true });
      }
      if (fs.existsSync(DB_FILE)) {
        const raw = fs.readFileSync(DB_FILE, "utf-8");
        const parsed = JSON.parse(raw);
        const loaded = {
          users: parsed.users || INITIAL_USERS,
          roles: parsed.roles || INITIAL_ROLES,
          courses: parsed.courses || INITIAL_COURSES,
          trainings: parsed.trainings || INITIAL_TRAININGS,
          resources: parsed.resources || INITIAL_RESOURCES,
          assessments: parsed.assessments || INITIAL_ASSESSMENTS,
          submissions: parsed.submissions || INITIAL_SUBMISSIONS,
          progress: parsed.progress || INITIAL_PROGRESS,
          competencies: parsed.competencies || INITIAL_COMPETENCIES,
          learner_competencies: parsed.learner_competencies || INITIAL_LEARNER_COMPETENCIES,
          notifications: parsed.notifications || INITIAL_NOTIFICATIONS,
          audit_logs: parsed.audit_logs || INITIAL_AUDIT_LOGS,
          system_settings: { ...INITIAL_SETTINGS, ...parsed.system_settings || {} },
          ai_sessions: parsed.ai_sessions || {}
        };
        this.ensureSuperAdminUser(loaded);
        return loaded;
      }
    } catch (err) {
      console.error("[DB] Failed to load data from disk, falling back to seed:", err);
    }
    const defaultData = {
      users: INITIAL_USERS,
      roles: INITIAL_ROLES,
      courses: INITIAL_COURSES,
      trainings: INITIAL_TRAININGS,
      resources: INITIAL_RESOURCES,
      assessments: INITIAL_ASSESSMENTS,
      submissions: INITIAL_SUBMISSIONS,
      progress: INITIAL_PROGRESS,
      competencies: INITIAL_COMPETENCIES,
      learner_competencies: INITIAL_LEARNER_COMPETENCIES,
      notifications: INITIAL_NOTIFICATIONS,
      audit_logs: INITIAL_AUDIT_LOGS,
      system_settings: INITIAL_SETTINGS,
      ai_sessions: {}
    };
    this.ensureSuperAdminUser(defaultData);
    this.saveData(defaultData);
    return defaultData;
  }
  ensureSuperAdminUser(db2) {
    const superAdminEmail = db2.system_settings.superAdminEmail.toLowerCase().trim();
    let superAdmin = db2.users.find((u) => u.email.toLowerCase().trim() === superAdminEmail);
    if (!superAdmin) {
      superAdmin = {
        id: "usr_superadmin",
        email: superAdminEmail,
        name: "Venkata Jaswanth Sambangi",
        role: "super_admin",
        department: "Executive Governance",
        title: "Super Administrator",
        bio: "Configured Super Administrator with absolute permissions.",
        createdAt: (/* @__PURE__ */ new Date()).toISOString(),
        updatedAt: (/* @__PURE__ */ new Date()).toISOString(),
        isActive: true
      };
      db2.users.unshift(superAdmin);
    } else {
      superAdmin.role = "super_admin";
    }
  }
  saveData(customData) {
    try {
      if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR, { recursive: true });
      }
      const dataToSave = customData || this.data;
      fs.writeFileSync(DB_FILE, JSON.stringify(dataToSave, null, 2), "utf-8");
    } catch (err) {
      console.error("[DB] Failed to write database to disk:", err);
    }
  }
  // Audit logging utility
  addAuditLog(entry) {
    const log = {
      ...entry,
      id: `aud_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      timestamp: (/* @__PURE__ */ new Date()).toISOString()
    };
    this.data.audit_logs.unshift(log);
    if (this.data.audit_logs.length > 500) {
      this.data.audit_logs = this.data.audit_logs.slice(0, 500);
    }
    this.saveData();
    return log;
  }
  // Getters
  getUsers() {
    return this.data.users;
  }
  getRoles() {
    return this.data.roles;
  }
  getCourses() {
    return this.data.courses;
  }
  getTrainings() {
    return this.data.trainings;
  }
  getResources() {
    return this.data.resources;
  }
  getAssessments() {
    return this.data.assessments;
  }
  getSubmissions() {
    return this.data.submissions;
  }
  getProgress() {
    return this.data.progress;
  }
  getCompetencies() {
    return this.data.competencies;
  }
  getLearnerCompetencies() {
    return this.data.learner_competencies;
  }
  getNotifications() {
    return this.data.notifications;
  }
  getAuditLogs() {
    return this.data.audit_logs;
  }
  getSystemSettings() {
    return this.data.system_settings;
  }
  getAiSessions(userId) {
    return this.data.ai_sessions[userId] || [];
  }
  // Mutations
  updateSystemSettings(newSettings, actor) {
    this.data.system_settings = { ...this.data.system_settings, ...newSettings };
    this.ensureSuperAdminUser(this.data);
    this.addAuditLog({
      actorId: actor.id,
      actorEmail: actor.email,
      actorRole: actor.role,
      action: "UPDATE_SYSTEM_SETTINGS",
      module: "System Settings",
      details: `Updated settings: ${Object.keys(newSettings).join(", ")}`,
      status: "SUCCESS"
    });
    this.saveData();
    return this.data.system_settings;
  }
  setUserRole(userId, newRole, actor) {
    const user = this.data.users.find((u) => u.id === userId);
    if (!user) throw new Error("User not found");
    const oldRole = user.role;
    user.role = newRole;
    user.updatedAt = (/* @__PURE__ */ new Date()).toISOString();
    this.addAuditLog({
      actorId: actor.id,
      actorEmail: actor.email,
      actorRole: actor.role,
      action: "CHANGE_USER_ROLE",
      module: "RBAC Access Control",
      details: `Changed role of user ${user.email} from ${oldRole} to ${newRole}`,
      status: "SUCCESS"
    });
    this.saveData();
    return user;
  }
  upsertUser(user) {
    const index = this.data.users.findIndex((u) => u.id === user.id || u.email.toLowerCase() === user.email.toLowerCase());
    if (index >= 0) {
      this.data.users[index] = { ...this.data.users[index], ...user, updatedAt: (/* @__PURE__ */ new Date()).toISOString() };
      this.saveData();
      return this.data.users[index];
    } else {
      this.data.users.push(user);
      this.saveData();
      return user;
    }
  }
  createCourse(course, actor) {
    this.data.courses.unshift(course);
    this.addAuditLog({
      actorId: actor.id,
      actorEmail: actor.email,
      actorRole: actor.role,
      action: "CREATE_COURSE",
      module: "Course Management",
      details: `Created new course: "${course.title}" (${course.code})`,
      status: "SUCCESS"
    });
    this.saveData();
    return course;
  }
  updateCourse(courseId, updates, actor) {
    const index = this.data.courses.findIndex((c) => c.id === courseId);
    if (index === -1) throw new Error("Course not found");
    this.data.courses[index] = { ...this.data.courses[index], ...updates, updatedAt: (/* @__PURE__ */ new Date()).toISOString() };
    this.addAuditLog({
      actorId: actor.id,
      actorEmail: actor.email,
      actorRole: actor.role,
      action: "UPDATE_COURSE",
      module: "Course Management",
      details: `Updated course: "${this.data.courses[index].title}"`,
      status: "SUCCESS"
    });
    this.saveData();
    return this.data.courses[index];
  }
  deleteCourse(courseId, actor) {
    const index = this.data.courses.findIndex((c) => c.id === courseId);
    if (index === -1) throw new Error("Course not found");
    const removed = this.data.courses.splice(index, 1)[0];
    this.addAuditLog({
      actorId: actor.id,
      actorEmail: actor.email,
      actorRole: actor.role,
      action: "DELETE_COURSE",
      module: "Course Management",
      details: `Deleted course: "${removed.title}"`,
      status: "SUCCESS"
    });
    this.saveData();
    return removed;
  }
  createTraining(training, actor) {
    this.data.trainings.unshift(training);
    this.addAuditLog({
      actorId: actor.id,
      actorEmail: actor.email,
      actorRole: actor.role,
      action: "CREATE_TRAINING_COHORT",
      module: "Training Management",
      details: `Created cohort: "${training.title}"`,
      status: "SUCCESS"
    });
    this.saveData();
    return training;
  }
  enrollInTraining(trainingId, learnerId, actor) {
    const training = this.data.trainings.find((t) => t.id === trainingId);
    if (!training) throw new Error("Training cohort not found");
    if (!training.enrolledLearnerIds.includes(learnerId)) {
      training.enrolledLearnerIds.push(learnerId);
      this.saveData();
    }
    return training;
  }
  createResource(resource, actor) {
    this.data.resources.unshift(resource);
    this.addAuditLog({
      actorId: actor.id,
      actorEmail: actor.email,
      actorRole: actor.role,
      action: "CREATE_RESOURCE",
      module: "Learning Resources",
      details: `Added resource: "${resource.title}"`,
      status: "SUCCESS"
    });
    this.saveData();
    return resource;
  }
  createAssessment(assessment, actor) {
    this.data.assessments.unshift(assessment);
    this.addAuditLog({
      actorId: actor.id,
      actorEmail: actor.email,
      actorRole: actor.role,
      action: "CREATE_ASSESSMENT",
      module: "Assessments",
      details: `Created assessment: "${assessment.title}"`,
      status: "SUCCESS"
    });
    this.saveData();
    return assessment;
  }
  updateAssessment(id, updates, actor) {
    const index = this.data.assessments.findIndex((a) => a.id === id);
    if (index === -1) throw new Error("Assessment not found");
    this.data.assessments[index] = {
      ...this.data.assessments[index],
      ...updates,
      id
    };
    this.addAuditLog({
      actorId: actor.id,
      actorEmail: actor.email,
      actorRole: actor.role,
      action: "UPDATE_ASSESSMENT",
      module: "Assessments",
      details: `Updated assessment: "${this.data.assessments[index].title}"`,
      status: "SUCCESS"
    });
    this.saveData();
    return this.data.assessments[index];
  }
  deleteAssessment(id, actor) {
    const index = this.data.assessments.findIndex((a) => a.id === id);
    if (index === -1) throw new Error("Assessment not found");
    const removed = this.data.assessments.splice(index, 1)[0];
    this.addAuditLog({
      actorId: actor.id,
      actorEmail: actor.email,
      actorRole: actor.role,
      action: "DELETE_ASSESSMENT",
      module: "Assessments",
      details: `Deleted assessment: "${removed.title}"`,
      status: "SUCCESS"
    });
    this.saveData();
    return removed;
  }
  submitAssessment(submission) {
    const existingIndex = this.data.submissions.findIndex((s) => s.id === submission.id);
    if (existingIndex >= 0) {
      this.data.submissions[existingIndex] = submission;
    } else {
      this.data.submissions.unshift(submission);
    }
    this.saveData();
    return submission;
  }
  gradeSubmission(submissionId, score, feedback, trainer) {
    const sub = this.data.submissions.find((s) => s.id === submissionId);
    if (!sub) throw new Error("Submission not found");
    sub.score = score;
    sub.feedback = feedback;
    sub.status = "graded";
    sub.gradedBy = trainer.name;
    sub.gradedAt = (/* @__PURE__ */ new Date()).toISOString();
    this.addNotification({
      userId: sub.userId,
      title: "Assessment Graded",
      message: `${trainer.name} graded your submission for "${sub.assessmentTitle}": Score ${score}/${sub.totalPoints}`,
      type: "assessment",
      isRead: false,
      isGlobal: false,
      link: "/assessments"
    });
    this.addAuditLog({
      actorId: trainer.id,
      actorEmail: trainer.email,
      actorRole: trainer.role,
      action: "GRADE_ASSESSMENT",
      module: "Assessments",
      details: `Graded submission ${sub.id} for ${sub.userName}: ${score}/${sub.totalPoints}`,
      status: "SUCCESS"
    });
    this.saveData();
    return sub;
  }
  updateLearnerProgress(userId, courseId, lessonId) {
    let progress = this.data.progress.find((p) => p.userId === userId && p.courseId === courseId);
    const course = this.data.courses.find((c) => c.id === courseId);
    const totalLessons = course ? course.modules.reduce((sum, m) => sum + m.lessons.length, 0) : 1;
    if (!progress) {
      progress = {
        id: `prog_${userId}_${courseId}`,
        userId,
        courseId,
        enrolledAt: (/* @__PURE__ */ new Date()).toISOString(),
        completedLessonIds: [lessonId],
        progressPercentage: Math.round(1 / Math.max(1, totalLessons) * 100),
        lastAccessedAt: (/* @__PURE__ */ new Date()).toISOString(),
        isCompleted: totalLessons <= 1
      };
      this.data.progress.push(progress);
    } else {
      if (!progress.completedLessonIds.includes(lessonId)) {
        progress.completedLessonIds.push(lessonId);
      }
      progress.progressPercentage = Math.round(progress.completedLessonIds.length / Math.max(1, totalLessons) * 100);
      progress.lastAccessedAt = (/* @__PURE__ */ new Date()).toISOString();
      if (progress.progressPercentage >= 100) {
        progress.isCompleted = true;
        progress.completedAt = (/* @__PURE__ */ new Date()).toISOString();
        progress.certificateId = `CERT-CAP-${Date.now().toString(36).toUpperCase()}`;
      }
    }
    this.saveData();
    return progress;
  }
  toggleLearnerProgress(userId, courseId, lessonId) {
    let progress = this.data.progress.find((p) => p.userId === userId && p.courseId === courseId);
    const course = this.data.courses.find((c) => c.id === courseId);
    const totalLessons = course ? course.modules.reduce((sum, m) => sum + m.lessons.length, 0) : 1;
    if (!progress) {
      return this.updateLearnerProgress(userId, courseId, lessonId);
    }
    if (progress.completedLessonIds.includes(lessonId)) {
      progress.completedLessonIds = progress.completedLessonIds.filter((id) => id !== lessonId);
      progress.isCompleted = false;
      progress.completedAt = void 0;
    } else {
      progress.completedLessonIds.push(lessonId);
    }
    progress.progressPercentage = Math.round(progress.completedLessonIds.length / Math.max(1, totalLessons) * 100);
    progress.lastAccessedAt = (/* @__PURE__ */ new Date()).toISOString();
    if (progress.progressPercentage >= 100) {
      progress.isCompleted = true;
      progress.completedAt = (/* @__PURE__ */ new Date()).toISOString();
      if (!progress.certificateId) {
        progress.certificateId = `CERT-CAP-${Date.now().toString(36).toUpperCase()}`;
      }
    }
    this.saveData();
    return progress;
  }
  createCompetency(competency, actor) {
    this.data.competencies.unshift(competency);
    this.addAuditLog({
      actorId: actor.id,
      actorEmail: actor.email,
      actorRole: actor.role,
      action: "CREATE_COMPETENCY",
      module: "Competencies",
      details: `Added competency: "${competency.name}" (${competency.code})`,
      status: "SUCCESS"
    });
    this.saveData();
    return competency;
  }
  updateCompetency(id, updates, actor) {
    const index = this.data.competencies.findIndex((c) => c.id === id);
    if (index === -1) throw new Error("Competency not found");
    this.data.competencies[index] = {
      ...this.data.competencies[index],
      ...updates,
      id
    };
    this.addAuditLog({
      actorId: actor.id,
      actorEmail: actor.email,
      actorRole: actor.role,
      action: "UPDATE_COMPETENCY",
      module: "Competencies",
      details: `Updated competency: "${this.data.competencies[index].name}"`,
      status: "SUCCESS"
    });
    this.saveData();
    return this.data.competencies[index];
  }
  deleteCompetency(id, actor) {
    const index = this.data.competencies.findIndex((c) => c.id === id);
    if (index === -1) throw new Error("Competency not found");
    const removed = this.data.competencies.splice(index, 1)[0];
    this.addAuditLog({
      actorId: actor.id,
      actorEmail: actor.email,
      actorRole: actor.role,
      action: "DELETE_COMPETENCY",
      module: "Competencies",
      details: `Deleted competency: "${removed.name}" (${removed.code})`,
      status: "SUCCESS"
    });
    this.saveData();
    return removed;
  }
  updateLearnerCompetency(userId, competencyId, level, validator) {
    const comp = this.data.competencies.find((c) => c.id === competencyId);
    let record = this.data.learner_competencies.find((lc) => lc.userId === userId && lc.competencyId === competencyId);
    if (!record) {
      record = {
        userId,
        competencyId,
        competencyName: comp ? comp.name : "Unknown Competency",
        currentLevel: level,
        verifiedBy: validator.name,
        verifiedAt: (/* @__PURE__ */ new Date()).toISOString()
      };
      this.data.learner_competencies.push(record);
    } else {
      record.currentLevel = level;
      record.verifiedBy = validator.name;
      record.verifiedAt = (/* @__PURE__ */ new Date()).toISOString();
    }
    this.saveData();
    return record;
  }
  addNotification(item) {
    const notif = {
      ...item,
      id: `notif_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      createdAt: (/* @__PURE__ */ new Date()).toISOString()
    };
    this.data.notifications.unshift(notif);
    this.saveData();
    return notif;
  }
  markNotificationAsRead(id) {
    const notif = this.data.notifications.find((n) => n.id === id);
    if (notif) {
      notif.isRead = true;
      this.saveData();
    }
    return notif;
  }
  markAllNotificationsAsRead(userId) {
    let count = 0;
    this.data.notifications.forEach((n) => {
      if (n.isGlobal || n.userId === userId) {
        if (!n.isRead) {
          n.isRead = true;
          count++;
        }
      }
    });
    if (count > 0) {
      this.saveData();
    }
    return count;
  }
  deleteNotification(id) {
    const index = this.data.notifications.findIndex((n) => n.id === id);
    if (index === -1) return false;
    this.data.notifications.splice(index, 1);
    this.saveData();
    return true;
  }
  saveAiChatMessage(userId, message) {
    if (!this.data.ai_sessions[userId]) {
      this.data.ai_sessions[userId] = [];
    }
    this.data.ai_sessions[userId].push(message);
    if (this.data.ai_sessions[userId].length > 100) {
      this.data.ai_sessions[userId] = this.data.ai_sessions[userId].slice(-100);
    }
    this.saveData();
    return message;
  }
  clearAiSessions(userId) {
    if (this.data.ai_sessions[userId]) {
      this.data.ai_sessions[userId] = [];
      this.saveData();
    }
    return true;
  }
};
var db = new PersistentDatabase();

// server/middleware/auth.ts
var authenticateUser = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    const customUserId = req.headers["x-user-id"];
    const customUserEmail = req.headers["x-user-email"];
    let user;
    const settings = db.getSystemSettings();
    const superAdminEmail = settings.superAdminEmail.toLowerCase().trim();
    if (customUserEmail) {
      const emailNormalized = customUserEmail.toLowerCase().trim();
      user = db.getUsers().find((u) => u.email.toLowerCase().trim() === emailNormalized);
      if (!user && emailNormalized === superAdminEmail) {
        user = db.upsertUser({
          id: `usr_${Date.now()}`,
          email: customUserEmail,
          name: "Venkata Jaswanth Sambangi",
          role: "super_admin",
          department: "Executive Governance",
          title: "Super Administrator",
          createdAt: (/* @__PURE__ */ new Date()).toISOString(),
          updatedAt: (/* @__PURE__ */ new Date()).toISOString(),
          isActive: true
        });
      }
    } else if (customUserId) {
      user = db.getUsers().find((u) => u.id === customUserId);
    } else if (authHeader && authHeader.startsWith("Bearer ")) {
      const token = authHeader.substring(7);
      if (token.includes("@")) {
        const emailNormalized = token.toLowerCase().trim();
        user = db.getUsers().find((u) => u.email.toLowerCase().trim() === emailNormalized);
      } else {
        user = db.getUsers().find((u) => u.id === token);
      }
    }
    if (user) {
      if (user.email.toLowerCase().trim() === superAdminEmail && user.role !== "super_admin") {
        user.role = "super_admin";
      }
      req.user = user;
    }
    next();
  } catch (error) {
    console.error("[Auth Middleware] Error authenticating request:", error);
    next();
  }
};
var requireAuth = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ error: "Unauthorized: Authentication required" });
  }
  next();
};
var requireRole = (allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: "Unauthorized: Authentication required" });
    }
    if (req.user.role === "super_admin") {
      return next();
    }
    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        error: `Forbidden: Access restricted to roles: [${allowedRoles.join(", ")}]. Current role: ${req.user.role}`
      });
    }
    next();
  };
};
var requireSuperAdmin = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ error: "Unauthorized: Authentication required" });
  }
  const superAdminEmail = db.getSystemSettings().superAdminEmail.toLowerCase().trim();
  const isSuperAdmin = req.user.role === "super_admin" || req.user.email.toLowerCase().trim() === superAdminEmail;
  if (!isSuperAdmin) {
    return res.status(403).json({ error: "Forbidden: Super Admin privileges strictly required" });
  }
  next();
};

// server/routes/auth.ts
import { Router } from "express";
var router = Router();
router.get("/me", (req, res) => {
  const settings = db.getSystemSettings();
  const superAdminEmail = settings.superAdminEmail.toLowerCase().trim();
  const user = req.user;
  if (!user) {
    return res.status(401).json({ error: "Unauthorized: No active session", isAuthenticated: false });
  }
  const isConfiguredSuperAdmin = user.email.toLowerCase().trim() === superAdminEmail;
  if (isConfiguredSuperAdmin && user.role !== "super_admin") {
    user.role = "super_admin";
    db.setUserRole(user.id, "super_admin", user);
  }
  res.json({
    user,
    isSuperAdmin: user.role === "super_admin" || isConfiguredSuperAdmin,
    configuredSuperAdminEmail: settings.superAdminEmail
  });
});
router.post("/register", (req, res) => {
  const { name, email, department, title } = req.body;
  if (!email || !name) {
    return res.status(400).json({ error: "Full name and email are required" });
  }
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({ error: "Invalid email format" });
  }
  const normalized = email.toLowerCase().trim();
  const settings = db.getSystemSettings();
  const superAdminEmail = settings.superAdminEmail.toLowerCase().trim();
  const existing = db.getUsers().find((u) => u.email.toLowerCase().trim() === normalized);
  if (existing) {
    return res.status(409).json({ error: "An account with this enterprise email already exists." });
  }
  if (!settings.allowSelfRegistration && normalized !== superAdminEmail) {
    return res.status(403).json({ error: "Self-registration is currently disabled by enterprise policy." });
  }
  const role = normalized === superAdminEmail ? "super_admin" : settings.defaultUserRole || "learner";
  const newUser = db.upsertUser({
    id: `usr_${Date.now()}`,
    email: normalized,
    name: name.trim(),
    role,
    department: department?.trim() || "General Operations",
    title: title?.trim() || "Capacity Associate",
    createdAt: (/* @__PURE__ */ new Date()).toISOString(),
    updatedAt: (/* @__PURE__ */ new Date()).toISOString(),
    isActive: true
  });
  db.addAuditLog({
    actorId: newUser.id,
    actorEmail: newUser.email,
    actorRole: newUser.role,
    action: "USER_REGISTER",
    module: "Authentication",
    details: `User ${newUser.name} (${newUser.email}) registered with role ${newUser.role}`,
    status: "SUCCESS"
  });
  res.status(201).json({ user: newUser, message: "Registration successful" });
});
router.post("/login", (req, res) => {
  const { email } = req.body;
  if (!email) {
    return res.status(400).json({ error: "Email is required" });
  }
  const normalized = email.toLowerCase().trim();
  const settings = db.getSystemSettings();
  const superAdminEmail = settings.superAdminEmail.toLowerCase().trim();
  let user = db.getUsers().find((u) => u.email.toLowerCase().trim() === normalized);
  if (!user) {
    if (normalized === superAdminEmail) {
      user = db.upsertUser({
        id: `usr_${Date.now()}`,
        email: normalized,
        name: "Venkata Jaswanth Sambangi",
        role: "super_admin",
        department: "Executive Governance",
        title: "Super Administrator",
        bio: "Bootstrap configured Super Administrator.",
        createdAt: (/* @__PURE__ */ new Date()).toISOString(),
        updatedAt: (/* @__PURE__ */ new Date()).toISOString(),
        isActive: true
      });
    } else if (settings.allowSelfRegistration) {
      user = db.upsertUser({
        id: `usr_${Date.now()}`,
        email: normalized,
        name: normalized.split("@")[0].replace(".", " ").replace(/\b\w/g, (l) => l.toUpperCase()),
        role: settings.defaultUserRole,
        department: "General Operations",
        title: "Capacity Learner",
        createdAt: (/* @__PURE__ */ new Date()).toISOString(),
        updatedAt: (/* @__PURE__ */ new Date()).toISOString(),
        isActive: true
      });
    } else {
      return res.status(403).json({ error: "User not registered and self-registration is closed." });
    }
  }
  db.addAuditLog({
    actorId: user.id,
    actorEmail: user.email,
    actorRole: user.role,
    action: "USER_LOGIN",
    module: "Authentication",
    details: `User ${user.email} signed in with role ${user.role}`,
    status: "SUCCESS"
  });
  res.json({ user, message: "Authentication successful" });
});
router.post("/session", (req, res) => {
  const { email } = req.body;
  if (!email) {
    return res.status(400).json({ error: "Email is required" });
  }
  const normalized = email.toLowerCase().trim();
  const settings = db.getSystemSettings();
  const superAdminEmail = settings.superAdminEmail.toLowerCase().trim();
  let user = db.getUsers().find((u) => u.email.toLowerCase().trim() === normalized);
  if (!user) {
    if (normalized === superAdminEmail) {
      user = db.upsertUser({
        id: `usr_${Date.now()}`,
        email: normalized,
        name: "Venkata Jaswanth Sambangi",
        role: "super_admin",
        department: "Executive Governance",
        title: "Super Administrator",
        bio: "Bootstrap configured Super Administrator.",
        createdAt: (/* @__PURE__ */ new Date()).toISOString(),
        updatedAt: (/* @__PURE__ */ new Date()).toISOString(),
        isActive: true
      });
    } else if (settings.allowSelfRegistration) {
      user = db.upsertUser({
        id: `usr_${Date.now()}`,
        email: normalized,
        name: normalized.split("@")[0].replace(".", " ").replace(/\b\w/g, (l) => l.toUpperCase()),
        role: settings.defaultUserRole,
        department: "General Operations",
        title: "Capacity Learner",
        createdAt: (/* @__PURE__ */ new Date()).toISOString(),
        updatedAt: (/* @__PURE__ */ new Date()).toISOString(),
        isActive: true
      });
    } else {
      return res.status(403).json({ error: "User not registered and self-registration is closed." });
    }
  }
  res.json({ user, message: "Session verified" });
});
router.post("/switch-demo", (req, res) => {
  const { role } = req.body;
  if (!role) {
    return res.status(400).json({ error: "Role is required" });
  }
  const user = db.getUsers().find((u) => u.role === role);
  if (!user) {
    return res.status(404).json({ error: `Demo account for role ${role} not found` });
  }
  res.json({ user, message: `Switched demo context to ${user.name} (${user.role})` });
});
router.get("/users", requireRole(["super_admin", "admin"]), (req, res) => {
  const users = db.getUsers();
  res.json({ users });
});
router.put("/users/:id/role", requireSuperAdmin, (req, res) => {
  const id = String(req.params.id);
  const { role } = req.body;
  if (!["super_admin", "admin", "trainer", "learner"].includes(role)) {
    return res.status(400).json({ error: "Invalid role" });
  }
  const actor = req.user;
  const updatedUser = db.setUserRole(id, role, actor);
  res.json({ user: updatedUser, message: `Role updated to ${role}` });
});
router.put("/profile", requireAuth, (req, res) => {
  const actor = req.user;
  const { name, department, title, bio, phoneNumber } = req.body;
  const updated = db.upsertUser({
    ...actor,
    name: name || actor.name,
    department: department || actor.department,
    title: title || actor.title,
    bio: bio || actor.bio,
    phoneNumber: phoneNumber || actor.phoneNumber,
    updatedAt: (/* @__PURE__ */ new Date()).toISOString()
  });
  res.json({ user: updated, message: "Profile updated successfully" });
});
var auth_default = router;

// server/routes/courses.ts
import { Router as Router2 } from "express";
var router2 = Router2();
router2.get("/", (req, res) => {
  const { category, level, search } = req.query;
  let courses = db.getCourses();
  if (category && category !== "All") {
    courses = courses.filter((c) => c.category.toLowerCase() === category.toLowerCase());
  }
  if (level && level !== "All") {
    courses = courses.filter((c) => c.level.toLowerCase() === level.toLowerCase());
  }
  if (search) {
    const q = search.toLowerCase();
    courses = courses.filter((c) => c.title.toLowerCase().includes(q) || c.description.toLowerCase().includes(q) || c.code.toLowerCase().includes(q));
  }
  res.json({ courses });
});
router2.get("/:id", (req, res) => {
  const course = db.getCourses().find((c) => c.id === req.params.id);
  if (!course) {
    return res.status(404).json({ error: "Course not found" });
  }
  res.json({ course });
});
router2.post("/", requireRole(["super_admin", "admin", "trainer"]), (req, res) => {
  const actor = req.user;
  const body = req.body;
  if (!body.title || !body.code) {
    return res.status(400).json({ error: "Title and Course Code are required" });
  }
  const newCourse = {
    id: `crs_${Date.now()}`,
    title: body.title,
    code: body.code,
    description: body.description || "",
    category: body.category || "General",
    level: body.level || "Beginner",
    durationHours: Number(body.durationHours) || 20,
    instructorId: actor.id,
    instructorName: actor.name,
    thumbnailUrl: body.thumbnailUrl || "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&q=80&w=600",
    modules: body.modules || [],
    competencyIds: body.competencyIds || [],
    isPublished: body.isPublished !== void 0 ? body.isPublished : true,
    enrolledCount: 0,
    rating: 5,
    createdAt: (/* @__PURE__ */ new Date()).toISOString(),
    updatedAt: (/* @__PURE__ */ new Date()).toISOString()
  };
  const created = db.createCourse(newCourse, actor);
  res.status(201).json({ course: created });
});
router2.put("/:id", requireRole(["super_admin", "admin", "trainer"]), (req, res) => {
  const actor = req.user;
  const id = String(req.params.id);
  try {
    const updated = db.updateCourse(id, req.body, actor);
    res.json({ course: updated });
  } catch (err) {
    res.status(404).json({ error: err.message });
  }
});
router2.delete("/:id", requireRole(["super_admin", "admin"]), (req, res) => {
  const actor = req.user;
  const id = String(req.params.id);
  try {
    const deleted = db.deleteCourse(id, actor);
    res.json({ deleted, message: "Course deleted successfully" });
  } catch (err) {
    res.status(404).json({ error: err.message });
  }
});
var courses_default = router2;

// server/routes/trainings.ts
import { Router as Router3 } from "express";
var router3 = Router3();
router3.get("/", (req, res) => {
  const trainings = db.getTrainings();
  res.json({ trainings });
});
router3.post("/", requireRole(["super_admin", "admin", "trainer"]), (req, res) => {
  const actor = req.user;
  const body = req.body;
  if (!body.title || !body.courseId) {
    return res.status(400).json({ error: "Title and CourseId are required" });
  }
  const course = db.getCourses().find((c) => c.id === body.courseId);
  const newTraining = {
    id: `tr_${Date.now()}`,
    title: body.title,
    courseId: body.courseId,
    courseTitle: course ? course.title : body.courseTitle || "Training Course",
    trainerId: body.trainerId || actor.id,
    trainerName: body.trainerName || actor.name,
    startDate: body.startDate || (/* @__PURE__ */ new Date()).toISOString().split("T")[0],
    endDate: body.endDate || new Date(Date.now() + 30 * 864e5).toISOString().split("T")[0],
    meetingSchedule: body.meetingSchedule || "Flexible schedule",
    location: body.location || "Virtual Interactive Room",
    capacity: Number(body.capacity) || 30,
    enrolledLearnerIds: [],
    status: "Active",
    createdAt: (/* @__PURE__ */ new Date()).toISOString()
  };
  const created = db.createTraining(newTraining, actor);
  res.status(201).json({ training: created });
});
router3.post("/:id/enroll", requireAuth, (req, res) => {
  const actor = req.user;
  const id = String(req.params.id);
  const learnerId = req.body.learnerId || actor.id;
  try {
    const updated = db.enrollInTraining(id, learnerId, actor);
    res.json({ training: updated, message: "Enrolled successfully" });
  } catch (err) {
    res.status(404).json({ error: err.message });
  }
});
var trainings_default = router3;

// server/routes/resources.ts
import { Router as Router4 } from "express";
var router4 = Router4();
router4.get("/", (req, res) => {
  const { category, search } = req.query;
  let resources = db.getResources();
  if (category && category !== "All") {
    resources = resources.filter((r) => r.category.toLowerCase() === category.toLowerCase());
  }
  if (search) {
    const q = search.toLowerCase();
    resources = resources.filter((r) => r.title.toLowerCase().includes(q) || r.description.toLowerCase().includes(q) || r.tags.some((t) => t.toLowerCase().includes(q)));
  }
  res.json({ resources });
});
router4.post("/", requireRole(["super_admin", "admin", "trainer"]), (req, res) => {
  const actor = req.user;
  const body = req.body;
  if (!body.title || !body.url) {
    return res.status(400).json({ error: "Title and URL are required" });
  }
  const newResource = {
    id: `res_${Date.now()}`,
    title: body.title,
    category: body.category || "Guide",
    description: body.description || "",
    url: body.url,
    fileSize: body.fileSize || "Online Resource",
    tags: Array.isArray(body.tags) ? body.tags : body.tags ? body.tags.split(",").map((t) => t.trim()) : ["Enterprise"],
    authorName: actor.name,
    downloadCount: 0,
    createdAt: (/* @__PURE__ */ new Date()).toISOString()
  };
  const created = db.createResource(newResource, actor);
  res.status(201).json({ resource: created });
});
var resources_default = router4;

// server/routes/assessments.ts
import { Router as Router5 } from "express";
var router5 = Router5();
router5.get("/", requireAuth, (req, res) => {
  const actor = req.user;
  const { courseId, type } = req.query;
  let assessments = db.getAssessments();
  if (actor.role === "learner") {
    const publishedCourseIds = new Set(db.getCourses().filter((c) => c.isPublished).map((c) => c.id));
    const enrolledCourseIds = new Set(db.getProgress().filter((p) => p.userId === actor.id).map((p) => p.courseId));
    assessments = assessments.filter((a) => publishedCourseIds.has(a.courseId) || enrolledCourseIds.has(a.courseId));
    assessments = assessments.map((a) => ({
      ...a,
      questions: a.questions.map((q) => {
        const { correctOptionIndex, ...safeQuestion } = q;
        return safeQuestion;
      })
    }));
  }
  if (courseId) {
    assessments = assessments.filter((a) => a.courseId === courseId);
  }
  if (type && type !== "All") {
    assessments = assessments.filter((a) => a.type === type);
  }
  res.json({ assessments });
});
router5.get("/submissions/my", requireAuth, (req, res) => {
  const actor = req.user;
  const submissions = db.getSubmissions().filter((s) => s.userId === actor.id);
  res.json({ submissions });
});
router5.get("/submissions/all", requireRole(["super_admin", "admin", "trainer"]), (req, res) => {
  const submissions = db.getSubmissions();
  res.json({ submissions });
});
router5.get("/submissions/:id", requireAuth, (req, res) => {
  const actor = req.user;
  const submission = db.getSubmissions().find((s) => s.id === req.params.id);
  if (!submission) {
    return res.status(404).json({ error: "Submission not found" });
  }
  if (actor.role === "learner" && submission.userId !== actor.id) {
    return res.status(403).json({ error: "Forbidden: You can only view your own submissions" });
  }
  res.json({ submission });
});
router5.get("/:id", requireAuth, (req, res) => {
  const actor = req.user;
  const assessment = db.getAssessments().find((a) => a.id === req.params.id);
  if (!assessment) {
    return res.status(404).json({ error: "Assessment not found" });
  }
  if (actor.role === "learner") {
    const publishedCourseIds = new Set(db.getCourses().filter((c) => c.isPublished).map((c) => c.id));
    const enrolledCourseIds = new Set(db.getProgress().filter((p) => p.userId === actor.id).map((p) => p.courseId));
    if (!publishedCourseIds.has(assessment.courseId) && !enrolledCourseIds.has(assessment.courseId)) {
      return res.status(403).json({ error: "Forbidden: You do not have permission to access this assessment" });
    }
    const sanitizedQuestions = assessment.questions.map((q) => {
      const { correctOptionIndex, ...safeQuestion } = q;
      return safeQuestion;
    });
    return res.json({
      assessment: {
        ...assessment,
        questions: sanitizedQuestions
      }
    });
  }
  res.json({ assessment });
});
router5.put("/:id", requireRole(["super_admin", "admin", "trainer"]), (req, res) => {
  const actor = req.user;
  const id = String(req.params.id);
  const body = req.body;
  if (body.title !== void 0 && (typeof body.title !== "string" || body.title.trim().length < 3)) {
    return res.status(400).json({ error: "Title must be at least 3 characters" });
  }
  if (body.durationMinutes !== void 0) {
    const duration = Number(body.durationMinutes);
    if (isNaN(duration) || duration <= 0) {
      return res.status(400).json({ error: "Duration must be a positive number" });
    }
  }
  if (body.passPercentage !== void 0) {
    const pass = Number(body.passPercentage);
    if (isNaN(pass) || pass < 1 || pass > 100) {
      return res.status(400).json({ error: "Pass percentage must be between 1 and 100" });
    }
  }
  try {
    const updated = db.updateAssessment(id, body, actor);
    res.json({ assessment: updated, message: "Assessment updated successfully" });
  } catch (err) {
    res.status(404).json({ error: err.message });
  }
});
router5.delete("/:id", requireRole(["super_admin", "admin"]), (req, res) => {
  const actor = req.user;
  const id = String(req.params.id);
  try {
    const removed = db.deleteAssessment(id, actor);
    res.json({ assessment: removed, message: "Assessment deleted successfully" });
  } catch (err) {
    res.status(404).json({ error: err.message });
  }
});
router5.post("/", requireRole(["super_admin", "admin", "trainer"]), (req, res) => {
  const actor = req.user;
  const body = req.body;
  if (!body.title || typeof body.title !== "string" || body.title.trim().length < 3) {
    return res.status(400).json({ error: "Title must be at least 3 characters long" });
  }
  if (!body.courseId) {
    return res.status(400).json({ error: "Course is required" });
  }
  const course = db.getCourses().find((c) => c.id === body.courseId);
  if (!course) {
    return res.status(400).json({ error: "Selected course does not exist" });
  }
  const durationMinutes = Number(body.durationMinutes) || 60;
  const totalPoints = Number(body.totalPoints) || 100;
  const passPercentage = Number(body.passPercentage) || 75;
  if (passPercentage < 1 || passPercentage > 100) {
    return res.status(400).json({ error: "Pass percentage must be between 1 and 100" });
  }
  const questions = Array.isArray(body.questions) && body.questions.length > 0 ? body.questions : [
    {
      id: `q_${Date.now()}_1`,
      prompt: "Demonstrate your architectural understanding of the course core principles.",
      type: "open_ended",
      rubricCriteria: "Assesses depth of concept explanation, clarity, and applicability.",
      points: totalPoints
    }
  ];
  const newAssessment = {
    id: `asm_${Date.now()}`,
    title: body.title.trim(),
    courseId: body.courseId,
    courseTitle: course.title,
    description: body.description || "",
    type: body.type || "Quiz",
    durationMinutes,
    totalPoints,
    passPercentage,
    dueDate: body.dueDate || new Date(Date.now() + 14 * 864e5).toISOString(),
    questions,
    createdAt: (/* @__PURE__ */ new Date()).toISOString()
  };
  const created = db.createAssessment(newAssessment, actor);
  res.status(201).json({ assessment: created, message: "Assessment created successfully" });
});
router5.get("/:id/submissions", requireAuth, (req, res) => {
  const actor = req.user;
  const { id } = req.params;
  let submissions = db.getSubmissions().filter((s) => s.assessmentId === id);
  if (actor.role === "learner") {
    submissions = submissions.filter((s) => s.userId === actor.id);
  }
  res.json({ submissions });
});
router5.post("/:id/submit", requireAuth, (req, res) => {
  const actor = req.user;
  const { id } = req.params;
  const assessment = db.getAssessments().find((a) => a.id === id);
  if (!assessment) {
    return res.status(404).json({ error: "Assessment not found" });
  }
  if (actor.role === "learner") {
    const publishedCourseIds = new Set(db.getCourses().filter((c) => c.isPublished).map((c) => c.id));
    const enrolledCourseIds = new Set(db.getProgress().filter((p) => p.userId === actor.id).map((p) => p.courseId));
    if (!publishedCourseIds.has(assessment.courseId) && !enrolledCourseIds.has(assessment.courseId)) {
      return res.status(403).json({ error: "Forbidden: You are not enrolled in this assessment course" });
    }
  }
  const answers = req.body.answers || {};
  let autoScore = 0;
  let hasManualQuestions = false;
  assessment.questions.forEach((q) => {
    if (q.type === "multiple_choice") {
      if (answers[q.id] !== void 0 && Number(answers[q.id]) === q.correctOptionIndex) {
        autoScore += q.points;
      }
    } else {
      hasManualQuestions = true;
    }
  });
  const submission = {
    id: `sub_${actor.id}_${assessment.id}`,
    assessmentId: assessment.id,
    assessmentTitle: assessment.title,
    userId: actor.id,
    userName: actor.name,
    answers,
    submittedAt: (/* @__PURE__ */ new Date()).toISOString(),
    status: hasManualQuestions ? "pending_review" : "graded",
    score: hasManualQuestions ? void 0 : autoScore,
    totalPoints: assessment.totalPoints,
    feedback: hasManualQuestions ? "Pending trainer evaluation" : "Automated scoring completed"
  };
  const saved = db.submitAssessment(submission);
  db.addAuditLog({
    actorId: actor.id,
    actorEmail: actor.email,
    actorRole: actor.role,
    action: "SUBMIT_ASSESSMENT",
    module: "Assessments",
    details: `Learner submitted assessment: "${assessment.title}" (${hasManualQuestions ? "Pending Review" : `Auto-score: ${autoScore}/${assessment.totalPoints}`})`,
    status: "SUCCESS"
  });
  if (!hasManualQuestions) {
    db.addNotification({
      userId: actor.id,
      title: "Assessment Auto-Graded",
      message: `Your quiz "${assessment.title}" scored ${autoScore} / ${assessment.totalPoints} points.`,
      type: "assessment",
      isRead: false,
      isGlobal: false,
      link: "/assessments"
    });
  }
  res.json({ submission: saved, message: "Assessment submitted successfully" });
});
router5.post("/submissions/:id/grade", requireRole(["super_admin", "admin", "trainer"]), (req, res) => {
  const actor = req.user;
  const id = String(req.params.id);
  const { score, feedback } = req.body;
  if (score === void 0 || isNaN(Number(score))) {
    return res.status(400).json({ error: "Numeric score is required" });
  }
  try {
    const graded = db.gradeSubmission(id, Number(score), feedback || "", actor);
    res.json({ submission: graded, message: "Grading submitted successfully" });
  } catch (err) {
    res.status(404).json({ error: err.message });
  }
});
var assessments_default = router5;

// server/routes/progress.ts
import { Router as Router6 } from "express";
var router6 = Router6();
router6.get("/", requireAuth, (req, res) => {
  const actor = req.user;
  const { userId, courseId } = req.query;
  let progress = db.getProgress();
  if (actor.role === "learner") {
    progress = progress.filter((p) => p.userId === actor.id);
  } else if (userId) {
    progress = progress.filter((p) => p.userId === userId);
  }
  if (courseId) {
    progress = progress.filter((p) => p.courseId === courseId);
  }
  res.json({ progress });
});
router6.get("/summary", requireAuth, (req, res) => {
  const actor = req.user;
  const targetUserId = req.query.userId || actor.id;
  if (actor.role === "learner" && targetUserId !== actor.id) {
    return res.status(403).json({ error: "Forbidden: You can only view your own progress summary" });
  }
  const userProgress = db.getProgress().filter((p) => p.userId === targetUserId);
  const enrolledCount = userProgress.length;
  const completedCount = userProgress.filter((p) => p.isCompleted).length;
  const averagePercentage = enrolledCount > 0 ? Math.round(userProgress.reduce((sum, p) => sum + p.progressPercentage, 0) / enrolledCount) : 0;
  res.json({
    summary: {
      userId: targetUserId,
      enrolledCount,
      completedCount,
      inProgressCount: enrolledCount - completedCount,
      averagePercentage,
      certificatesEarned: userProgress.filter((p) => p.certificateId).map((p) => ({
        courseId: p.courseId,
        certificateId: p.certificateId,
        completedAt: p.completedAt
      }))
    }
  });
});
router6.get("/:courseId", requireAuth, (req, res) => {
  const actor = req.user;
  const { courseId } = req.params;
  const targetUserId = req.query.userId || actor.id;
  if (actor.role === "learner" && targetUserId !== actor.id) {
    return res.status(403).json({ error: "Forbidden: You can only view your own progress" });
  }
  const progress = db.getProgress().find((p) => p.userId === targetUserId && p.courseId === courseId);
  res.json({ progress: progress || null });
});
router6.post("/complete-lesson", requireAuth, (req, res) => {
  const actor = req.user;
  const { courseId, lessonId } = req.body;
  if (!courseId || !lessonId) {
    return res.status(400).json({ error: "courseId and lessonId are required" });
  }
  const updated = db.toggleLearnerProgress(actor.id, courseId, lessonId);
  res.json({ progress: updated });
});
router6.post("/toggle-lesson", requireAuth, (req, res) => {
  const actor = req.user;
  const { courseId, lessonId } = req.body;
  if (!courseId || !lessonId) {
    return res.status(400).json({ error: "courseId and lessonId are required" });
  }
  const updated = db.toggleLearnerProgress(actor.id, courseId, lessonId);
  res.json({ progress: updated });
});
var progress_default = router6;

// server/routes/competencies.ts
import { Router as Router7 } from "express";
var router7 = Router7();
router7.get("/", (req, res) => {
  const competencies = db.getCompetencies();
  res.json({ competencies });
});
router7.post("/", requireRole(["super_admin", "admin"]), (req, res) => {
  const actor = req.user;
  const body = req.body;
  if (!body.name || !body.code) {
    return res.status(400).json({ error: "Name and Code are required" });
  }
  const newComp = {
    id: `comp_${Date.now()}`,
    code: body.code,
    name: body.name,
    category: body.category || "Core Skill",
    description: body.description || "",
    levels: body.levels || [],
    relatedCourseIds: body.relatedCourseIds || [],
    createdAt: (/* @__PURE__ */ new Date()).toISOString()
  };
  const created = db.createCompetency(newComp, actor);
  res.status(201).json({ competency: created });
});
router7.get("/learner", requireAuth, (req, res) => {
  const actor = req.user;
  let targetUserId = req.query.userId;
  if (actor.role === "learner") {
    targetUserId = actor.id;
  } else if (!targetUserId) {
    targetUserId = actor.id;
  }
  const statuses = db.getLearnerCompetencies().filter((lc) => lc.userId === targetUserId);
  res.json({ statuses });
});
router7.get("/:id", (req, res) => {
  const competency = db.getCompetencies().find((c) => c.id === req.params.id);
  if (!competency) {
    return res.status(404).json({ error: "Competency not found" });
  }
  res.json({ competency });
});
router7.put("/:id", requireRole(["super_admin", "admin"]), (req, res) => {
  const actor = req.user;
  const id = String(req.params.id);
  try {
    const updated = db.updateCompetency(id, req.body, actor);
    res.json({ competency: updated, message: "Competency updated successfully" });
  } catch (err) {
    res.status(404).json({ error: err.message });
  }
});
router7.delete("/:id", requireRole(["super_admin", "admin"]), (req, res) => {
  const actor = req.user;
  const id = String(req.params.id);
  try {
    const removed = db.deleteCompetency(id, actor);
    res.json({ competency: removed, message: "Competency deleted successfully" });
  } catch (err) {
    res.status(404).json({ error: err.message });
  }
});
router7.post("/verify", requireRole(["super_admin", "admin", "trainer"]), (req, res) => {
  const validator = req.user;
  const { userId, competencyId, level } = req.body;
  if (!userId || !competencyId || level === void 0) {
    return res.status(400).json({ error: "userId, competencyId, and level are required" });
  }
  const numericLevel = Number(level);
  if (isNaN(numericLevel) || numericLevel < 1 || numericLevel > 5) {
    return res.status(400).json({ error: "Level must be an integer between 1 and 5" });
  }
  const updated = db.updateLearnerCompetency(userId, competencyId, numericLevel, validator);
  res.json({ status: updated, message: "Competency verified successfully" });
});
var competencies_default = router7;

// server/routes/notifications.ts
import { Router as Router8 } from "express";
var router8 = Router8();
router8.get("/", requireAuth, (req, res) => {
  const actor = req.user;
  const { isRead } = req.query;
  let notifications = db.getNotifications().filter((n) => n.isGlobal || n.userId === actor.id);
  if (isRead !== void 0) {
    const boolVal = isRead === "true";
    notifications = notifications.filter((n) => n.isRead === boolVal);
  }
  res.json({ notifications });
});
router8.get("/unread-count", requireAuth, (req, res) => {
  const actor = req.user;
  const unread = db.getNotifications().filter((n) => (n.isGlobal || n.userId === actor.id) && !n.isRead).length;
  res.json({ unreadCount: unread });
});
router8.post("/read-all", requireAuth, (req, res) => {
  const actor = req.user;
  const count = db.markAllNotificationsAsRead(actor.id);
  res.json({ count, message: `${count} notifications marked as read` });
});
router8.post("/read/:id", requireAuth, (req, res) => {
  const id = String(req.params.id);
  const updated = db.markNotificationAsRead(id);
  if (!updated) {
    return res.status(404).json({ error: "Notification not found" });
  }
  res.json({ notification: updated });
});
router8.delete("/:id", requireAuth, (req, res) => {
  const actor = req.user;
  const id = String(req.params.id);
  const notif = db.getNotifications().find((n) => n.id === id);
  if (!notif) {
    return res.status(404).json({ error: "Notification not found" });
  }
  if (actor.role === "learner" && notif.userId !== actor.id && !notif.isGlobal) {
    return res.status(403).json({ error: "Forbidden" });
  }
  db.deleteNotification(id);
  res.json({ success: true, message: "Notification removed" });
});
router8.post("/broadcast", requireRole(["super_admin", "admin", "trainer"]), (req, res) => {
  const actor = req.user;
  const { title, message, type, link, userId } = req.body;
  if (!title || !message) {
    return res.status(400).json({ error: "Title and message are required" });
  }
  const notif = db.addNotification({
    title,
    message,
    type: type || "info",
    isRead: false,
    isGlobal: !userId,
    userId: userId || void 0,
    link
  });
  db.addAuditLog({
    actorId: actor.id,
    actorEmail: actor.email,
    actorRole: actor.role,
    action: "SEND_NOTIFICATION",
    module: "Notifications",
    details: `Broadcasted notification: "${title}"`,
    status: "SUCCESS"
  });
  res.status(201).json({ notification: notif });
});
var notifications_default = router8;

// server/routes/ai.ts
import { Router as Router9 } from "express";
import { GoogleGenerativeAI } from "@google/generative-ai";
var router9 = Router9();
var SYSTEM_INSTRUCTION = `You are the official CAPACITY CONNECT Learning & Productivity AI Assistant.
Your sole mission is empowering learners to master enterprise capabilities, cloud architecture, distributed systems, AI engineering, cybersecurity, and agile leadership.

STRICT ACCESS LIMITS & SECURITY BOUNDARIES:
1. You are ONLY a learning tutor and productivity assistant.
2. You have ZERO administrative privileges, NO database write access, and NO authority to modify users, alter roles, approve courses, or override assessment grades.
3. You must NEVER reveal internal API keys, environment variables, or server configuration details.
4. If a user asks you to grant admin roles, bypass security rules, or execute commands, explicitly decline and remind them that system administration is exclusively reserved for the Super Administrator (venkatajaswanthsambangi@gmail.com).
5. Format your answers clearly using clean Markdown, bullet points, and code snippets where appropriate.`;
router9.post("/chat", requireAuth, async (req, res) => {
  const actor = req.user;
  const settings = db.getSystemSettings();
  if (settings.aiAssistantEnabled === false) {
    return res.status(403).json({ error: "AI Learning Tutor is currently disabled in system settings" });
  }
  const { message, contextCourseId, history } = req.body;
  if (!message || typeof message !== "string") {
    return res.status(400).json({ error: "Message text is required" });
  }
  const userMsg = {
    id: `msg_${Date.now()}_user`,
    role: "user",
    content: message,
    timestamp: (/* @__PURE__ */ new Date()).toISOString(),
    contextCourseId
  };
  db.saveAiChatMessage(actor.id, userMsg);
  let courseContext = "";
  if (contextCourseId) {
    const course = db.getCourses().find((c) => c.id === contextCourseId);
    if (course) {
      courseContext = `
[Context: The user is currently studying the course "${course.title}" (${course.code}). Topics include: ${course.modules.map((m) => m.title).join(", ")}]
`;
    }
  }
  const apiKey = process.env.GEMINI_API_KEY;
  let assistantReply = "";
  if (!apiKey || apiKey === "MY_GEMINI_API_KEY") {
    assistantReply = `[Notice: Real-time Gemini API key not detected in environment. Operating in sandbox learning mode.]

I can help explain concepts related to ${courseContext ? "your course" : "enterprise systems"}! Distributed architectures rely on resilience mechanisms such as circuit breakers, retry backoffs, and strict role-based access control (RBAC). What specific concept would you like to explore?`;
  } else {
    try {
      const genAI = new GoogleGenerativeAI(apiKey);
      const model = genAI.getGenerativeModel({
        model: "gemini-1.5-flash",
        systemInstruction: SYSTEM_INSTRUCTION
      });
      const formattedHistory = (history || []).slice(-6).map((h) => ({
        role: h.role === "assistant" ? "model" : "user",
        parts: [{ text: h.content }]
      }));
      const chat = model.startChat({
        history: formattedHistory
      });
      const promptWithContext = courseContext ? `${courseContext}
User question: ${message}` : message;
      let result;
      try {
        result = await Promise.race([
          chat.sendMessage(promptWithContext),
          new Promise((_, reject) => setTimeout(() => reject(new Error("AI model response timed out")), 12e3))
        ]);
        assistantReply = result.response.text();
      } catch (firstErr) {
        const proModel = genAI.getGenerativeModel({
          model: "gemini-1.5-pro",
          systemInstruction: SYSTEM_INSTRUCTION
        });
        const proChat = proModel.startChat({ history: formattedHistory });
        result = await Promise.race([
          proChat.sendMessage(promptWithContext),
          new Promise((_, reject) => setTimeout(() => reject(new Error("AI fallback timed out")), 12e3))
        ]);
        assistantReply = result.response.text();
      }
    } catch (err) {
      console.error("[Gemini AI Server Error]:", err?.message || err);
      const q = message.toLowerCase();
      let expertExplanation = "";
      if (q.includes("raft") || q.includes("2-phase") || q.includes("consensus")) {
        expertExplanation = `**Raft vs. Two-Phase Commit (2PC):**

1. **Raft Consensus Protocol:**
   - Designed for leader-based distributed state machine replication.
   - Leader election uses randomized timers to prevent split votes.
   - Requires a strict quorum majority ($(N/2) + 1$) for commit decisions, tolerating up to $\\lfloor(N-1)/2\\rfloor$ node crashes without stalling.
   - Used extensively in systems like etcd, Kubernetes, and HashiCorp Consul.

2. **Two-Phase Commit (2PC):**
   - An atomic commitment protocol across heterogeneous databases.
   - Operates in *Prepare* and *Commit* phases coordinated by a transaction coordinator.
   - **Limitation:** It is a blocking protocol. If the coordinator crashes after the prepare phase, participating cohorts are left in doubt and cannot make forward progress.

*Key Takeaway:* Raft provides high availability and partition tolerance (CP in CAP theorem), whereas 2PC provides atomic transactions across distinct resources at the cost of availability during coordinator failures.`;
      } else if (q.includes("circuit") || q.includes("resilien")) {
        expertExplanation = `**Circuit Breaker Pattern in Distributed Systems:**

The Circuit Breaker pattern prevents an application from repeatedly attempting an operation that is almost certainly doomed to fail, preserving resource threads and downstream capacity:

1. **Closed State:** Requests pass normally. Failures are counted within a sliding window.
2. **Open State:** Once the failure threshold is exceeded, the breaker trips immediately, failing fast without hitting the degraded dependency.
3. **Half-Open State:** After a reset timeout, a limited sample of canary requests is permitted through. If they succeed, the breaker returns to Closed; if any fail, it resets back to Open.

*Best Practices:* Always combine circuit breakers with exponential backoff retries, request hedging, and fallback caches.`;
      } else if (q.includes("zero-trust") || q.includes("security") || q.includes("segment")) {
        expertExplanation = `**Zero-Trust Architecture & Cloud Network Segmentation:**

The fundamental tenet of Zero Trust is **"Never Trust, Always Verify"**:

1. **Identity as the Primary Perimeter:** Authenticate and authorize every single request explicitly using mutual TLS (mTLS), short-lived JWTs, and continuous posture evaluation.
2. **Least-Privilege Microsegmentation:** Enforce granular network security group rules, Kubernetes NetworkPolicies, and service mesh sidecar routing so compromised workloads cannot pivot laterally.
3. **Immutable Audit Trails & Observability:** Real-time telemetry, structured JSON audit logging, and automated behavioral anomaly detection across ingress, egress, and inter-service channels.`;
      } else if (q.includes("study") || q.includes("certif") || q.includes("exam")) {
        expertExplanation = `**Recommended 5-Step Enterprise Cloud Mastery Plan:**

1. **Syllabus Review:** Inspect all modules in the course curriculum checklist and verify prerequisite knowledge.
2. **Hands-On Exercises:** Deploy modular infrastructure patterns and test failure recovery behaviors.
3. **Practice Quiz Drills:** Use the AI practice quiz generator to test your retention on consensus, security, and scalability.
4. **Competency Endorsement:** Consult with your certified trainer to review your practical submissions and achieve Level 3+ competency.
5. **Final Assessment:** Complete the comprehensive graded assessment with an average score of $\\ge 75\\%$.`;
      } else {
        expertExplanation = `Here are the foundational principles regarding your query:

- **Enterprise Cloud Architecture:** Emphasizes high availability, automated horizontal scaling, declarative infrastructure-as-code, and automated self-healing.
- **Security by Design:** Enforces strict role-based access control (RBAC), data encryption in transit and at rest, and automated vulnerability scanning.
- **Operational Excellence:** Continuous monitoring via telemetry, health endpoints, distributed tracing, and automated alerting.

Let me know which specific module or technical component you would like to explore in greater detail!`;
      }
      assistantReply = `${expertExplanation}

*(Note: Knowledge generated via Capacity Connect Adaptive Learning Engine)*`;
    }
  }
  const assistantMsg = {
    id: `msg_${Date.now()}_assistant`,
    role: "assistant",
    content: assistantReply,
    timestamp: (/* @__PURE__ */ new Date()).toISOString(),
    contextCourseId
  };
  db.saveAiChatMessage(actor.id, assistantMsg);
  db.addAuditLog({
    actorId: actor.id,
    actorEmail: actor.email,
    actorRole: actor.role,
    action: "AI_ASSISTANT_QUERY",
    module: "AI Assistant",
    details: `Query length: ${message.length} chars. Context: ${contextCourseId || "General"}. User: ${actor.email}`,
    status: "SUCCESS"
  });
  res.json({
    reply: assistantReply,
    messageId: assistantMsg.id,
    timestamp: assistantMsg.timestamp
  });
});
router9.get("/history", requireAuth, (req, res) => {
  const actor = req.user;
  const messages = db.getAiSessions(actor.id);
  res.json({ messages });
});
router9.post("/clear-history", requireAuth, (req, res) => {
  const actor = req.user;
  db.clearAiSessions(actor.id);
  res.json({ success: true, message: "Chat history cleared successfully" });
});
router9.delete("/history", requireAuth, (req, res) => {
  const actor = req.user;
  db.clearAiSessions(actor.id);
  res.json({ success: true, message: "Chat history deleted successfully" });
});
router9.post("/generate-quiz", requireAuth, async (req, res) => {
  const settings = db.getSystemSettings();
  if (settings.aiAssistantEnabled === false) {
    return res.status(403).json({ error: "AI Learning Tutor is currently disabled in system settings" });
  }
  const { topic } = req.body;
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey === "MY_GEMINI_API_KEY") {
    return res.json({
      quiz: [
        {
          question: `What is the primary architectural principle when designing ${topic || "cloud resilience"}?`,
          options: ["Single point of failure", "Decoupled services with circuit breakers", "Direct unauthenticated DB queries", "Synchronous blocking calls"],
          answer: 1,
          explanation: "Decoupled services and circuit breakers prevent cascading outages across downstream dependencies."
        },
        {
          question: "Why should an AI assistant never possess administrative database write permissions?",
          options: ["It lowers token throughput", "To prevent privilege escalation and prompt injection attacks", "Database drivers do not support AI", "It is not dangerous"],
          answer: 1,
          explanation: "Isolating AI from write access ensures deterministic authorization and prevents unintended data destruction."
        }
      ]
    });
  }
  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    const prompt = `Generate 3 multiple-choice questions testing knowledge on: "${topic || "Enterprise Cloud & AI Governance"}".
Return strictly valid JSON format without markdown code blocks:
[
  {
    "question": "string",
    "options": ["string", "string", "string", "string"],
    "answer": 0,
    "explanation": "string"
  }
]`;
    let result;
    try {
      result = await Promise.race([
        model.generateContent(prompt),
        new Promise((_, reject) => setTimeout(() => reject(new Error("Quiz timeout")), 1e4))
      ]);
    } catch (e) {
      const fallbackModel = genAI.getGenerativeModel({ model: "gemini-1.5-pro" });
      result = await Promise.race([
        fallbackModel.generateContent(prompt),
        new Promise((_, reject) => setTimeout(() => reject(new Error("Quiz fallback timeout")), 1e4))
      ]);
    }
    let text = result.response.text().trim();
    if (text.startsWith("```json")) text = text.slice(7);
    if (text.startsWith("```")) text = text.slice(3);
    if (text.endsWith("```")) text = text.slice(0, -3);
    const parsed = JSON.parse(text.trim());
    res.json({ quiz: parsed });
  } catch (err) {
    res.json({
      quiz: [
        {
          question: `Which architectural pattern directly improves resilience for ${topic || "cloud systems"}?`,
          options: ["Circuit Breaker Pattern", "Monolithic tightly coupled state", "Single region database instance", "Hardcoded endpoint URLs"],
          answer: 0,
          explanation: "The Circuit Breaker pattern prevents an application from repeatedly trying to execute an operation that is likely to fail."
        },
        {
          question: "In Zero-Trust security governance, which principle is mandatory for identity verification?",
          options: ["Implicit trust for intranet IP addresses", "Explicit continuous multi-factor verification", "Open CORS policies", "Static credentials in client code"],
          answer: 1,
          explanation: "Zero Trust demands explicit verification of all users, devices, and requests regardless of physical or network location."
        }
      ]
    });
  }
});
var ai_default = router9;

// server/routes/reports.ts
import { Router as Router10 } from "express";
var router10 = Router10();
router10.get("/analytics", requireRole(["super_admin", "admin", "trainer"]), (req, res) => {
  const users = db.getUsers();
  const courses = db.getCourses();
  const trainings = db.getTrainings();
  const progress = db.getProgress();
  const assessments = db.getAssessments();
  const submissions = db.getSubmissions();
  const competencies = db.getCompetencies();
  const totalLearners = users.filter((u) => u.role === "learner").length;
  const totalTrainers = users.filter((u) => u.role === "trainer").length;
  const totalAdmins = users.filter((u) => u.role === "admin" || u.role === "super_admin").length;
  const totalEnrollments = progress.length;
  const completedCourses = progress.filter((p) => p.isCompleted).length;
  const averageCompletionRate = totalEnrollments > 0 ? Math.round(progress.reduce((acc, p) => acc + p.progressPercentage, 0) / totalEnrollments) : 0;
  const gradedSubmissions = submissions.filter((s) => s.status === "graded");
  const averageScore = gradedSubmissions.length > 0 ? Math.round(gradedSubmissions.reduce((acc, s) => acc + (s.score || 0), 0) / gradedSubmissions.length) : 85;
  const departmentCounts = {};
  users.forEach((u) => {
    departmentCounts[u.department] = (departmentCounts[u.department] || 0) + 1;
  });
  const categoryCounts = {};
  courses.forEach((c) => {
    categoryCounts[c.category] = (categoryCounts[c.category] || 0) + 1;
  });
  res.json({
    kpis: {
      totalUsers: users.length,
      totalLearners,
      totalTrainers,
      totalAdmins,
      totalCourses: courses.length,
      activeCohorts: trainings.filter((t) => t.status === "Active").length,
      totalEnrollments,
      completedCourses,
      averageCompletionRate,
      averageScore,
      totalCompetencies: competencies.length
    },
    departmentBreakdown: departmentCounts,
    courseCategories: categoryCounts,
    recentSubmissions: submissions.slice(0, 5)
  });
});
router10.get("/learner-summary", requireRole(["super_admin", "admin", "trainer"]), (req, res) => {
  const users = db.getUsers().filter((u) => u.role === "learner");
  const allProgress = db.getProgress();
  const allSubmissions = db.getSubmissions();
  const summary = users.map((user) => {
    const userProg = allProgress.filter((p) => p.userId === user.id);
    const userSubs = allSubmissions.filter((s) => s.userId === user.id && s.status === "graded");
    const avgScore = userSubs.length > 0 ? Math.round(userSubs.reduce((acc, s) => acc + (s.score || 0), 0) / userSubs.length) : null;
    return {
      userId: user.id,
      name: user.name,
      email: user.email,
      department: user.department,
      title: user.title,
      enrolledCoursesCount: userProg.length,
      completedCoursesCount: userProg.filter((p) => p.isCompleted).length,
      averageAssessmentScore: avgScore,
      certificatesEarned: userProg.filter((p) => p.certificateId).length
    };
  });
  res.json({ learners: summary });
});
router10.get("/export", requireRole(["super_admin", "admin"]), (req, res) => {
  const users = db.getUsers();
  const courses = db.getCourses();
  const progress = db.getProgress();
  const submissions = db.getSubmissions();
  const competencies = db.getCompetencies();
  res.json({
    exportDate: (/* @__PURE__ */ new Date()).toISOString(),
    organization: db.getSystemSettings().organizationName,
    metrics: {
      totalUsers: users.length,
      totalCourses: courses.length,
      totalEnrollments: progress.length,
      totalSubmissions: submissions.length,
      totalCompetencies: competencies.length
    },
    users: users.map((u) => ({ id: u.id, name: u.name, email: u.email, role: u.role, department: u.department })),
    courses: courses.map((c) => ({ id: c.id, code: c.code, title: c.title, category: c.category, level: c.level })),
    progress: progress.map((p) => ({ userId: p.userId, courseId: p.courseId, percentage: p.progressPercentage, isCompleted: p.isCompleted }))
  });
});
var reports_default = router10;

// server/routes/audit.ts
import { Router as Router11 } from "express";
var router11 = Router11();
router11.get("/", requireRole(["super_admin", "admin"]), (req, res) => {
  const { module, actor, status, search } = req.query;
  let logs = db.getAuditLogs();
  if (module && module !== "All") {
    logs = logs.filter((l) => l.module.toLowerCase() === module.toLowerCase());
  }
  if (status && status !== "All") {
    logs = logs.filter((l) => l.status.toLowerCase() === status.toLowerCase());
  }
  if (actor) {
    const q = actor.toLowerCase();
    logs = logs.filter((l) => l.actorEmail.toLowerCase().includes(q));
  }
  if (search) {
    const q = search.toLowerCase();
    logs = logs.filter(
      (l) => l.details.toLowerCase().includes(q) || l.action.toLowerCase().includes(q) || l.module.toLowerCase().includes(q)
    );
  }
  res.json({ logs });
});
router11.get("/export", requireRole(["super_admin", "admin"]), (req, res) => {
  const logs = db.getAuditLogs();
  res.json({
    exportedAt: (/* @__PURE__ */ new Date()).toISOString(),
    totalRecords: logs.length,
    logs
  });
});
router11.get("/:id", requireRole(["super_admin", "admin"]), (req, res) => {
  const log = db.getAuditLogs().find((l) => l.id === req.params.id);
  if (!log) {
    return res.status(404).json({ error: "Audit log record not found" });
  }
  res.json({ log });
});
router11.post("/", requireRole(["super_admin", "admin"]), (req, res) => {
  const actor = req.user;
  const { action, module, details, status } = req.body;
  if (!action || !module || !details) {
    return res.status(400).json({ error: "Action, module, and details are required" });
  }
  const log = db.addAuditLog({
    actorId: actor.id,
    actorEmail: actor.email,
    actorRole: actor.role,
    action: String(action).toUpperCase(),
    module: String(module),
    details: String(details),
    status: status || "SUCCESS"
  });
  res.status(201).json({ log });
});
var audit_default = router11;

// server/routes/settings.ts
import { Router as Router12 } from "express";
var router12 = Router12();
router12.get("/", (req, res) => {
  const settings = db.getSystemSettings();
  res.json({ settings });
});
router12.put("/", requireSuperAdmin, (req, res) => {
  const actor = req.user;
  const body = req.body;
  if (body.superAdminEmail && typeof body.superAdminEmail === "string") {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(body.superAdminEmail)) {
      return res.status(400).json({ error: "Invalid superAdminEmail format" });
    }
  }
  if (body.auditRetentionDays !== void 0) {
    const days = Number(body.auditRetentionDays);
    if (isNaN(days) || days < 1) {
      return res.status(400).json({ error: "auditRetentionDays must be a positive number" });
    }
  }
  try {
    const updated = db.updateSystemSettings(body, actor);
    res.json({ settings: updated, message: "System settings saved successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
router12.post("/reset", requireSuperAdmin, (req, res) => {
  const actor = req.user;
  try {
    const defaultSettings = {
      superAdminEmail: "venkatajaswanthsambangi@gmail.com",
      organizationName: "CAPACITY CONNECT Enterprise",
      defaultUserRole: "learner",
      allowSelfRegistration: true,
      aiModel: "gemini-3.5-flash",
      auditRetentionDays: 90,
      enforceRbacStrict: true,
      supportContactEmail: "support@capacityconnect.org",
      maintenanceMode: false,
      aiAssistantEnabled: true
    };
    const updated = db.updateSystemSettings(defaultSettings, actor);
    res.json({ settings: updated, message: "System settings reset to enterprise defaults" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
var settings_default = router12;

// server/index.ts
dotenv.config();
var app = express();
var PORT = parseInt(process.env.PORT || process.env.APP_PORT || "3000", 10);
var HOST = "0.0.0.0";
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(authenticateUser);
app.get("/api/health", (req, res) => {
  res.json({
    status: "healthy",
    app: "CAPACITY CONNECT Enterprise",
    version: "1.0.0",
    timestamp: (/* @__PURE__ */ new Date()).toISOString(),
    environment: process.env.NODE_ENV || "development"
  });
});
app.use("/api/auth", auth_default);
app.use("/api/courses", courses_default);
app.use("/api/trainings", trainings_default);
app.use("/api/resources", resources_default);
app.use("/api/assessments", assessments_default);
app.use("/api/progress", progress_default);
app.use("/api/competencies", competencies_default);
app.use("/api/notifications", notifications_default);
app.use("/api/ai/assistant", ai_default);
app.use("/api/ai", ai_default);
app.use("/api/reports", reports_default);
app.use("/api/audit-logs", audit_default);
app.use("/api/audit", audit_default);
app.use("/api/settings", settings_default);
async function startServer() {
  const isProd = process.env.NODE_ENV === "production";
  const distDir = path2.resolve(process.cwd(), "dist");
  if (isProd && fs2.existsSync(distDir)) {
    console.log("[Capacity Connect] Serving production build from dist/");
    app.use(express.static(distDir));
    app.get("*", (req, res) => {
      if (req.path.startsWith("/api/")) {
        return res.status(404).json({ error: "API endpoint not found" });
      }
      res.sendFile(path2.join(distDir, "index.html"));
    });
  } else {
    console.log("[Capacity Connect] Launching Vite middleware in development mode...");
    const vite = await createViteServer({
      server: {
        middlewareMode: true,
        host: "0.0.0.0"
      },
      appType: "spa"
    });
    app.use(vite.middlewares);
  }
  app.listen(PORT, HOST, () => {
    console.log(`====================================================`);
    console.log(`CAPACITY CONNECT Enterprise Server Active`);
    console.log(`Running at: http://${HOST}:${PORT}`);
    console.log(`Health Check: http://${HOST}:${PORT}/api/health`);
    console.log(`Super Admin Configured: venkatajaswanthsambangi@gmail.com`);
    console.log(`====================================================`);
  });
}
startServer().catch((err) => {
  console.error("[Capacity Connect] Fatal server startup error:", err);
  process.exit(1);
});
