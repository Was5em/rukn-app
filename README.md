# 🌙 Rukn - Interactive Islamic Educational App for Kids

> A Progressive Web App (PWA) designed as an interactive, educational, and Islamic environment for children (ages 3–10). Built with a 100% kid-safe, ad-free experience (COPPA compliant) and complete offline capabilities (Offline-first).

---

## 🌟 Key Features

### 📚 Educational & Religious Content (8 Main Sections)
- **Supplications & Azkar:** Daily prayers with authentic religious references (Al-Bukhari, Muslim, Abu Dawud, etc.).
- **Stories of the Prophets:** Interactive storytelling of prophetic milestones followed by quizzes to reinforce learning.
- **Muslim Morals:** Interactive moral scenarios fostering honesty, filial piety, trustworthiness, and tolerance.
- **Wudu & Prayer:** Gamified step-by-step Wudu guide and an overview of the five daily prayers.
- **Letters & Words:** Arabic alphabet learning linked to Islamic vocabulary and everyday objects.
- **Beautiful Names of Allah:** Simplified meanings of Allah's names tailored for young minds (Al-Razzaq, Al-Shafi, Al-Basir, etc.).
- **Juz Amma:** Short Quranic chapters (Al-Fatiha, Al-Ikhlas, Al-Falaq, An-Nas, Al-Kawthar).
- **Daily Athkar:** A rotating, verified daily remembrance featured prominently on the home screen.

### 🎮 Gamification & UX
- **Challenge Mode:** A fast-paced 10-second countdown quiz featuring 10 random questions.
- **Memory Match:** A 16-card Islamic matching game to boost concentration and memory.
- **Stars & Badges System:** Earn stars for correct answers and unlock milestone badges.
- **Rewards Store:** Exchange earned stars for 5 gradient color themes (Ocean 🌊, Forest 🌲, Sunset 🌅, Space 🚀, Ramadan 🌙) and unlockable avatars.
- **Haptics & Visual FX:** Integrated haptic feedback (`navigator.vibrate`), dynamic `Confetti`, flying stars, and an interactive Mascot providing encouraging speech bubbles.

### 👨‍👩‍👧‍👦 Parental Control Dashboard
- **PIN Protection:** Secure 4-digit PIN code preventing kids from altering settings.
- **Screen Time Management:** Daily time limits that automatically lock the app when expired.
- **Smart Analytics & Review:** Error tracking and automated re-quizzing of missed questions.
- **Data Backup:** Easily export and import user data as a `JSON` file.
- **Social Sharing:** Quick WhatsApp integration to share a child's achievements.

---

## 💻 Tech Stack

Built following modern web performance standards with **Zero Frameworks** for ultra-fast loading speeds:

- **Languages:** HTML5 / CSS3 / Vanilla JavaScript (ES6+).
- **Dual Audio Engine:** Procedurally generated sound effects via `Web Audio API`, combined with a fallback Arabic TTS engine (`SpeechSynthesisUtterance`) and custom MP3 audio support.
- **State Management:** Fully client-side storage utilizing `localStorage` for profiles, stats, themes, and settings.
- **Progressive Web App (PWA):** Equipped with a `Service Worker` (Network-First strategy with Offline Fallback) and a Web `Manifest` for seamless installation on iOS and Android.
- **Hardware & DOM Integration:** Native `navigator.vibrate`, Web Push Notifications support, and dynamic DOM manipulation for animations.
