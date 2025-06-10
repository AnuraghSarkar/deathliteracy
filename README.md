# Death Literacy Platform

A comprehensive web-based platform designed to assess and improve death literacy through interactive quizzes, personalized reports, and educational resources.

## Project Overview

This project seeks to develop an engaging web platform to assess respondent knowledge of death literacy. The platform enables individuals to complete death literacy surveys and receive personalized reports with recommendations for improvement, while organizations can access a paid version for data collection and analysis.

**Project Owner:** Andrea Grindrod  
**Position:** Senior Research Fellow and Project Manager, School of Psychology & Public Health  
**Website:** https://healthyendoflifeprogram.org

## Features

### Core Features (Must Haves)
- ✅ Web-based Progressive Web App (PWA)
- ✅ User authentication and account management
- ✅ Editable question bank system
- ✅ Intelligent quiz assessment logic
- ✅ Customized report generation
- ✅ Admin portal for data access and export

### Enhanced Features (Nice-to-Haves)
- 🔄 AI-driven personalization for different cultural backgrounds
- 🔄 Multi-language support
- 🔄 Advanced analytics dashboard

## Technology Stack

- **Backend:** Node.js, Express.js
- **Database:** MongoDB with Mongoose ODM
- **Authentication:** JWT + Google OAuth
- **Frontend:** Progressive Web App (PWA)
- **Environment:** Cross-platform (smartphones to desktop)

## Prerequisites

Before you begin, ensure you have the following installed:

- [Node.js](https://nodejs.org/) (v14 or higher)
- [MongoDB](https://www.mongodb.com/) (v4.4 or higher)
- [Git](https://git-scm.com/)
- A text editor or IDE (VS Code recommended)

## Installation & Setup

### 1. Clone the Repository

```bash
git clone <repository-url>
cd death-literacy-platform
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Environment Configuration

Create a `.env` file in the root directory with the following variables:

```env
# Server Configuration
PORT=3000
NODE_ENV=development

# Database Configuration
MONGO_URI=mongodb://localhost:27017/death-literacy-db

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-here

# Google OAuth Configuration
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
```

#### How to Get Google OAuth Credentials:

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing one
3. Enable Google+ API
4. Create OAuth 2.0 credentials
5. Add authorized redirect URIs:
   - `http://localhost:3000/auth/google/callback` (development)
   - `https://yourdomain.com/auth/google/callback` (production)

### 4. Database Setup

#### Option A: Local MongoDB
```bash
# Start MongoDB service
mongod

# Or using MongoDB Compass
# Connect to mongodb://localhost:27017
```

#### Option B: MongoDB Atlas (Cloud)
1. Create account at [MongoDB Atlas](https://www.mongodb.com/atlas)
2. Create a cluster
3. Get connection string and update `MONGO_URI` in `.env`

### 5. Create Admin User

Run the admin creation script:

```bash
node createAdmin.js
```

**Important:** Before running, update the email in `createAdmin.js`:
```javascript
email: 'your-admin@email.com',  // Replace with your admin email
password: 'your-secure-password'  // Replace with secure password
```

## Running the Application

### Development Mode

```bash
# Start the server with hot reload
npm run dev

# Or using nodemon directly
npx nodemon server.js
```

### Production Mode

```bash
# Start the server
npm start

# Or
node server.js
```

The application will be available at `http://localhost:3000`

## Project Structure

```
death-literacy-platform/
├── models/
│   ├── userModel.js          # User schema and model
│   ├── questionModel.js      # Question bank model
│   └── responseModel.js      # Quiz response model
├── routes/
│   ├── auth.js              # Authentication routes
│   ├── quiz.js              # Quiz-related routes
│   └── admin.js             # Admin panel routes
├── middleware/
│   ├── auth.js              # Authentication middleware
│   └── validation.js        # Input validation
├── controllers/
│   ├── authController.js    # Authentication logic
│   ├── quizController.js    # Quiz management
│   └── reportController.js  # Report generation
├── public/                  # Static files (CSS, JS, images)
├── views/                   # HTML templates
├── utils/
│   ├── emailService.js      # Email notifications
│   └── reportGenerator.js   # PDF report generation
├── .env                     # Environment variables
├── createAdmin.js           # Admin user creation script
├── server.js               # Main application file
└── package.json            # Dependencies and scripts
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/google` - Google OAuth login
- `POST /api/auth/logout` - User logout

### Quiz Management
- `GET /api/quiz/questions` - Get quiz questions
- `POST /api/quiz/submit` - Submit quiz responses
- `GET /api/quiz/results/:id` - Get quiz results

### Admin Panel
- `GET /api/admin/users` - Get all users
- `POST /api/admin/questions` - Add new question
- `PUT /api/admin/questions/:id` - Update question
- `DELETE /api/admin/questions/:id` - Delete question
- `GET /api/admin/export` - Export data

## Deployment

### Production Environment Setup

1. **Set Environment Variables:**
```env
NODE_ENV=production
PORT=80
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/death-literacy-prod
JWT_SECRET=your-production-jwt-secret
```

2. **Build and Deploy:**
```bash
# Install production dependencies only
npm ci --production

# Start with PM2 (recommended)
npm install -g pm2
pm2 start server.js --name "death-literacy-app"

# Or using Docker
docker build -t death-literacy-platform .
docker run -p 80:3000 death-literacy-platform
```

### Platform Deployment Options

#### Heroku
```bash
heroku create death-literacy-platform
heroku config:set NODE_ENV=production
heroku config:set MONGO_URI=your-mongodb-uri
heroku config:set JWT_SECRET=your-jwt-secret
git push heroku main
```

#### Digital Ocean / AWS / Azure
- Use PM2 for process management
- Set up reverse proxy with Nginx
- Configure SSL certificates
- Set up automated backups

## Maintenance

### Database Backup
```bash
# MongoDB backup
mongodump --uri="mongodb://localhost:27017/death-literacy-db" --out=/path/to/backup

# Restore
mongorestore --uri="mongodb://localhost:27017/death-literacy-db" /path/to/backup
```

### Log Management
```bash
# View application logs
pm2 logs death-literacy-app

# Clear logs
pm2 flush
```

### Updates
```bash
# Update dependencies
npm update

# Security audit
npm audit
npm audit fix
```

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## Troubleshooting

### Common Issues

**MongoDB Connection Error:**
```bash
# Check if MongoDB is running
sudo systemctl status mongod

# Start MongoDB
sudo systemctl start mongod
```

**Port Already in Use:**
```bash
# Find process using port 3000
lsof -i :3000

# Kill the process
kill -9 <PID>
```

**Environment Variables Not Loading:**
- Ensure `.env` file is in root directory
- Check file permissions
- Verify no extra spaces in variable names

### Getting Help

- Check the [Issues](link-to-issues) page for known problems
- Create a new issue with detailed description
- Contact project maintainer: Andrea Grindrod

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Research References

- [Progressing the Death Literacy Index](https://pmc.ncbi.nlm.nih.gov/articles/PMC11418362/)
- [Happiness at Work Assessment](https://iopenerinstitute.com/happiness-at-work-assessment/) (Reference implementation)

## Acknowledgments

- School of Psychology & Public Health
- Research contributors and participants
- Open source community

---

**Last Updated:** June 2025  
**Version:** 1.0.0
