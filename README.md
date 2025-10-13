# Personal Portal Site

Modern personal portfolio and social media hub built with React, TypeScript, and Tailwind CSS.

## 🚀 Features

- **Modern Tech Stack**: React 18 + TypeScript + Vite
- **Styling**: Tailwind CSS with custom color palette
- **API Integration**: YouTube Data API v3 for dynamic content
- **State Management**: React Query for server state
- **Animations**: Framer Motion for smooth interactions
- **Code Quality**: ESLint + Prettier configuration
- **Responsive Design**: Mobile-first approach

## 📁 Project Structure

```
src/
├── components/     # React components
├── hooks/         # Custom React hooks
├── types/         # TypeScript type definitions
├── utils/         # Utility functions
└── assets/        # Static assets (images, icons, etc.)
```

## 🛠️ Setup Instructions

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Environment Configuration**
   - Copy `.env.example` to `.env`
   - Add your YouTube Data API key to `VITE_YOUTUBE_API_KEY`

3. **Development Server**
   ```bash
   npm run dev
   ```

4. **Build for Production**
   ```bash
   npm run build
   ```

## 🎨 Design System

### Color Palette
- **Primary**: #00B33A (Deep Green)
- **Secondary**: #4B5563 (Neutral Gray)
- **Accent**: #FF7700 (Vibrant Orange)

### Typography
- **Font Family**: Inter (Google Fonts)
- **Responsive scaling**: Mobile-first approach

## 📝 Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint
- `npm run format` - Format code with Prettier

## 🔧 Configuration Files

- `vite.config.ts` - Vite configuration with optimizations
- `tsconfig.json` - TypeScript configuration with path mapping
- `tailwind.config.js` - Tailwind CSS with custom theme
- `.eslintrc.cjs` - ESLint rules and settings
- `.prettierrc` - Code formatting rules

## 📋 Requirements Covered

This setup addresses the following requirements:
- ✅ 8.1: TypeScript development environment
- ✅ 8.2: Type safety and compile-time error detection
- ✅ 8.3: ESLint and Prettier code quality management
- ✅ 6.1: Responsive design foundation with Tailwind CSS

## 🚀 Next Steps

1. Install dependencies: `npm install`
2. Configure environment variables
3. Start implementing components according to the task list
4. Begin with task 2: Basic type definitions and interfaces

## 📄 License

Private project - All rights reserved.