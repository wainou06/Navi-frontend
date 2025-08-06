// components/ImageUploader.js
import { IconButton } from '@mui/material'
import { CloudUpload, X } from 'lucide-react'

const MAX_IMAGES = 5

const ImageUploader = ({ images, setImages, previews, setPreviews }) => {
   const handleUpload = (e) => {
      const files = Array.from(e.target.files)
      const validFiles = files.filter((file) => file.type.startsWith('image/') && file.size <= 5 * 1024 * 1024)

      if (images.length + validFiles.length > MAX_IMAGES) {
         alert('최대 5개의 이미지만 업로드할 수 있습니다.')
         return
      }

      setImages((prev) => [...prev, ...validFiles])
      setPreviews((prev) => [...prev, ...validFiles.map((file) => URL.createObjectURL(file))])
   }

   const handleRemove = (index) => {
      URL.revokeObjectURL(previews[index])
      setImages((prev) => prev.filter((_, i) => i !== index))
      setPreviews((prev) => prev.filter((_, i) => i !== index))
   }

   return (
      <div className="image-grid-container">
         {[...Array(MAX_IMAGES)].map((_, index) => (
            <div key={index} className="image-preview-item">
               {previews[index] ? (
                  <>
                     <img src={previews[index]} alt={`preview-${index}`} />
                     <IconButton onClick={() => handleRemove(index)} sx={{ position: 'absolute', top: 4, right: 4 }}>
                        <X size={16} />
                     </IconButton>
                  </>
               ) : (
                  <label className="image-placeholder">
                     <input type="file" accept="image/*" onChange={handleUpload} multiple={index === 0} style={{ display: 'none' }} />
                     <CloudUpload />
                     <div className="image-placeholder-text">이미지</div>
                  </label>
               )}
            </div>
         ))}
      </div>
   )
}

export default ImageUploader
