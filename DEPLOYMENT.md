# Deployment and MongoDB Atlas Configuration Guide

Follow these steps to connect the TalentCRM application to a real MongoDB Atlas database, verify its storage operations, and prepare for deployment on Render and Vercel.

---

## 1. Setup MongoDB Atlas (Cloud Database)

1. **Sign Up / Log In**:
   - Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) and sign up for a free account or log in.

2. **Create a Free Cluster**:
   - Click **Create** to deploy a cloud database.
   - Choose the **M0 FREE** tier.
   - Select your preferred Cloud Provider (e.g. AWS) and Region closest to you.
   - Click **Create**.

3. **Configure Database Security**:
   - **Username**: Create a database user (e.g. `talentadmin`).
   - **Password**: Generate a strong password. **Copy this password!** You will need it in your connection string.
   - **IP Access List**:
     - To allow connections from Render or other cloud services, add `0.0.0.0/0` (Allow Access from Anywhere).
     - *Note: For local testing, you can also add your current IP address.*
   - Click **Finish and Close** / **Go to Databases**.

4. **Get your Connection String**:
   - On the Database Deployments screen, click **Connect** for your cluster.
   - Select **Drivers** (usually under "Connect to your application").
   - Copy the provided connection string. It will look like this:
     ```text
     mongodb+srv://<username>:<password>@cluster0.xxxxxxx.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0
     ```

---

## 2. Configure Environment Variables Locally

1. Open [backend/.env](file:///c:/Users/mohit/.gemini/antigravity/scratch/workspace/backend/.env).
2. Replace the `MONGO_URI` value with your MongoDB Atlas connection string.
3. Replace `<password>` with your database user's password (ensure special characters in the password are URL encoded, e.g. `@` as `%40`).
4. Keep the database name by appending it after `/` (e.g. `...mongodb.net/talentcrm?...`).

Your entry in `backend/.env` should look like:
```env
MONGO_URI=mongodb://127.0.0.1:27017/talentcrm
# REPLACE the above line with your Atlas connection string:
# MONGO_URI=mongodb+srv://talentadmin:<your_password>@cluster0.xxxxxxx.mongodb.net/talentcrm?retryWrites=true&w=majority
```

---

## 3. Verify Database Storage

Once you have updated the `.env` file:

1. **Start the Backend Server**:
   - In your backend terminal, start the server using `npm start` or `npm run dev`.
   - Look for the console message:
     ```text
     MongoDB Connected: cluster0-shard-00-xx.mongodb.net
     ```
     *(If it fails or outputs the "Warning: MongoDB server selection failed" mock fallback notice, double-check your credentials and IP Access whitelist).*

2. **Submit a Registration Request**:
   - Register a new user via the Frontend UI (`http://localhost:5173/auth`) or use standard test HTTP tools.
   - Inspect your Atlas cluster Database Collections -> `talentcrm` -> `users` to confirm the registration record is stored.

---

## 4. Deploying to Render (Backend)

1. Create a [Render](https://render.com) account and click **New** -> **Web Service**.
2. Connect your GitHub repository containing the application.
3. Set the following details:
   - **Name**: `talent-crm-backend`
   - **Root Directory**: `backend` (if you are deploying backend separately)
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
4. In **Environment Variables**, add:
   - `PORT`: `5000`
   - `MONGO_URI`: `(Your MongoDB Atlas connection string)`
   - `JWT_SECRET`: `(Your JWT secret key)`
   - `NODE_ENV`: `production`

---

## 5. Deploying to Vercel (Frontend)

1. Create a [Vercel](https://vercel.com) account and import your repository.
2. Select the `frontend` folder as the project root.
3. Leave Build Command and Output Directory as default (Vercel automatically detects Vite).
4. Deploy the application.
