# Scrolls.nyc

A modern, minimalist photo and text sharing platform built with Next.js. Share moments with your followers through a clean, chronological feed.

## Overview

Scrolls.nyc is a social media application that emphasizes simplicity. Users can share images with captions or text-only posts, follow other users, and engage with content through comments.

## Key Features

### 🔐 Authentication & Profiles

- **Google OAuth** integration for secure sign-up and login
- **Custom profiles** with unique usernames and bios
- **Profile pages** showcasing user posts in chronological order

### 📸 Content Creation

- **Image posts** with captions
  - Metadata stripping for privacy
  - Image compression and optimization before upload
- **Text-only posts** for quick updates
- **Edit and delete** functionality for your own posts
- **QR code generation** for easy profile sharing

### 🌐 Social Features

- **Follow system** to curate your feed
- **Personalized feed** showing posts from followed users
- **Comment system** for engaging with posts
- **User mentions** support in posts and comments
- **Explore section** with:
  - Latest posts across the platform
  - Latest user sign-ups

### 👤 Profile Management

- **Profile customization** with username and bio
- **Settings page** for account management
- **Following page** to view and manage followed accounts
- **Public profiles** viewable by anyone (with posting/editing restricted to owners)

## Tech Stack

- **Framework**: [Next.js 15](https://nextjs.org/) with App Router
- **Runtime**: React 19
- **Authentication**: NextAuth.js with Google OAuth
- **Database**: [Upstash Redis](https://upstash.com/) (via Vercel KV)
- **Storage**: [Vercel Blob Storage](https://vercel.com/docs/storage/vercel-blob) for images
- **Styling**: Tailwind CSS 4
- **Image Processing**: Sharp & Exifr
- **TypeScript**: Full type safety throughout

## Features in Detail

### Image Upload Flow

1. User selects an image
2. EXIF metadata extracted to capture original photo date
3. Image cropping interface for optimal framing
4. Metadata stripped for privacy
5. Image compressed and optimized
6. Uploaded to Vercel Blob Storage
7. Post metadata saved to Redis/KV

### Feed Algorithm

Posts are displayed in **reverse chronological order** based on when they were posted. The feed shows content from users you follow, creating a personalized experience.

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.
