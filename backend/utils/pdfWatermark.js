import { v2 as cloudinary } from 'cloudinary'
import dotenv from 'dotenv'
dotenv.config()

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
})

export { cloudinary }

// Generate signed video URL — expires in 2 hours
export function generateSignedVideoUrl(publicId, studentName, studentEmail) {
  const timestamp = Math.floor(Date.now() / 1000) + (2 * 60 * 60) // 2 hours

  // Watermark overlay — student name + email on video
  const transformation = [
    {
      overlay: {
        font_family: 'Arial',
        font_size: 24,
        font_weight: 'bold',
        text: `${studentName} | ${studentEmail}`,
      },
      color: 'white',
      opacity: 40,
      gravity: 'south_east',
      x: 20,
      y: 20,
    },
    {
      overlay: {
        font_family: 'Arial',
        font_size: 18,
        text: `${studentName} | ${studentEmail}`,
      },
      color: 'white',
      opacity: 25,
      gravity: 'north_west',
      x: 20,
      y: 20,
    },
  ]

  const signedUrl = cloudinary.url(publicId, {
    resource_type: 'video',
    type: 'upload',
    sign_url: true,
    expires_at: timestamp,
    transformation,
    format: 'mp4',
  })

  return signedUrl
}

// Generate signed PDF URL — expires in 1 hour
export function generateSignedPdfUrl(publicId) {
  const timestamp = Math.floor(Date.now() / 1000) + (1 * 60 * 60) // 1 hour

  const signedUrl = cloudinary.url(publicId, {
    resource_type: 'raw',
    type: 'upload',
    sign_url: true,
    expires_at: timestamp,
    flags: 'attachment:false',
  })

  return signedUrl
}
