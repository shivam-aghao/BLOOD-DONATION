# 🩸 BloodConnect — Real-Time Blood Donation & Inventory Management System

**BloodConnect** is a comprehensive, responsive, and fully functional Single-Page Web Application (SPA) designed to bridge patients, hospital blood banks, and voluntary donors in real time.

---

## 🚀 Key Features & Functionality

### 1. 🔍 Find Blood & Donors
- **Dual-View Search**: Toggle between **Hospital & Blood Bank Reserves** and **Registered Voluntary Donors**.
- **Location & Group Filtering**: Search across cities (New York, Brooklyn, Queens, Chicago, or All) and by blood group (A+, A-, B+, B-, AB+, AB-, O+, O-).
- **Medically Safe Compatibility Matching**: Toggle to include compatible donor blood groups (e.g., A+ can receive A+, A-, O+, O-).
- **Direct Hospital Booking**: Submit a blood unit reservation request directly to any hospital, generating an instant booking reference code.
- **Direct Donor Contact**: One-click WhatsApp, phone call, or SMS outreach to voluntary donors.

### 2. 🚨 Emergency SOS Broadcast System
- **Broadcast Urgent Requests**: Post urgent patient blood needs with urgency ratings (*Critical*, *Urgent*, *Within 24h*).
- **Live SOS Feed**: Real-time alerts with filters for open and fulfilled requests.
- **Volunteer & Share**: One-click "I Can Donate" direct caller connect and one-click formatted social media / WhatsApp sharing.

### 3. 🏥 Hospital Blood Bank Dashboard
- **Multi-Hospital Management**: Switch between partner hospitals or register a new medical facility.
- **Live Stock Controls**: Increment (+), decrement (−), or zero out (✕) stock for all 8 blood groups with immediate visual badge status (*Available*, *Low Stock*, *Out of Stock*).
- **Batch Actions**: One-click restock all (+5 units) and reset to baseline levels.
- **Hospital Profile Editor**: Update hospital name, address, direct hotline, email, and operating hours.
- **Incoming Booking Queue**: Review patient requests and click **"Fulfill & Deduct Stock"** to automatically adjust hospital inventory.

### 4. ❤️ Voluntary Donor Registration & Digital ID Card
- **Age & Eligibility Verification**: Form validation with eligibility checks (age 18–65, weight, donation history).
- **Instant Digital Donor ID Card Generator**: Generates a sleek card with unique Member ID (`BC-xxxxx`), blood group badge, and verified donor credentials.
- **Print / Save Feature**: Print-optimized styling for saving or printing the digital donor card.
- **Live Sync**: Newly registered donors immediately appear in search results and update the hero statistics counter.

### 5. 🩸 Interactive Blood Compatibility Calculator
- Interactive selector for all 8 blood groups.
- Visual breakdown of **"Can Donate To"** and **"Can Receive From"** groups with Universal Donor (O-) and Universal Recipient (AB+) guidance.

### 6. 🔔 System Feedback & Accessibility
- Smooth **Toast Notification System** for all actions (saved, booked, SOS posted, updated).
- Accessible modal dialogs with smooth backdrops and light-dismiss support.
- Fully responsive mobile navigation with hamburger drawer.
- Zero-backend client-side persistence via structured `localStorage` with rich default seed data.

---

## 💻 How to Run Locally

You can open `FRONTEND/INDEX.HTML` directly in any web browser, or serve it using any local HTTP server:

### Using Python:
```bash
python -m http.server 8000 --directory FRONTEND
```
Then visit: `http://localhost:8000/INDEX.HTML`

### Using Node.js:
```bash
npx serve FRONTEND
```

---

## 📁 File Structure

```
BLOOD-DONATION/
├── FRONTEND/
│   ├── INDEX.HTML      # Semantic HTML5 application structure & modal templates
│   ├── style.css       # Modern CSS design system, cards, animations & print styles
│   └── script.js       # Complete reactive application logic & LocalStorage service
└── README.md           # Project documentation
```