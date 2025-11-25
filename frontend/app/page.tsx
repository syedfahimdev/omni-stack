"use client";

import { motion } from "framer-motion";
import { Database, Network, Workflow, Search } from "lucide-react";

const services = [
  {
    name: "Database",
    description: "Supabase PostgreSQL",
    icon: Database,
    status: "online",
  },
  {
    name: "Vector Store",
    description: "Neo4j Graph Database",
    icon: Network,
    status: "online",
  },
  {
    name: "Orchestrator",
    description: "n8n Workflow Engine",
    icon: Workflow,
    status: "online",
  },
  {
    name: "Search Engine",
    description: "SearXNG Meta Search",
    icon: Search,
    status: "online",
  },
];

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 },
};

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-zinc-950 via-slate-900 to-zinc-950">
      {/* Animated background gradient */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-slate-800/20 via-transparent to-transparent" />

      <div className="relative z-10 flex min-h-screen flex-col items-center justify-center p-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="mb-16 text-center"
        >
          <h1 className="mb-4 bg-gradient-to-r from-slate-200 via-slate-100 to-slate-300 bg-clip-text text-7xl font-bold tracking-tight text-transparent">
            Omni-Stack 5.0
          </h1>
          <p className="text-xl text-slate-400">Enterprise AI Platform</p>
        </motion.div>

        {/* System Status Grid */}
        <motion.div
          variants={container}
          initial="hidden"
          animate="show"
          className="grid w-full max-w-5xl gap-6 md:grid-cols-2"
        >
          {services.map((service) => (
            <motion.div
              key={service.name}
              variants={item}
              whileHover={{ scale: 1.02, y: -4 }}
              className="group relative overflow-hidden rounded-2xl border border-slate-800/50 bg-gradient-to-br from-slate-900/90 to-slate-950/90 p-8 backdrop-blur-xl transition-all duration-300 hover:border-slate-700/50 hover:shadow-2xl hover:shadow-slate-900/50"
            >
              {/* Glassmorphism effect */}
              <div className="absolute inset-0 bg-gradient-to-br from-slate-800/5 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

              <div className="relative z-10 flex items-start justify-between">
                <div className="flex-1">
                  <div className="mb-4 flex items-center gap-4">
                    <div className="rounded-xl bg-slate-800/50 p-3 ring-1 ring-slate-700/50 transition-all duration-300 group-hover:bg-slate-800/80 group-hover:ring-slate-600/50">
                      <service.icon className="h-6 w-6 text-slate-300" />
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold text-slate-100">
                        {service.name}
                      </h3>
                      <p className="text-sm text-slate-500">
                        {service.description}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Pulsating status indicator */}
                <div className="relative">
                  <motion.div
                    animate={{
                      scale: [1, 1.2, 1],
                      opacity: [0.5, 0.8, 0.5],
                    }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      ease: "easeInOut",
                    }}
                    className="absolute inset-0 rounded-full bg-emerald-500/30 blur-md"
                  />
                  <div className="relative h-3 w-3 rounded-full bg-emerald-500 shadow-lg shadow-emerald-500/50" />
                </div>
              </div>

              {/* Status text */}
              <div className="relative z-10 mt-6 flex items-center gap-2 text-sm">
                <span className="text-slate-400">Status:</span>
                <span className="font-medium text-emerald-400">Online</span>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Footer */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8, duration: 0.8 }}
          className="mt-16 text-center text-sm text-slate-500"
        >
          <p>All systems operational</p>
        </motion.div>
      </div>
    </div>
  );
}
