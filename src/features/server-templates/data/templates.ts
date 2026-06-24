import { BookOpen, Gamepad2, Headphones, Sparkles, Users } from "lucide-react";
import type { ServerTemplate } from "@/features/server-templates/types/template";

export const SERVER_TEMPLATES: ServerTemplate[] = [
  {
    id: "community",
    name: "Community Server",
    description:
      "A balanced setup for growing communities — rules, announcements, a social hub and voice rooms out of the box.",
    icon: Users,
    accentColor: "#6366f1",
    tags: ["general", "social", "beginner-friendly"],
    recommended: true,
    roles: [
      { name: "Owner", color: "#f97316" },
      { name: "Admin", color: "#10b981" },
      { name: "Moderator", color: "#3b82f6" },
      { name: "Member", color: "#6b7280" },
    ],
    categories: [
      {
        name: "Information",
        channels: [
          { name: "rules", type: "announcement" },
          { name: "announcements", type: "announcement" },
          { name: "updates", type: "text" },
        ],
      },
      {
        name: "Community",
        channels: [
          { name: "general", type: "text" },
          { name: "media", type: "text" },
          { name: "suggestions", type: "text" },
        ],
      },
      {
        name: "Voice",
        channels: [
          { name: "General", type: "voice" },
          { name: "Gaming", type: "voice" },
        ],
      },
    ],
  },
  {
    id: "gaming",
    name: "Gaming Server",
    description:
      "Built for squads — LFG channels, clip sharing, and multiple voice rooms ready for competitive sessions.",
    icon: Gamepad2,
    accentColor: "#22c55e",
    tags: ["gaming", "competitive", "lfg", "clips"],
    roles: [
      { name: "Owner", color: "#f97316" },
      { name: "Admin", color: "#10b981" },
      { name: "Moderator", color: "#3b82f6" },
      { name: "Gamer", color: "#a855f7" },
      { name: "Member", color: "#6b7280" },
    ],
    categories: [
      {
        name: "Information",
        channels: [
          { name: "rules", type: "announcement" },
          { name: "news", type: "announcement" },
        ],
      },
      {
        name: "Gaming",
        channels: [
          { name: "general-chat", type: "text" },
          { name: "looking-for-group", type: "text" },
          { name: "clips", type: "text" },
        ],
      },
      {
        name: "Voice",
        channels: [
          { name: "Lobby", type: "voice" },
          { name: "Squad 1", type: "voice" },
          { name: "Squad 2", type: "voice" },
        ],
      },
    ],
  },
  {
    id: "creator",
    name: "Creator Server",
    description:
      "For content creators — a space for subscribers, feedback collection, and collaboration channels.",
    icon: Sparkles,
    accentColor: "#ec4899",
    tags: ["content", "creator", "subscribers", "feedback"],
    roles: [
      { name: "Owner", color: "#f97316" },
      { name: "Manager", color: "#10b981" },
      { name: "Moderator", color: "#3b82f6" },
      { name: "Subscriber", color: "#ec4899" },
      { name: "Member", color: "#6b7280" },
    ],
    categories: [
      {
        name: "Community",
        channels: [
          { name: "announcements", type: "announcement" },
          { name: "chat", type: "text" },
        ],
      },
      {
        name: "Content",
        channels: [
          { name: "videos", type: "text" },
          { name: "ideas", type: "text" },
          { name: "feedback", type: "text" },
        ],
      },
      {
        name: "Voice",
        channels: [
          { name: "Creator Room", type: "voice" },
          { name: "Watch Party", type: "voice" },
        ],
      },
    ],
  },
  {
    id: "study",
    name: "Study Server",
    description:
      "Structured for learning — resource sharing, homework help, Q&A and quiet study voice rooms.",
    icon: BookOpen,
    accentColor: "#f59e0b",
    tags: ["education", "study", "homework", "resources"],
    roles: [
      { name: "Teacher", color: "#f59e0b" },
      { name: "Tutor", color: "#10b981" },
      { name: "Student", color: "#3b82f6" },
      { name: "Alumni", color: "#8b5cf6" },
    ],
    categories: [
      {
        name: "General",
        channels: [
          { name: "announcements", type: "announcement" },
          { name: "rules", type: "text" },
        ],
      },
      {
        name: "Study",
        channels: [
          { name: "resources", type: "text" },
          { name: "homework-help", type: "text" },
          { name: "q-and-a", type: "text" },
        ],
      },
      {
        name: "Voice",
        channels: [
          { name: "Study Room 1", type: "voice" },
          { name: "Study Room 2", type: "voice" },
        ],
      },
    ],
  },
  {
    id: "support",
    name: "Support Server",
    description:
      "Designed for customer and community support — ticket flow, FAQ, and a private staff workspace.",
    icon: Headphones,
    accentColor: "#06b6d4",
    tags: ["support", "tickets", "help", "staff"],
    roles: [
      { name: "Owner", color: "#f97316" },
      { name: "Support Lead", color: "#06b6d4" },
      { name: "Support Agent", color: "#3b82f6" },
      { name: "Member", color: "#6b7280" },
    ],
    categories: [
      {
        name: "Info",
        channels: [
          { name: "rules", type: "announcement" },
          { name: "faq", type: "text" },
          { name: "updates", type: "announcement" },
        ],
      },
      {
        name: "Support",
        channels: [
          { name: "open-ticket", type: "text" },
          { name: "report-bug", type: "text" },
        ],
      },
      {
        name: "Staff",
        channels: [
          { name: "staff-chat", type: "text" },
          { name: "closed-tickets", type: "text" },
        ],
      },
    ],
  },
];
