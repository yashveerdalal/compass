# 🧭 Compass – Lost & Found Platform

Compass is a **full-stack Lost & Found web application** designed for universities, workplaces, campuses, and even entire cities. It provides a simple way for people to report lost belongings or upload details of items they have found, helping owners reconnect with their valuables.

Whether you've lost your laptop on campus, found someone's earphones in the library, or discovered an identity card on the street, Compass makes it easy to post, search, and recover lost items.

---

## 🚀 Features

* 🔍 Browse all lost and found items
* 📝 Report Lost Items
* 📦 Report Found Items
* 📸 Upload multiple images using Firebase Storage
* 🔎 Search and filter items
* 👤 User authentication
* 📱 Responsive design for desktop and mobile
* ⚡ Real-time image hosting with Firebase
* 💾 MongoDB database for storing item information

---

## 🛠️ Tech Stack

### Frontend

* HTML
* CSS
* JavaScript

### Backend

* Node.js
* Express.js

### Database

* MongoDB

### Cloud Storage

* Firebase Storage

---

## 📂 Project Structure

```text
Compass/
│
├── frontend/
│   ├── css/
│   ├── js/
│   ├── images/
│   └── index.html
│
├── backend/
│   ├── routes/
│   ├── controllers/
│   ├── models/
│   ├── middleware/
│   ├── config/
│   ├── uploads/
│   ├── server.js
│   └── package.json
│
└── README.md
```

---

## ⚙️ Installation

### 1. Clone the repository

```bash
git clone https://github.com/yourusername/Compass.git
```

### 2. Navigate to the project

```bash
cd Compass
```

### 3. Install backend dependencies

```bash
cd backend
npm install
```

### 4. Create a `.env` file

```env
PORT=5050

MONGODB_URI=your_mongodb_connection_string

FIREBASE_API_KEY=your_key
FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
FIREBASE_PROJECT_ID=your_project_id
FIREBASE_STORAGE_BUCKET=your_bucket.appspot.com
FIREBASE_MESSAGING_SENDER_ID=your_sender_id
FIREBASE_APP_ID=your_app_id
```

---

## ▶️ Running the Application

Start the backend server:

```bash
cd backend
node server.js
```

or

```bash
npm start
```

Open the frontend by launching `index.html` or serve it using a local development server.

---

## 📸 How It Works

1. A user reports a lost or found item.
2. Images are uploaded securely to Firebase Storage.
3. Item details are stored in MongoDB.
4. Other users can browse or search listings.
5. When a match is found, the owner and finder can connect to recover the item.

---

## 🎯 Example Use Cases

* Lost a laptop in your university library.
* Found someone's earphones in the classroom.
* Picked up an ID card on the road.
* Found a wallet in a shopping mall.
* Lost a mobile phone during an event.
* Misplaced keys inside an office building.

---

## 🔒 Future Enhancements

* Email verification
* OTP-based login
* AI image matching for similar items
* Live chat between finder and owner
* Location-based item search
* Admin dashboard
* Item status tracking (Open/Claimed/Closed)
* Notifications
* Dark mode

---

## 🤝 Contributing

Contributions are welcome.

1. Fork the repository.
2. Create a new feature branch.
3. Commit your changes.
4. Push the branch.
5. Open a Pull Request.

---

## 📄 License

This project is licensed under the MIT License.

---

## 👨‍💻 Author

**Yashveer Dalal & Pulkit Balhara**

If you found this project useful, consider giving it a ⭐ on GitHub.
