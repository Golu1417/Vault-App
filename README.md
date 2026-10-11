# Calculator Vault 📱🔐

An all-in-one privacy application disguised as an operational calculator that conceals a private, local-storage media vault for photos and videos.

Built as an installable **Progressive Web App (PWA)** that runs on Android, iOS, Windows, Mac, and Linux.

---

## 🌟 Highlights

### 1. Dual Passcode Access
- **Dynamic Time-based Password**:
  - The passcode automatically syncs with the live system clock in 24-hour `HHmm` format!
  - **1:53 PM** (13:53) $\rightarrow$ Passcode is **`1353`**
  - **11:06 AM** (11:06) $\rightarrow$ Passcode is **`1106`**
  - Includes a $\pm 1$ minute buffer tolerance to prevent lockouts when the minute flips mid-typing.
  - Option to switch to 12-hour format (`0153`) in Settings.
- **Constant Permanent Password**:
  - Fixed 4 to 6 digit PIN (e.g., `2580`).
- **Initial Setup Wizard**:
  - Automatically guides first-time users to configure their passcode style, practice entering it on the calculator, and set up a security recovery question.

### 2. Operational Front Calculator Disguise
- Fully functional arithmetic calculator (`+`, `-`, `×`, `÷`, `%`, `±`, `.`, `AC`, `⌫`).
- **Secret Unlock Trigger**: Entering your passcode and pressing **`=`** unlocks the vault.
- **Decoy Calculation**: Any normal math expression evaluates as expected without exposing the vault.
- **Physical Keyboard Support**: Type directly using your computer keyboard.
- **Emergency Recovery**: Type **`112233=`** or long-press **`%`** to answer your security question and recover access.

### 3. Encrypted Media Vault (Photos & Videos)
- **Local Persistence via IndexedDB**: Securely stores full-size binary photo and video Blobs without localStorage quota limits.
- **Photo Lightbox**: Fullscreen view with zoom in/out, 90° rotation, file size, download/unhide, and delete.
- **Video Player**: Native HTML5 player with seek bar, volume control, and fullscreen.
- **Custom Albums & Favorites**: Organize media into custom categories.
- **Trash Bin**: Soft-delete with item recovery or permanent deletion.
- **Panic Lock**: Instant Escape key (`Esc`) or header lock button to immediately snap back to a clean calculator screen.

### 4. Customizable App Icon & Disguise
Change the app identity in Settings:
- **Calculator** (Default: Calculator icon & title)
- **Clock** (Clock icon, title "Clock", header "World Clock")
- **Notes** (Notepad icon, title "Notes", header "Notes & Memos")
- **Weather** (Weather icon, title "Weather", header "Weather Forecast")

Updates the browser tab title and dynamic SVG favicon in real time.

### 5. Progressive Web App (PWA)
- Installable on **Android, iOS, Windows, Mac, and Linux**.
- Runs in standalone mode (no browser address bar or buttons).
- Full offline support via background service worker (`sw.js`).

---

## 🚀 Getting Started

### Local Development
```bash
npm install
npm run dev
```

### Production Build
```bash
npm run build
```

---

## 🔒 Privacy & Security Note
All media files and settings are stored locally on the client device inside browser **IndexedDB** storage. No photos, videos, or passcodes are ever sent to external cloud servers.
