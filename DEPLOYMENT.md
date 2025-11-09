# 🚀 Deployment Guide - Parakh.ai

## CORS Issue Fix

The CORS error has been fixed! The server now accepts requests from:
- `https://parakh-ai.onrender.com` (your production frontend)
- `http://localhost:5173` (Vite dev server)
- `http://localhost:3000` (alternative dev port)
- Any URL set in `FRONTEND_URL` environment variable

## Environment Variables Setup

### Server (Node.js Backend)

On Render.com, set these environment variables for your backend service:

```env
PORT=5000
NODE_ENV=production
FRONTEND_URL=https://parakh-ai.onrender.com
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret_key
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_email_app_password
```

### Client (React/Vite Frontend)

On Render.com, set these environment variables for your frontend service:

```env
VITE_BACKEND_URL=https://parakh-ai-node.onrender.com/api
VITE_AI_WS=wss://your-fastapi-server.onrender.com
```

## Deployment Steps

### 1. Backend Deployment (Render.com)

1. Connect your GitHub repository
2. Select "Web Service"
3. Configure:
   - **Build Command:** `npm install`
   - **Start Command:** `node Server/index.js`
   - **Root Directory:** Leave blank or set to `Server/`
4. Add environment variables (see above)
5. Deploy!

### 2. Frontend Deployment (Render.com)

1. Create a new "Static Site"
2. Configure:
   - **Build Command:** `cd Client && npm install && npm run build`
   - **Publish Directory:** `Client/dist`
3. Add environment variables (see above)
4. Deploy!

### 3. FastAPI Deployment (for AI Interview feature)

1. Create a new "Web Service"
2. Configure:
   - **Build Command:** `pip install -r FastAPI/requirements.txt`
   - **Start Command:** `uvicorn FastAPI.app.main:app --host 0.0.0.0 --port $PORT`
3. Deploy!

## Important Notes

### Cookie/Session Issues

If you're still having authentication issues after fixing CORS:

1. **SameSite Cookies:** The server is configured with `trust proxy` for Render
2. **Secure Cookies:** Make sure your auth controller sets cookies with proper flags:
   ```javascript
   res.cookie('token', token, {
     httpOnly: true,
     secure: process.env.NODE_ENV === 'production',
     sameSite: 'none', // Important for cross-origin requests
     maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
   });
   ```

### Health Check

Test your backend is running:
```bash
curl https://parakh-ai-node.onrender.com/health
```

Should return:
```json
{"status":"ok","timestamp":"2025-11-09T..."}
```

## Troubleshooting

### CORS Still Not Working?

1. Check Render logs for the backend
2. Verify environment variables are set correctly
3. Make sure the frontend URL in the request matches exactly (with https://)
4. Clear browser cache and cookies

### Authentication Not Working?

1. Check cookie settings in the auth controller
2. Verify JWT_SECRET is set
3. Make sure `credentials: true` is in your axios requests
4. Check browser devtools > Application > Cookies

### Can't Connect to Database?

1. Verify MONGO_URI is correct
2. Whitelist Render's IP addresses in MongoDB Atlas
3. Check MongoDB Atlas connection settings

## Local Development

### Backend
```bash
cd Server
npm install
npm run dev
```

### Frontend
```bash
cd Client
npm install
npm run dev
```

### FastAPI
```bash
cd FastAPI
pip install -r requirements.txt
uvicorn app.main:app --reload
```

## Need Help?

- Check Render logs for detailed error messages
- Test API endpoints with Postman/curl
- Verify all environment variables are set correctly
