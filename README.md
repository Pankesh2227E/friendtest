# Fake Friend Tester (Fake Friend Test)

An interactive, viral web application for creating custom friendship quizzes, discovering who your real friends are, and sharing live leaderboards. Built with high-performance vanilla JavaScript and a lightweight, dependency-free Node.js backend.

---

## 🌟 Key Features

* **Custom Quiz Creation**: Select questions from a rich question pool, define custom answer choices, and assign creator answers.
* **Instant Sharable Links**: Generates unique links for players and a protected secret access link for the quiz creator.
* **Live Scoreboard & Reactions**: Real-time leaderboards showing who scored highest and who failed the friendship test.
* **Web Audio Sound Effects**: Integrated, non-intrusive sound effects powered by the Web Audio API (does not trigger mobile lock-screen media session controls).
* **High-Ranking SEO Multi-Page Guides**:
  * `/how-well-do-your-friends-know-you-quiz` – Step-by-step quiz creation and scoring guide
  * `/friendship-quiz-questions` – 50 curated "How Well Do You Know Me?" questions bank
  * `/signs-of-a-fake-friend` – 10 psychological signs of fake friends and how to set boundaries
  * `/fake-friend-quotes` – Sourced quotes and copy-paste Instagram/TikTok story captions
* **Trust & Legal Compliance**:
  * `/about-us` – Brand mission and methodology
  * `/privacy-policy` – GDPR/CCPA compliant privacy statement
  * `/terms-and-conditions` – User agreements and acceptable use policy
  * `/contact-us` – Direct contact message submission
  * Custom `/404` and `/500` branded error pages
* **SEO & Social Optimization**:
  * OpenGraph and Twitter/X summary cards (1200x630).
  * Schema.org `WebApplication`, `BreadcrumbList`, and `FAQPage` JSON-LD structured data.
  * Search Console verified `sitemap.xml` and `robots.txt` compatible with Googlebot.
* **Dual Database Architecture**:
  * **MongoDB Atlas** for reliable production persistence across server redeploys and restarts.
  * **Local file fallback** (`data/db.json`) for seamless zero-setup offline/local development.
* **Production Security**:
  * Content Security Policy (CSP), anti-clickjacking (`X-Frame-Options`), and MIME sniffing headers.
  * In-memory token bucket rate limiting on quiz creation and contact submissions.
  * HTML sanitization preventing XSS attacks.

---

## 📁 Project Architecture

```
├── 404.html                                  # Custom 404 error page
├── 500.html                                  # Custom 500 server error page
├── about-us.html                             # Standalone About Us page
├── contact-us.html                           # Contact submission page
├── privacy-policy.html                       # Privacy policy page
├── terms-and-conditions.html                 # Terms and conditions page
├── how-well-do-your-friends-know-you-quiz.html # SEO Guide: Quiz creation & scoring breakdown
├── friendship-quiz-questions.html            # SEO Guide: 50 friendship questions bank
├── signs-of-a-fake-friend.html               # SEO Guide: 10 signs of fake friends & advice
├── fake-friend-quotes.html                   # SEO Guide: Sourced quotes & social captions
├── index.html                                # Main single-page application & quiz engine
├── server.js                                 # Pure Node.js HTTP server & REST API
├── questions_seed.json                       # Curated questions database
├── package.json                              # Project manifest and scripts
├── Dockerfile                                # Container specification
├── render.yaml                               # Infrastructure configuration for Render
├── robots.txt                                # Search engine crawler policies
├── sitemap.xml                               # Search engine discovery index
├── .env.example                              # Environment variable templates
└── static/
    ├── assets/audio/                         # Lightweight sound effect assets
    └── assets/img/                           # Brand icons, logo-512, and 1200x630 OG image
```

---

## 🚀 Getting Started

### Prerequisites

* **Node.js**: v18.0.0 or higher
* **npm**: v9.0.0 or higher
* *(Optional)* A free [MongoDB Atlas](https://www.mongodb.com/atlas) cluster URI

### 1. Installation

Clone the repository and install dependencies:

```bash
git clone https://github.com/<your-username>/<your-repo-name>.git
cd <your-repo-name>
npm install
```

### 2. Environment Configuration

Create a `.env` file in the root directory (based on `.env.example`):

```env
PORT=3000
DATA_DIR=data
MONGODB_URI=mongodb+srv://<username>:<password>@cluster0.abcde.mongodb.net/fakefriendstest?retryWrites=true&w=majority
```

> **Note**: If `MONGODB_URI` is left blank, the application automatically uses local JSON storage in `data/db.json`.

### 3. Running Locally

Start the development server:

```bash
npm start
```

Visit [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🚢 Deployment Guide

### Deploying to Render

This repository includes a pre-configured `render.yaml` for 1-click deployment on Render's free or paid tiers:

1. Push your code to GitHub or GitLab.
2. Log in to [Render Dashboard](https://dashboard.render.com/).
3. Click **New +** > **Web Service** and connect your repository.
4. Set the following settings:
   * **Runtime**: `Node`
   * **Build Command**: `npm install`
   * **Start Command**: `npm start`
5. *(Recommended)* Under **Environment Variables**, add:
   * `NODE_VERSION`: `20`
   * `MONGODB_URI`: *Your MongoDB connection string* (Ensures created quizzes persist when Render spins down the free container).

### Deploying with Docker

You can run the app anywhere using Docker:

```bash
# Build Docker image
docker build -t realones-quiz .

# Run container
docker run -p 3000:3000 -e PORT=3000 realones-quiz
```

---

## 🔍 Google Search Console & SEO Verification

* **HTML Tag Verification**: Already integrated into `<head>`:
  ```html
  <meta name="google-site-verification" content="zrqg0LZwQl-zZnMxBpKTBfH0JYeKnwE7kTYO3g7gdIo">
  ```
* **Sitemap Submission**: In Google Search Console, submit `https://<your-domain>/sitemap.xml`.
* **Crawl Test**: In Search Console, select **URL Inspection** > **Test Live URL** to verify Googlebot passes with HTTP `200 OK`.

---

## 🛡️ API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/questions` | Retrieve curated questions pool |
| `POST` | `/api/quizzes` | Create a new quiz (Rate-limited) |
| `GET` | `/api/quiz/:id` | Fetch public quiz data for taking the quiz |
| `POST` | `/api/quiz/:id/submit` | Submit player answers and calculate score |
| `GET` | `/api/quiz/:id/board?key=...` | Creator-only scoreboard view |
| `POST` | `/api/contact` | Submit contact form inquiry |

---

## 📄 License

This project is licensed under the [MIT License](LICENSE).
