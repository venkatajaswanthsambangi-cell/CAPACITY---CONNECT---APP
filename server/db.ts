import fs from 'fs';
import path from 'path';
import { 
  UserProfile, 
  Course, 
  TrainingCohort, 
  LearningResource, 
  Assessment, 
  AssessmentSubmission, 
  LearnerProgress, 
  Competency, 
  LearnerCompetencyStatus, 
  NotificationItem, 
  AuditLog, 
  SystemSettings, 
  RolePermission,
  AiChatMessage
} from '../src/types';

interface DatabaseSchema {
  users: UserProfile[];
  roles: RolePermission[];
  courses: Course[];
  trainings: TrainingCohort[];
  resources: LearningResource[];
  assessments: Assessment[];
  submissions: AssessmentSubmission[];
  progress: LearnerProgress[];
  competencies: Competency[];
  learner_competencies: LearnerCompetencyStatus[];
  notifications: NotificationItem[];
  audit_logs: AuditLog[];
  system_settings: SystemSettings;
  ai_sessions: Record<string, AiChatMessage[]>;
}

const DATA_DIR = path.resolve(process.cwd(), 'data');
const DB_FILE = path.join(DATA_DIR, 'capacity_connect_db.json');

const INITIAL_SETTINGS: SystemSettings = {
  superAdminEmail: process.env.SUPER_ADMIN_EMAIL || 'venkatajaswanthsambangi@gmail.com',
  organizationName: 'CAPACITY CONNECT Enterprise',
  defaultUserRole: 'learner',
  allowSelfRegistration: true,
  aiModel: 'gemini-3.5-flash',
  auditRetentionDays: 90,
  enforceRbacStrict: true,
  supportContactEmail: 'support@capacityconnect.org',
  maintenanceMode: false,
  aiAssistantEnabled: true
};

const INITIAL_ROLES: RolePermission[] = [
  {
    role: 'super_admin',
    displayName: 'Super Admin',
    description: 'Complete application administration privileges, configuration, and security control.',
    permissions: [
      'users.manage', 'users.roles.assign', 'settings.manage', 'audit.view', 'reports.view',
      'courses.manage', 'trainings.manage', 'resources.manage', 'assessments.manage',
      'competencies.manage', 'notifications.broadcast', 'ai.access'
    ]
  },
  {
    role: 'admin',
    displayName: 'Admin',
    description: 'Operational management across courses, cohorts, trainers, and institutional reporting.',
    permissions: [
      'users.read', 'reports.view', 'courses.manage', 'trainings.manage',
      'resources.manage', 'assessments.manage', 'competencies.manage',
      'notifications.send', 'ai.access'
    ]
  },
  {
    role: 'trainer',
    displayName: 'Trainer',
    description: 'Delivers courses, manages cohorts, reviews submissions, validates competencies.',
    permissions: [
      'courses.read', 'courses.edit_assigned', 'trainings.conduct', 'assessments.grade',
      'competencies.validate', 'resources.create', 'notifications.cohort', 'ai.access'
    ]
  },
  {
    role: 'learner',
    displayName: 'Learner',
    description: 'Accesses learning pathways, submits assessments, tracks progress and competencies.',
    permissions: [
      'courses.enroll', 'courses.learn', 'assessments.submit', 'progress.view_own',
      'resources.view', 'ai.learning_assistant'
    ]
  }
];

const INITIAL_USERS: UserProfile[] = [
  {
    id: 'usr_superadmin',
    email: 'venkatajaswanthsambangi@gmail.com',
    name: 'Venkata Jaswanth Sambangi',
    role: 'super_admin',
    department: 'Enterprise Strategy & Governance',
    title: 'Chief Capacity Architect & Super Admin',
    bio: 'Configured Super Administrator with absolute access control and system governance.',
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200',
    createdAt: new Date(Date.now() - 30 * 86400000).toISOString(),
    updatedAt: new Date().toISOString(),
    isActive: true
  },
  {
    id: 'usr_admin',
    email: 'admin@capacityconnect.org',
    name: 'Elena Rostova',
    role: 'admin',
    department: 'Capacity Operations',
    title: 'Director of Learning Programs',
    bio: 'Oversees enterprise curriculum, trainer allocations, and organizational KPI tracking.',
    avatarUrl: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&q=80&w=200',
    createdAt: new Date(Date.now() - 25 * 86400000).toISOString(),
    updatedAt: new Date().toISOString(),
    isActive: true
  },
  {
    id: 'usr_trainer',
    email: 'trainer@capacityconnect.org',
    name: 'Dr. Marcus Vance',
    role: 'trainer',
    department: 'Cloud & AI Academy',
    title: 'Principal Technical Trainer',
    bio: 'Specialist in distributed cloud architectures, generative AI systems, and microservices.',
    avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=200',
    createdAt: new Date(Date.now() - 20 * 86400000).toISOString(),
    updatedAt: new Date().toISOString(),
    isActive: true
  },
  {
    id: 'usr_learner',
    email: 'learner@capacityconnect.org',
    name: 'Aria Chen',
    role: 'learner',
    department: 'Digital Transformation Cohort',
    title: 'Senior Systems Analyst',
    bio: 'Upskilling in enterprise architecture, DevOps resilience, and AI integration pipelines.',
    avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=200',
    createdAt: new Date(Date.now() - 15 * 86400000).toISOString(),
    updatedAt: new Date().toISOString(),
    isActive: true
  }
];

const INITIAL_COURSES: Course[] = [
  {
    id: 'crs_cloud_arch',
    title: 'Enterprise Cloud Architecture & Distributed Systems',
    code: 'CAP-ARC-401',
    description: 'Master large-scale enterprise cloud patterns, reliability engineering, failover strategies, and microservice orchestration.',
    category: 'Cloud Engineering',
    level: 'Advanced',
    durationHours: 36,
    instructorId: 'usr_trainer',
    instructorName: 'Dr. Marcus Vance',
    thumbnailUrl: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&q=80&w=600',
    competencyIds: ['comp_cloud', 'comp_security'],
    isPublished: true,
    enrolledCount: 48,
    rating: 4.9,
    createdAt: new Date(Date.now() - 20 * 86400000).toISOString(),
    updatedAt: new Date().toISOString(),
    modules: [
      {
        id: 'mod_1',
        title: 'Core Architecture Pillars & High Availability',
        description: 'Multi-region failover, load balancing algorithms, and resilience engineering.',
        order: 1,
        lessons: [
          {
            id: 'les_101',
            title: 'Foundations of Modern Distributed Topologies',
            description: 'Deconstructing monoliths into bounded context microservices.',
            durationMinutes: 45,
            content: 'In distributed systems design, data boundaries determine scalability bottlenecks. We explore CAP theorem trade-offs, consensus algorithms (Raft, Paxos), and zero-trust perimeter segmentation.',
            order: 1
          },
          {
            id: 'les_102',
            title: 'Resilience Patterns: Circuit Breakers & Retries',
            description: 'Implementing fault tolerance using token bucket and exponential backoff.',
            durationMinutes: 60,
            content: 'Prevent cascading failures across upstream dependencies using circuit breakers and bulkhead isolations.',
            order: 2
          }
        ]
      },
      {
        id: 'mod_2',
        title: 'Enterprise Event-Driven Architecture',
        description: 'Kafka, event sourcing, CQRS patterns, and asynchronous messaging pipelines.',
        order: 2,
        lessons: [
          {
            id: 'les_201',
            title: 'Kafka Stream Processing & Schema Registry',
            description: 'Topic partitioning, consumer groups, and Avro serialization.',
            durationMinutes: 50,
            content: 'Event-driven backbone architecture handles million-scale mutations with sub-millisecond dispatch.',
            order: 1
          }
        ]
      }
    ]
  },
  {
    id: 'crs_ai_eng',
    title: 'Enterprise AI Strategy, LLMOps & Gemini Integration',
    code: 'CAP-AI-502',
    description: 'Design and deploy production-grade generative AI workflows, guardrails, retrieval-augmented generation (RAG), and evaluation pipelines.',
    category: 'Artificial Intelligence',
    level: 'Advanced',
    durationHours: 42,
    instructorId: 'usr_trainer',
    instructorName: 'Dr. Marcus Vance',
    thumbnailUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&q=80&w=600',
    competencyIds: ['comp_ai', 'comp_governance'],
    isPublished: true,
    enrolledCount: 64,
    rating: 4.95,
    createdAt: new Date(Date.now() - 18 * 86400000).toISOString(),
    updatedAt: new Date().toISOString(),
    modules: [
      {
        id: 'mod_ai_1',
        title: 'Secure LLM Integration & Enterprise Guardrails',
        description: 'Sanitizing prompts, context isolation, PII masking, and output verification.',
        order: 1,
        lessons: [
          {
            id: 'les_ai_101',
            title: 'Architecture of Secure AI Middlewares',
            description: 'Preventing prompt injection and unauthorized administrative escalation.',
            durationMinutes: 55,
            content: 'LLMs in enterprise software must never receive direct database execution tokens or system management credentials. All operations require deterministic mediation layers.',
            order: 1
          }
        ]
      }
    ]
  },
  {
    id: 'crs_cyber_gov',
    title: 'Enterprise Cybersecurity Governance & Zero-Trust Access',
    code: 'CAP-SEC-303',
    description: 'Institutional security compliance, cryptographic attestation, role-based access control (RBAC), and continuous audit logging.',
    category: 'Security & Compliance',
    level: 'Intermediate',
    durationHours: 30,
    instructorId: 'usr_trainer',
    instructorName: 'Dr. Marcus Vance',
    thumbnailUrl: 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&q=80&w=600',
    competencyIds: ['comp_security', 'comp_governance'],
    isPublished: true,
    enrolledCount: 52,
    rating: 4.85,
    createdAt: new Date(Date.now() - 14 * 86400000).toISOString(),
    updatedAt: new Date().toISOString(),
    modules: [
      {
        id: 'mod_sec_1',
        title: 'Role-Based Authorization & Immutable Auditing',
        description: 'Enforcing least-privilege policies across distributed multi-tenant systems.',
        order: 1,
        lessons: [
          {
            id: 'les_sec_101',
            title: 'RBAC vs ABAC & Token Introspection',
            description: 'Claims validation, cryptographically signed tokens, and session revocations.',
            durationMinutes: 40,
            content: 'Role matrices require strict boundaries between administrative, instructional, and learner personas.',
            order: 1
          }
        ]
      }
    ]
  }
];

const INITIAL_TRAININGS: TrainingCohort[] = [
  {
    id: 'tr_q3_cohort_alpha',
    title: 'Cloud Leadership Cohort Alpha - Fall 2026',
    courseId: 'crs_cloud_arch',
    courseTitle: 'Enterprise Cloud Architecture & Distributed Systems',
    trainerId: 'usr_trainer',
    trainerName: 'Dr. Marcus Vance',
    startDate: '2026-09-01',
    endDate: '2026-10-30',
    meetingSchedule: 'Tuesdays & Thursdays, 16:00 - 18:00 UTC',
    location: 'Virtual Live Labs & Sydney Innovation Hub',
    capacity: 30,
    enrolledLearnerIds: ['usr_learner'],
    status: 'Active',
    createdAt: new Date(Date.now() - 14 * 86400000).toISOString()
  },
  {
    id: 'tr_q3_ai_bootcamp',
    title: 'Generative AI & LLMOps Accelerator',
    courseId: 'crs_ai_eng',
    courseTitle: 'Enterprise AI Strategy, LLMOps & Gemini Integration',
    trainerId: 'usr_trainer',
    trainerName: 'Dr. Marcus Vance',
    startDate: '2026-09-15',
    endDate: '2026-11-15',
    meetingSchedule: 'Mondays & Wednesdays, 14:00 - 16:30 UTC',
    location: 'Virtual Immersive Studio',
    capacity: 25,
    enrolledLearnerIds: ['usr_learner'],
    status: 'Active',
    createdAt: new Date(Date.now() - 10 * 86400000).toISOString()
  }
];

const INITIAL_RESOURCES: LearningResource[] = [
  {
    id: 'res_01',
    title: 'Enterprise Cloud Topology Blueprint 2026',
    category: 'Documentation',
    description: 'Full architectural diagram covering multi-region high availability, API gateways, and microservice meshes.',
    url: 'https://cloud.google.com/architecture',
    fileSize: '4.8 MB PDF',
    tags: ['Cloud', 'Architecture', 'Reliability'],
    authorName: 'Dr. Marcus Vance',
    downloadCount: 238,
    createdAt: new Date(Date.now() - 22 * 86400000).toISOString()
  },
  {
    id: 'res_02',
    title: 'Secure LLM Orchestration & Prompt Guardrails Whitepaper',
    category: 'Research',
    description: 'Comprehensive guidelines on isolating LLM queries from internal databases and preventing privilege escalation.',
    url: 'https://ai.google.dev/docs',
    fileSize: '3.2 MB PDF',
    tags: ['AI', 'Security', 'LLMOps', 'Governance'],
    authorName: 'Dr. Marcus Vance',
    downloadCount: 412,
    createdAt: new Date(Date.now() - 19 * 86400000).toISOString()
  },
  {
    id: 'res_03',
    title: 'Zero-Trust Role-Based Access Control (RBAC) Matrix Template',
    category: 'Template',
    description: 'Standardized operational matrix for separating Super Admin, Admin, Trainer, and Learner permissions.',
    url: 'https://csrc.nist.gov/publications/detail/sp/800-162/final',
    fileSize: '1.1 MB XLSX',
    tags: ['Security', 'RBAC', 'Compliance'],
    authorName: 'Elena Rostova',
    downloadCount: 189,
    createdAt: new Date(Date.now() - 12 * 86400000).toISOString()
  }
];

const INITIAL_ASSESSMENTS: Assessment[] = [
  {
    id: 'asm_cloud_midterm',
    title: 'Cloud Resilience & Failover Simulation Assessment',
    courseId: 'crs_cloud_arch',
    courseTitle: 'Enterprise Cloud Architecture & Distributed Systems',
    description: 'Evaluate practical architectural resilience against region outage scenarios and latency spikes.',
    type: 'Practical_Assignment',
    durationMinutes: 90,
    totalPoints: 100,
    passPercentage: 75,
    dueDate: '2026-09-30T23:59:59Z',
    questions: [
      {
        id: 'q1',
        prompt: 'Which resilience mechanism prevents an overwhelmed downstream service from causing total system collapse?',
        type: 'multiple_choice',
        options: [
          'Aggressive retry loops without backoff',
          'Circuit Breaker pattern with exponential backoff and jitter',
          'Synchronous blocking socket timeouts',
          'Disabling API health checks'
        ],
        correctOptionIndex: 1,
        points: 25
      },
      {
        id: 'q2',
        prompt: 'In a CAP theorem trade-off during network partitioning, what design choice guarantees immediate consistent state across replica sets?',
        type: 'multiple_choice',
        options: [
          'High Availability (AP) with eventual consistency',
          'Strict Consistency (CP) with quorum acknowledgement',
          'Unicast UDP streaming',
          'Ignoring split-brain scenarios'
        ],
        correctOptionIndex: 1,
        points: 25
      },
      {
        id: 'q3',
        prompt: 'Outline your architectural plan for handling a 10x traffic spike on checkout microservices during peak enterprise enrollment.',
        type: 'open_ended',
        rubricCriteria: 'Evaluates autoscale configuration, asynchronous message queuing, database read replicas, and caching strategies.',
        points: 50
      }
    ],
    createdAt: new Date(Date.now() - 15 * 86400000).toISOString()
  },
  {
    id: 'asm_ai_security',
    title: 'AI Guardrails & Safe Integration Quiz',
    courseId: 'crs_ai_eng',
    courseTitle: 'Enterprise AI Strategy, LLMOps & Gemini Integration',
    description: 'Knowledge assessment covering model sandboxing, context isolation, and preventing unintended database execution.',
    type: 'Quiz',
    durationMinutes: 45,
    totalPoints: 50,
    passPercentage: 80,
    dueDate: '2026-10-15T23:59:59Z',
    questions: [
      {
        id: 'q_ai_1',
        prompt: 'Why must an AI assistant NEVER be given administrative database credentials or raw SQL/mutation capabilities?',
        type: 'multiple_choice',
        options: [
          'It makes token consumption slightly higher',
          'Prompt injection could trick the model into executing unauthorized data deletions or role escalations',
          'AI models cannot process structured data',
          'There is no reason; AI models should have full root access'
        ],
        correctOptionIndex: 1,
        points: 25
      },
      {
        id: 'q_ai_2',
        prompt: 'What layer should sit between an LLM and corporate application backends?',
        type: 'multiple_choice',
        options: [
          'A deterministic, permission-validated API middleware that rejects unauthenticated actions',
          'Direct open socket connections to the database master node',
          'None, prompt engineering alone is 100% secure',
          'Unencrypted raw text proxies'
        ],
        correctOptionIndex: 0,
        points: 25
      }
    ],
    createdAt: new Date(Date.now() - 10 * 86400000).toISOString()
  }
];

const INITIAL_SUBMISSIONS: AssessmentSubmission[] = [
  {
    id: 'sub_aria_01',
    assessmentId: 'asm_cloud_midterm',
    assessmentTitle: 'Cloud Resilience & Failover Simulation Assessment',
    userId: 'usr_learner',
    userName: 'Aria Chen',
    answers: {
      q1: 1,
      q2: 1,
      q3: 'I implement a decoupled architecture using Kafka queues for transaction buffering, Redis cluster for session cache, and Cloud Run autoscaling from 10 to 120 container instances with p99 latency alerts at 250ms.'
    },
    submittedAt: new Date(Date.now() - 3 * 86400000).toISOString(),
    status: 'graded',
    score: 95,
    totalPoints: 100,
    feedback: 'Outstanding architectural clarity, precise understanding of backpressure buffering and autoscale triggers.',
    gradedBy: 'usr_trainer',
    gradedAt: new Date(Date.now() - 2 * 86400000).toISOString()
  }
];

const INITIAL_PROGRESS: LearnerProgress[] = [
  {
    id: 'prog_aria_cloud',
    userId: 'usr_learner',
    courseId: 'crs_cloud_arch',
    enrolledAt: new Date(Date.now() - 14 * 86400000).toISOString(),
    completedLessonIds: ['les_101', 'les_102'],
    progressPercentage: 66,
    lastAccessedAt: new Date().toISOString(),
    isCompleted: false
  },
  {
    id: 'prog_aria_ai',
    userId: 'usr_learner',
    courseId: 'crs_ai_eng',
    enrolledAt: new Date(Date.now() - 10 * 86400000).toISOString(),
    completedLessonIds: ['les_ai_101'],
    progressPercentage: 50,
    lastAccessedAt: new Date().toISOString(),
    isCompleted: false
  }
];

const INITIAL_COMPETENCIES: Competency[] = [
  {
    id: 'comp_cloud',
    code: 'COMP-ARC-01',
    name: 'Distributed Cloud Systems & Resiliency',
    category: 'Technical Architecture',
    description: 'Ability to architect, deploy, and maintain fault-tolerant, scalable distributed systems across multi-region environments.',
    levels: [
      { level: 1, name: 'Foundational', description: 'Understands basic virtualization, container concepts, and single-region deployments.', criteria: ['Deploys containers', 'Configures basic VPC'] },
      { level: 2, name: 'Practitioner', description: 'Configures load balancers, managed databases, and multi-tier network security groups.', criteria: ['Sets up SSL/TLS termination', 'Configures auto-scaling groups'] },
      { level: 3, name: 'Proficient', description: 'Designs zero-downtime blue/green deployments and distributed caching tiers.', criteria: ['Executes chaos experiments', 'Tunes Redis/Memcached hit ratios'] },
      { level: 4, name: 'Advanced', description: 'Architects multi-region active-active topologies with automated geo-DNS failover.', criteria: ['Designs cross-region DB sync', 'Formulates disaster recovery RTO/RPO'] },
      { level: 5, name: 'Master', description: 'Sets global enterprise engineering standards and mentors principal architects.', criteria: ['Authors organizational architecture principles', 'Advises C-level technology roadmap'] }
    ],
    relatedCourseIds: ['crs_cloud_arch'],
    createdAt: new Date(Date.now() - 30 * 86400000).toISOString()
  },
  {
    id: 'comp_ai',
    code: 'COMP-AI-02',
    name: 'Enterprise Generative AI & LLMOps',
    category: 'Applied AI',
    description: 'Capability to securely integrate foundation models, build robust guardrails, and evaluate production inference pipelines.',
    levels: [
      { level: 1, name: 'Awareness', description: 'Familiarity with prompt engineering fundamentals and token limits.', criteria: ['Constructs zero-shot & few-shot prompts'] },
      { level: 2, name: 'Integrator', description: 'Integrates model APIs with server-side SDKs and handles streaming tokens.', criteria: ['Calls Gemini REST/SDK', 'Handles rate-limits gracefully'] },
      { level: 3, name: 'Specialist', description: 'Designs Retrieval-Augmented Generation (RAG) pipelines with vector embeddings.', criteria: ['Implements semantic vector search', 'Constructs chunking strategies'] },
      { level: 4, name: 'Architect', description: 'Implements enterprise guardrails, prompt injection defenses, and latency optimizations.', criteria: ['Enforces output validation schemas', 'Integrates model telemetry'] },
      { level: 5, name: 'Authority', description: 'Leads organizational AI ethics, governance boards, and proprietary fine-tuning programs.', criteria: ['Audits model safety and bias', 'Defines enterprise AI policy'] }
    ],
    relatedCourseIds: ['crs_ai_eng'],
    createdAt: new Date(Date.now() - 30 * 86400000).toISOString()
  },
  {
    id: 'comp_security',
    code: 'COMP-SEC-03',
    name: 'Identity Governance & Zero-Trust RBAC',
    category: 'Security & Governance',
    description: 'Designing role-based access control, cryptographic verification, and tamper-evident audit logging systems.',
    levels: [
      { level: 1, name: 'Basic', description: 'Understands authentication vs authorization principles.', criteria: ['Manages passwords & MFA'] },
      { level: 2, name: 'Applied', description: 'Applies token claims and role guards in web/API routes.', criteria: ['Configures JWT validation'] },
      { level: 3, name: 'Advanced', description: 'Constructs dynamic policy engines (RBAC + ABAC) and granular permissions.', criteria: ['Writes Firestore Security Rules', 'Implements scoped session tokens'] },
      { level: 4, name: 'Expert', description: 'Conducts threat modeling, pen testing, and privilege escalation mitigation.', criteria: ['Audits authentication pipelines', 'Enforces least-privilege automation'] },
      { level: 5, name: 'Fellow', description: 'Directs global compliance frameworks (SOC2, ISO27001, FedRAMP).', criteria: ['Leads institutional compliance certifications'] }
    ],
    relatedCourseIds: ['crs_cyber_gov', 'crs_cloud_arch'],
    createdAt: new Date(Date.now() - 30 * 86400000).toISOString()
  }
];

const INITIAL_LEARNER_COMPETENCIES: LearnerCompetencyStatus[] = [
  {
    userId: 'usr_learner',
    competencyId: 'comp_cloud',
    competencyName: 'Distributed Cloud Systems & Resiliency',
    currentLevel: 3,
    verifiedBy: 'usr_trainer',
    verifiedAt: new Date(Date.now() - 5 * 86400000).toISOString()
  },
  {
    userId: 'usr_learner',
    competencyId: 'comp_ai',
    competencyName: 'Enterprise Generative AI & LLMOps',
    currentLevel: 2,
    verifiedBy: 'usr_trainer',
    verifiedAt: new Date(Date.now() - 2 * 86400000).toISOString()
  }
];

const INITIAL_NOTIFICATIONS: NotificationItem[] = [
  {
    id: 'notif_welcome',
    title: 'CAPACITY CONNECT Core Initialized',
    message: 'Welcome to CAPACITY CONNECT! Super Admin privileges have been established for venkatajaswanthsambangi@gmail.com.',
    type: 'system',
    isRead: false,
    isGlobal: true,
    createdAt: new Date().toISOString()
  },
  {
    id: 'notif_asm_graded',
    userId: 'usr_learner',
    title: 'Assessment Graded',
    message: 'Dr. Marcus Vance graded your "Cloud Resilience & Failover Simulation" submission with a score of 95/100.',
    type: 'assessment',
    isRead: false,
    isGlobal: false,
    link: '/assessments',
    createdAt: new Date(Date.now() - 2 * 86400000).toISOString()
  },
  {
    id: 'notif_cohort_alert',
    title: 'New Fall 2026 Cohorts Open for Enrollment',
    message: 'Registrations are now active for Enterprise Cloud Architecture and Generative AI Accelerator cohorts.',
    type: 'info',
    isRead: false,
    isGlobal: true,
    link: '/trainings',
    createdAt: new Date(Date.now() - 1 * 86400000).toISOString()
  }
];

const INITIAL_AUDIT_LOGS: AuditLog[] = [
  {
    id: 'aud_boot',
    timestamp: new Date(Date.now() - 3600000).toISOString(),
    actorId: 'usr_superadmin',
    actorEmail: 'venkatajaswanthsambangi@gmail.com',
    actorRole: 'super_admin',
    action: 'SYSTEM_BOOTSTRAP',
    module: 'System Settings',
    details: 'Capacity Connect database initialized with configured Super Admin email and strict RBAC enforcement.',
    ipAddress: '127.0.0.1',
    status: 'SUCCESS'
  },
  {
    id: 'aud_role_grant',
    timestamp: new Date(Date.now() - 3000000).toISOString(),
    actorId: 'usr_superadmin',
    actorEmail: 'venkatajaswanthsambangi@gmail.com',
    actorRole: 'super_admin',
    action: 'RBAC_VALIDATION',
    module: 'RBAC Access Control',
    details: 'Verified role permissions hierarchy: Super Admin (12), Admin (9), Trainer (8), Learner (6).',
    ipAddress: '127.0.0.1',
    status: 'SUCCESS'
  }
];

class PersistentDatabase {
  private data: DatabaseSchema;

  constructor() {
    this.data = this.loadData();
  }

  private loadData(): DatabaseSchema {
    try {
      if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR, { recursive: true });
      }

      if (fs.existsSync(DB_FILE)) {
        const raw = fs.readFileSync(DB_FILE, 'utf-8');
        const parsed = JSON.parse(raw) as Partial<DatabaseSchema>;
        // Merge with defaults to guarantee all collections exist
        const loaded: DatabaseSchema = {
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
          system_settings: { ...INITIAL_SETTINGS, ...(parsed.system_settings || {}) },
          ai_sessions: parsed.ai_sessions || {}
        };
        // Always ensure configured Super Admin email is set and has super_admin role
        this.ensureSuperAdminUser(loaded);
        return loaded;
      }
    } catch (err) {
      console.error('[DB] Failed to load data from disk, falling back to seed:', err);
    }

    const defaultData: DatabaseSchema = {
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

  private ensureSuperAdminUser(db: DatabaseSchema) {
    const superAdminEmail = db.system_settings.superAdminEmail.toLowerCase().trim();
    let superAdmin = db.users.find(u => u.email.toLowerCase().trim() === superAdminEmail);
    if (!superAdmin) {
      superAdmin = {
        id: 'usr_superadmin',
        email: superAdminEmail,
        name: 'Venkata Jaswanth Sambangi',
        role: 'super_admin',
        department: 'Executive Governance',
        title: 'Super Administrator',
        bio: 'Configured Super Administrator with absolute permissions.',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        isActive: true
      };
      db.users.unshift(superAdmin);
    } else {
      superAdmin.role = 'super_admin';
    }
  }

  public saveData(customData?: DatabaseSchema) {
    try {
      if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR, { recursive: true });
      }
      const dataToSave = customData || this.data;
      fs.writeFileSync(DB_FILE, JSON.stringify(dataToSave, null, 2), 'utf-8');
    } catch (err) {
      console.error('[DB] Failed to write database to disk:', err);
    }
  }

  // Audit logging utility
  public addAuditLog(entry: Omit<AuditLog, 'id' | 'timestamp'>) {
    const log: AuditLog = {
      ...entry,
      id: `aud_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      timestamp: new Date().toISOString()
    };
    this.data.audit_logs.unshift(log);
    // Maintain retention limit
    if (this.data.audit_logs.length > 500) {
      this.data.audit_logs = this.data.audit_logs.slice(0, 500);
    }
    this.saveData();
    return log;
  }

  // Getters
  public getUsers() { return this.data.users; }
  public getRoles() { return this.data.roles; }
  public getCourses() { return this.data.courses; }
  public getTrainings() { return this.data.trainings; }
  public getResources() { return this.data.resources; }
  public getAssessments() { return this.data.assessments; }
  public getSubmissions() { return this.data.submissions; }
  public getProgress() { return this.data.progress; }
  public getCompetencies() { return this.data.competencies; }
  public getLearnerCompetencies() { return this.data.learner_competencies; }
  public getNotifications() { return this.data.notifications; }
  public getAuditLogs() { return this.data.audit_logs; }
  public getSystemSettings() { return this.data.system_settings; }
  public getAiSessions(userId: string) { return this.data.ai_sessions[userId] || []; }

  // Mutations
  public updateSystemSettings(newSettings: Partial<SystemSettings>, actor: UserProfile) {
    this.data.system_settings = { ...this.data.system_settings, ...newSettings };
    this.ensureSuperAdminUser(this.data);
    this.addAuditLog({
      actorId: actor.id,
      actorEmail: actor.email,
      actorRole: actor.role,
      action: 'UPDATE_SYSTEM_SETTINGS',
      module: 'System Settings',
      details: `Updated settings: ${Object.keys(newSettings).join(', ')}`,
      status: 'SUCCESS'
    });
    this.saveData();
    return this.data.system_settings;
  }

  public setUserRole(userId: string, newRole: UserProfile['role'], actor: UserProfile) {
    const user = this.data.users.find(u => u.id === userId);
    if (!user) throw new Error('User not found');
    const oldRole = user.role;
    user.role = newRole;
    user.updatedAt = new Date().toISOString();

    this.addAuditLog({
      actorId: actor.id,
      actorEmail: actor.email,
      actorRole: actor.role,
      action: 'CHANGE_USER_ROLE',
      module: 'RBAC Access Control',
      details: `Changed role of user ${user.email} from ${oldRole} to ${newRole}`,
      status: 'SUCCESS'
    });
    this.saveData();
    return user;
  }

  public upsertUser(user: UserProfile) {
    const index = this.data.users.findIndex(u => u.id === user.id || u.email.toLowerCase() === user.email.toLowerCase());
    if (index >= 0) {
      this.data.users[index] = { ...this.data.users[index], ...user, updatedAt: new Date().toISOString() };
      this.saveData();
      return this.data.users[index];
    } else {
      this.data.users.push(user);
      this.saveData();
      return user;
    }
  }

  public createCourse(course: Course, actor: UserProfile) {
    this.data.courses.unshift(course);
    this.addAuditLog({
      actorId: actor.id,
      actorEmail: actor.email,
      actorRole: actor.role,
      action: 'CREATE_COURSE',
      module: 'Course Management',
      details: `Created new course: "${course.title}" (${course.code})`,
      status: 'SUCCESS'
    });
    this.saveData();
    return course;
  }

  public updateCourse(courseId: string, updates: Partial<Course>, actor: UserProfile) {
    const index = this.data.courses.findIndex(c => c.id === courseId);
    if (index === -1) throw new Error('Course not found');
    this.data.courses[index] = { ...this.data.courses[index], ...updates, updatedAt: new Date().toISOString() };
    this.addAuditLog({
      actorId: actor.id,
      actorEmail: actor.email,
      actorRole: actor.role,
      action: 'UPDATE_COURSE',
      module: 'Course Management',
      details: `Updated course: "${this.data.courses[index].title}"`,
      status: 'SUCCESS'
    });
    this.saveData();
    return this.data.courses[index];
  }

  public deleteCourse(courseId: string, actor: UserProfile) {
    const index = this.data.courses.findIndex(c => c.id === courseId);
    if (index === -1) throw new Error('Course not found');
    const removed = this.data.courses.splice(index, 1)[0];
    this.addAuditLog({
      actorId: actor.id,
      actorEmail: actor.email,
      actorRole: actor.role,
      action: 'DELETE_COURSE',
      module: 'Course Management',
      details: `Deleted course: "${removed.title}"`,
      status: 'SUCCESS'
    });
    this.saveData();
    return removed;
  }

  public createTraining(training: TrainingCohort, actor: UserProfile) {
    this.data.trainings.unshift(training);
    this.addAuditLog({
      actorId: actor.id,
      actorEmail: actor.email,
      actorRole: actor.role,
      action: 'CREATE_TRAINING_COHORT',
      module: 'Training Management',
      details: `Created cohort: "${training.title}"`,
      status: 'SUCCESS'
    });
    this.saveData();
    return training;
  }

  public enrollInTraining(trainingId: string, learnerId: string, actor: UserProfile) {
    const training = this.data.trainings.find(t => t.id === trainingId);
    if (!training) throw new Error('Training cohort not found');
    if (!training.enrolledLearnerIds.includes(learnerId)) {
      training.enrolledLearnerIds.push(learnerId);
      this.saveData();
    }
    return training;
  }

  public createResource(resource: LearningResource, actor: UserProfile) {
    this.data.resources.unshift(resource);
    this.addAuditLog({
      actorId: actor.id,
      actorEmail: actor.email,
      actorRole: actor.role,
      action: 'CREATE_RESOURCE',
      module: 'Learning Resources',
      details: `Added resource: "${resource.title}"`,
      status: 'SUCCESS'
    });
    this.saveData();
    return resource;
  }

  public createAssessment(assessment: Assessment, actor: UserProfile) {
    this.data.assessments.unshift(assessment);
    this.addAuditLog({
      actorId: actor.id,
      actorEmail: actor.email,
      actorRole: actor.role,
      action: 'CREATE_ASSESSMENT',
      module: 'Assessments',
      details: `Created assessment: "${assessment.title}"`,
      status: 'SUCCESS'
    });
    this.saveData();
    return assessment;
  }

  public updateAssessment(id: string, updates: Partial<Assessment>, actor: UserProfile) {
    const index = this.data.assessments.findIndex(a => a.id === id);
    if (index === -1) throw new Error('Assessment not found');
    this.data.assessments[index] = {
      ...this.data.assessments[index],
      ...updates,
      id
    };
    this.addAuditLog({
      actorId: actor.id,
      actorEmail: actor.email,
      actorRole: actor.role,
      action: 'UPDATE_ASSESSMENT',
      module: 'Assessments',
      details: `Updated assessment: "${this.data.assessments[index].title}"`,
      status: 'SUCCESS'
    });
    this.saveData();
    return this.data.assessments[index];
  }

  public deleteAssessment(id: string, actor: UserProfile) {
    const index = this.data.assessments.findIndex(a => a.id === id);
    if (index === -1) throw new Error('Assessment not found');
    const removed = this.data.assessments.splice(index, 1)[0];
    this.addAuditLog({
      actorId: actor.id,
      actorEmail: actor.email,
      actorRole: actor.role,
      action: 'DELETE_ASSESSMENT',
      module: 'Assessments',
      details: `Deleted assessment: "${removed.title}"`,
      status: 'SUCCESS'
    });
    this.saveData();
    return removed;
  }

  public submitAssessment(submission: AssessmentSubmission) {
    const existingIndex = this.data.submissions.findIndex(s => s.id === submission.id);
    if (existingIndex >= 0) {
      this.data.submissions[existingIndex] = submission;
    } else {
      this.data.submissions.unshift(submission);
    }
    this.saveData();
    return submission;
  }

  public gradeSubmission(submissionId: string, score: number, feedback: string, trainer: UserProfile) {
    const sub = this.data.submissions.find(s => s.id === submissionId);
    if (!sub) throw new Error('Submission not found');
    sub.score = score;
    sub.feedback = feedback;
    sub.status = 'graded';
    sub.gradedBy = trainer.name;
    sub.gradedAt = new Date().toISOString();

    // Trigger notification for learner
    this.addNotification({
      userId: sub.userId,
      title: 'Assessment Graded',
      message: `${trainer.name} graded your submission for "${sub.assessmentTitle}": Score ${score}/${sub.totalPoints}`,
      type: 'assessment',
      isRead: false,
      isGlobal: false,
      link: '/assessments'
    });

    this.addAuditLog({
      actorId: trainer.id,
      actorEmail: trainer.email,
      actorRole: trainer.role,
      action: 'GRADE_ASSESSMENT',
      module: 'Assessments',
      details: `Graded submission ${sub.id} for ${sub.userName}: ${score}/${sub.totalPoints}`,
      status: 'SUCCESS'
    });

    this.saveData();
    return sub;
  }

  public updateLearnerProgress(userId: string, courseId: string, lessonId: string) {
    let progress = this.data.progress.find(p => p.userId === userId && p.courseId === courseId);
    const course = this.data.courses.find(c => c.id === courseId);
    const totalLessons = course ? course.modules.reduce((sum, m) => sum + m.lessons.length, 0) : 1;

    if (!progress) {
      progress = {
        id: `prog_${userId}_${courseId}`,
        userId,
        courseId,
        enrolledAt: new Date().toISOString(),
        completedLessonIds: [lessonId],
        progressPercentage: Math.round((1 / Math.max(1, totalLessons)) * 100),
        lastAccessedAt: new Date().toISOString(),
        isCompleted: totalLessons <= 1
      };
      this.data.progress.push(progress);
    } else {
      if (!progress.completedLessonIds.includes(lessonId)) {
        progress.completedLessonIds.push(lessonId);
      }
      progress.progressPercentage = Math.round((progress.completedLessonIds.length / Math.max(1, totalLessons)) * 100);
      progress.lastAccessedAt = new Date().toISOString();
      if (progress.progressPercentage >= 100) {
        progress.isCompleted = true;
        progress.completedAt = new Date().toISOString();
        progress.certificateId = `CERT-CAP-${Date.now().toString(36).toUpperCase()}`;
      }
    }
    this.saveData();
    return progress;
  }

  public toggleLearnerProgress(userId: string, courseId: string, lessonId: string) {
    let progress = this.data.progress.find(p => p.userId === userId && p.courseId === courseId);
    const course = this.data.courses.find(c => c.id === courseId);
    const totalLessons = course ? course.modules.reduce((sum, m) => sum + m.lessons.length, 0) : 1;

    if (!progress) {
      return this.updateLearnerProgress(userId, courseId, lessonId);
    }

    if (progress.completedLessonIds.includes(lessonId)) {
      progress.completedLessonIds = progress.completedLessonIds.filter(id => id !== lessonId);
      progress.isCompleted = false;
      progress.completedAt = undefined;
    } else {
      progress.completedLessonIds.push(lessonId);
    }

    progress.progressPercentage = Math.round((progress.completedLessonIds.length / Math.max(1, totalLessons)) * 100);
    progress.lastAccessedAt = new Date().toISOString();
    if (progress.progressPercentage >= 100) {
      progress.isCompleted = true;
      progress.completedAt = new Date().toISOString();
      if (!progress.certificateId) {
        progress.certificateId = `CERT-CAP-${Date.now().toString(36).toUpperCase()}`;
      }
    }
    this.saveData();
    return progress;
  }

  public createCompetency(competency: Competency, actor: UserProfile) {
    this.data.competencies.unshift(competency);
    this.addAuditLog({
      actorId: actor.id,
      actorEmail: actor.email,
      actorRole: actor.role,
      action: 'CREATE_COMPETENCY',
      module: 'Competencies',
      details: `Added competency: "${competency.name}" (${competency.code})`,
      status: 'SUCCESS'
    });
    this.saveData();
    return competency;
  }

  public updateCompetency(id: string, updates: Partial<Competency>, actor: UserProfile) {
    const index = this.data.competencies.findIndex(c => c.id === id);
    if (index === -1) throw new Error('Competency not found');
    this.data.competencies[index] = {
      ...this.data.competencies[index],
      ...updates,
      id
    };
    this.addAuditLog({
      actorId: actor.id,
      actorEmail: actor.email,
      actorRole: actor.role,
      action: 'UPDATE_COMPETENCY',
      module: 'Competencies',
      details: `Updated competency: "${this.data.competencies[index].name}"`,
      status: 'SUCCESS'
    });
    this.saveData();
    return this.data.competencies[index];
  }

  public deleteCompetency(id: string, actor: UserProfile) {
    const index = this.data.competencies.findIndex(c => c.id === id);
    if (index === -1) throw new Error('Competency not found');
    const removed = this.data.competencies.splice(index, 1)[0];
    this.addAuditLog({
      actorId: actor.id,
      actorEmail: actor.email,
      actorRole: actor.role,
      action: 'DELETE_COMPETENCY',
      module: 'Competencies',
      details: `Deleted competency: "${removed.name}" (${removed.code})`,
      status: 'SUCCESS'
    });
    this.saveData();
    return removed;
  }

  public updateLearnerCompetency(userId: string, competencyId: string, level: number, validator: UserProfile) {
    const comp = this.data.competencies.find(c => c.id === competencyId);
    let record = this.data.learner_competencies.find(lc => lc.userId === userId && lc.competencyId === competencyId);
    if (!record) {
      record = {
        userId,
        competencyId,
        competencyName: comp ? comp.name : 'Unknown Competency',
        currentLevel: level,
        verifiedBy: validator.name,
        verifiedAt: new Date().toISOString()
      };
      this.data.learner_competencies.push(record);
    } else {
      record.currentLevel = level;
      record.verifiedBy = validator.name;
      record.verifiedAt = new Date().toISOString();
    }
    this.saveData();
    return record;
  }

  public addNotification(item: Omit<NotificationItem, 'id' | 'createdAt'>) {
    const notif: NotificationItem = {
      ...item,
      id: `notif_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      createdAt: new Date().toISOString()
    };
    this.data.notifications.unshift(notif);
    this.saveData();
    return notif;
  }

  public markNotificationAsRead(id: string) {
    const notif = this.data.notifications.find(n => n.id === id);
    if (notif) {
      notif.isRead = true;
      this.saveData();
    }
    return notif;
  }

  public markAllNotificationsAsRead(userId: string) {
    let count = 0;
    this.data.notifications.forEach(n => {
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

  public deleteNotification(id: string) {
    const index = this.data.notifications.findIndex(n => n.id === id);
    if (index === -1) return false;
    this.data.notifications.splice(index, 1);
    this.saveData();
    return true;
  }

  public saveAiChatMessage(userId: string, message: AiChatMessage) {
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

  public clearAiSessions(userId: string) {
    if (this.data.ai_sessions[userId]) {
      this.data.ai_sessions[userId] = [];
      this.saveData();
    }
    return true;
  }
}

export const db = new PersistentDatabase();
