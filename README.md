# 🧭 LocationFetcher – Sitecore XM Cloud Marketplace App

**LocationFetcher** is a simple example app built for **Sitecore XM Cloud Marketplace**.  
It demonstrates how to create a custom app that integrates with Sitecore fields, fetches data dynamically, and updates content interactively.

---

## 🚀 Features

- 🔍 **Autocomplete search:** Fetch location suggestions from an external API as the user types.  
- 📋 **Store selected ID:** Automatically saves the selected location’s ID in a Sitecore field.  
- 🔄 **Dynamic field update:** Updates other page fields (like city, state, or address) based on the selected location.  
- 🧩 **Plug-and-play:** Works seamlessly with Sitecore XM Cloud without changing internal code.

---

## 🏗️ How It Works

1. The app provides an **autocomplete input field** within Sitecore.  
2. As the user types, the app fetches matching results from an external API (for example, `GetLocations`).  
3. When the user selects a location:
   - The location **ID** is saved to a connected Sitecore field.  
   - Other page fields are automatically updated with related data.

---

## ⚙️ Setup

1. Clone the repository:
   ```bash
   git clone https://github.com/<your-username>/locationfetcher.git
   cd locationfetcher

2. Install dependencies:
   npm install

3. Build and run locally:
   npm run dev
   
5. Deploy your app to Sitecore Marketplace or connect it to your XM Cloud environment.

---

## 🧩 Integration with Sitecore XM Cloud

1. Create an app entry in your Sitecore XM Cloud organization.

2. Set your app URL to the deployed endpoint (e.g., https://yourapp.azurewebsites.net).

3. Authorize your organization and install the app.

4. Add the LocationFetcher component to your page or form field.

---

🧠 Learnings - This project demonstrates:

1. How to build a simple Sitecore Marketplace app.

2. How to integrate external APIs with Sitecore forms or fields.

3. How to store and sync external data inside XM Cloud.
