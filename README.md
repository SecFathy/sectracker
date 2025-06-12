
# SecTracker 🛡️

<div align="center">

![SecTracker Banner](https://i.ibb.co/LhXb1DFy/shot-style-2025-06-12-T14-34-26-093-Z.png)

A Modern Bug Bounty and Security Research Management Platform

[![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-B73BFE?style=for-the-badge&logo=vite&logoColor=FFD62E)](https://vitejs.dev/)
[![Supabase](https://img.shields.io/badge/Supabase-181818?style=for-the-badge&logo=supabase&logoColor=white)](https://supabase.io/)

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=for-the-badge)](https://opensource.org/licenses/MIT)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg?style=for-the-badge)](http://makeapullrequest.com)

</div>

## 📋 Table of Contents
- [Overview](#-overview)
- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Getting Started](#-getting-started)
- [Configuration](#-configuration-options)
- [Development](#-development)
- [Contributing](#-contributing)
- [License](#-license)
- [Acknowledgments](#-acknowledgments)

## 🎯 Overview

SecTracker is your all-in-one platform for managing bug bounty hunting and security research activities. Track your findings, manage reports, and organize your security research workflow efficiently.

## ✨ Features

### 🎯 Platform & Program Management
- Organize bug bounty platforms and programs
- Track scope and bounty ranges
- Manage platform-specific profiles

### 🐛 Bug Report Management
- Detailed bug reporting with markdown support
- Status tracking from draft to bounty awarded
- Severity and impact assessment

### 📊 Dashboard
- Visual overview of your hunting activities
- Drag-and-drop customization
- Progress tracking and statistics

### 📚 Research Tools
- Integrated RSS feed reader
- Reading list management
- Personal notes and tips organization
- Customizable security checklists

## 🛠️ Tech Stack

### Frontend
- **React + TypeScript** - Modern UI development
- **Vite** - Blazing fast builds
- **Shadcn UI** - Beautiful components
- **TanStack Query** - Efficient state management

### Backend & Database
- **Supabase** - Backend services
- **PostgreSQL** - Robust database
- **Real-time** - Live updates

## 🚀 Getting Started

### Prerequisites
- Node.js (v18 or higher)
- npm or bun package manager
- PostgreSQL (if using local database)

### Installation


#### Manual Installation

1. Clone the repository:
```bash
git clone https://github.com/secfathy/sectracker.git
cd sectracker
```

2. Install dependencies:
```bash
npm install
# or
bun install
```

3. Configure environment variables:
```bash
cp .env.example .env
```

Edit `.env` with your configuration:
```plaintext
# Supabase Configuration (Option 1)
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key

# Direct PostgreSQL Configuration (Option 2)
DATABASE_URL=postgresql://user:password@localhost:5432/sectracker
```

4. **Initialize the database:**
```bash
# If using PostgreSQL directly
psql -U postgres -d sectracker -f database/init.sql
```

5. **Start the development server:**
```bash
npm run dev
# or
bun dev
```

### 🐳 Docker Setup
```bash
docker-compose up --build
```

## 🔧 Configuration Options

### Supabase Setup
1. Create a new Supabase project
2. Copy your project URL and anon key
3. Update `.env` with Supabase credentials

### Local PostgreSQL Setup
1. Create a new PostgreSQL database
2. Run the initialization script:
```bash
psql -U postgres -d sectracker -f database/init.sql
```
3. Update `.env` with database connection string

## 📖 Development

### Project Structure
```
src/
├── components/     # React components
├── hooks/          # Custom React hooks
├── integrations/   # External service integrations
├── lib/            # Utility functions and configs
└── pages/          # Page components
```

### Available Scripts
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build

## 🤝 Contributing

We welcome contributions! Please follow these steps:

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to your branch
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [Shadcn UI](https://ui.shadcn.com/) for the beautiful components
- [Supabase](https://supabase.io/) for the backend infrastructure
- [Radix UI](https://www.radix-ui.com/) for accessible component primitives

---

<div align="center">
Made with 💙 for the Security Research Community by SecFathy
</div>
