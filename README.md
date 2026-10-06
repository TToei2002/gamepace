# 🎮 GamePace

GamePace is a modern web application built to help gamers track, manage, and pace their gaming backlog. By integrating seamlessly with the Steam API, GamePace allows users to sync their Steam library, view their live playing status, and organize their games using an intuitive Kanban board interface.

**Live Demo:** [https://game-management-three.vercel.app/](https://game-management-three.vercel.app/)

---

## ✨ Features

- **🔄 Steam Integration:** Automatically sync your Steam games and playtime using your Steam ID or Custom URL (Vanity URL).
- **⏱️ HowLongToBeat (HLTB) Integration:** Compare your playtime against average completion times (Main Story, Extras, Completionist) to gauge how much longer a game will take.
- **🟢 Live Status:** See what game you are currently playing on Steam in real-time.
- **📋 Kanban Board:** Organize your games into customizable columns (e.g., Backlog, Playing, Completed, Abandoned) using a drag-and-drop or click-based Kanban interface.
- **⏱️ Pacing System:** Configure your gaming pace and set goals to tackle your backlog efficiently.
- **📊 Export Data:** Easily export your game list and progress to a CSV file for personal tracking.
- **🎨 Modern UI:** A beautiful, responsive, and dark-themed user interface built with Tailwind CSS.

---

## 📸 Screenshots

*(Replace these placeholders with actual screenshots of your app!)*

![Dashboard/Kanban View](https://via.placeholder.com/800x450.png?text=Dashboard+Kanban+Screenshot)
![User Pacing Settings](https://via.placeholder.com/800x450.png?text=User+Pacing+Screenshot)

---

## 🛠️ Tech Stack

- **Framework:** [Next.js 15](https://nextjs.org/) (App Router)
- **Library:** [React 19](https://react.dev/)
- **Styling:** [Tailwind CSS](https://tailwindcss.com/)
- **Database ORM:** [Prisma](https://www.prisma.io/)
- **Database:** PostgreSQL (Hosted on Supabase)
- **Icons:** [Lucide React](https://lucide.dev/)

---

## 🚀 Getting Started

To run this project locally, follow these steps:

### 1. Clone the repository
```bash
git clone https://github.com/TToei2002/gamepace.git
cd gamepace
```

### 2. Install dependencies
```bash
npm install
# or
yarn install
```

### 3. Set up Environment Variables
Create a `.env.local` file in the root directory and add the following variables:
```env
# Database connection string (Supabase/PostgreSQL)
DATABASE_URL="postgresql://user:password@host:port/database"

# Steam API Key (Get it from https://steamcommunity.com/dev/apikey)
STEAM_API_KEY="YOUR_STEAM_API_KEY_HERE"
```

### 4. Setup the Database
Push the Prisma schema to your database:
```bash
npx prisma db push
```

### 5. Run the Development Server
```bash
npm run dev
# or
yarn dev
```
Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

---

## 🔑 How to use

1. Go to the web app.
2. Enter your **Steam ID** (e.g., `76561198138879051`) or **Steam Vanity URL** in the search bar.
3. The app will fetch your Steam library and live status.
4. Use the Kanban board to move games between columns to track your backlog progress.

---

## 📝 License
This project is open-source and available under the [MIT License](LICENSE).
