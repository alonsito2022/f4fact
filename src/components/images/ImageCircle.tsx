import React from 'react'

function ImageCircle({ image, className = "", alt = "", ...props }: any) {
  return (
    <img
      className={`w-10 h-10 p-1 rounded-full ring-2 ring-gray-300 dark:ring-gray-500 ${className}`}
      src={image}
      alt={alt}
      {...props}
    />
  )
}

export default ImageCircle