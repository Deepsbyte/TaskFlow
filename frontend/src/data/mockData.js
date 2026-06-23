export const APP_DATA = {
  tasks: [
    {
      id: "TIS-101",
      title: "Initialize orbital landing sequence",
      priority: "Critical",
      status: "To Do",
      assignee: "JS",
      dueDate: "2026-05-12",
      tags: ["Engine", "Physics"],
      points: 8,
      sprint: "Sprint 12",
      description: "Finalize the landing trajectory algorithms for the Mars rover landing module."
    },
    {
      id: "TIS-102",
      title: "Atmospheric sensor calibration",
      priority: "High",
      status: "In Progress",
      assignee: "MK",
      dueDate: "2026-05-10",
      tags: ["Sensor", "Calibration"],
      points: 5,
      sprint: "Sprint 12",
      description: "Calibrate the pressure and temperature sensors for the Martian environment."
    },
    {
      id: "TIS-103",
      title: "Satellite link optimization",
      priority: "Medium",
      status: "In Progress",
      assignee: "AL",
      dueDate: "2026-05-15",
      tags: ["Comm", "Network"],
      points: 3,
      sprint: "Sprint 12",
      description: "Improve latency for the deep space network communication relay."
    },
    {
      id: "TIS-104",
      title: "Fuel cell efficiency audit",
      priority: "Low",
      status: "Done",
      assignee: "JS",
      dueDate: "2026-05-01",
      tags: ["Power", "Audit"],
      points: 2,
      sprint: "Sprint 11",
      description: "Quarterly review of fuel cell performance and degradation rates."
    },
    {
      id: "TIS-105",
      title: "Lunar habitat oxygen monitoring",
      priority: "Critical",
      status: "In Review",
      assignee: "MK",
      dueDate: "2026-05-08",
      tags: ["Safety", "LSS"],
      points: 8,
      sprint: "Sprint 12",
      description: "Update the life support system monitoring dash for habitat B."
    },
    {
      id: "TIS-106",
      title: "Ground control UI refinement",
      priority: "Medium",
      status: "To Do",
      assignee: "AL",
      dueDate: "2026-05-20",
      tags: ["UI", "Ops"],
      points: 5,
      sprint: "Sprint 13",
      description: "Implement dark mode across the telemetry visualization dashboard."
    },
    {
      id: "TIS-107",
      title: "Thermal shield stress test",
      priority: "High",
      status: "Done",
      assignee: "JS",
      dueDate: "2026-04-28",
      tags: ["Hardware", "Test"],
      points: 13,
      sprint: "Sprint 11",
      description: "Simulation of re-entry temperatures on the new ceramic composite shield."
    },
    {
      id: "TIS-108",
      title: "Navigation backup protocol",
      priority: "Medium",
      status: "In Review",
      assignee: "AL",
      dueDate: "2026-05-09",
      tags: ["Software", "Safety"],
      points: 5,
      sprint: "Sprint 12",
      description: "Failover logic for star-tracker navigation failure."
    }
  ],
  team: [
    { id: "JS", name: "John Stellar", role: "Admin", email: "john@space.com" },
    { id: "MK", name: "Maria Kepler", role: "Developer", email: "maria@space.com" },
    { id: "AL", name: "Andre Luna", role: "Developer", email: "andre@space.com" }
  ],
  commits: [
    { hash: "8f2a1b", message: "feat: update orbital trajectory math", author: "JS", time: "2h ago" },
    { hash: "4c5d3e", message: "fix: sensor timeout logic", author: "MK", time: "5h ago" },
    { hash: "9a0b1c", message: "refactor: simplify telemetry packets", author: "AL", time: "1d ago" },
    { hash: "2e3f4g", message: "chore: update dependencies", author: "JS", time: "2d ago" },
    { hash: "6h7i8j", message: "docs: update mission manual", author: "MK", time: "3d ago" }
  ],
  prs: [
    { id: 1, title: "Optimize heat shield data processing", status: "Open", reviews: 2, comments: 5, author: "MK" },
    { id: 2, title: "Implement dark mode for ops portal", status: "Open", reviews: 1, comments: 2, author: "AL" }
  ],
  releases: [
    { version: "v2.0.0-beta", status: "Planned", date: "2026-06-01", tasks: 12, changelog: ["Major UI overhaul", "Deep space link support", "New physics engine"] },
    { version: "v1.1.0", status: "In Progress", date: "2026-05-15", tasks: 8, changelog: ["Added atmospheric sensors", "Optimized battery life", "Bug fixes"] },
    { version: "v1.0.0", status: "Released", date: "2026-04-01", tasks: 24, changelog: ["Initial MVP release", "Core navigation system", "Ground control comms"] }
  ]
};
