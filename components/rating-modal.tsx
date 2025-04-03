"use client"

import { useState } from "react"
import { Star } from "lucide-react"

interface RatingModalProps {
  serviceName: string
  providerName: string
  onSubmit: (rating: number) => void
  onCancel: () => void
}

export default function RatingModal({ serviceName, providerName, onSubmit, onCancel }: RatingModalProps) {
  const [rating, setRating] = useState(0)
  const [hoveredRating, setHoveredRating] = useState(0)

  return (
    <div className="w-full">
      <h3 className="text-xl font-semibold mb-4">Rate this service</h3>

      <p className="mb-6">
        How would you rate{" "}
        <span className="font-medium">
          {serviceName} by {providerName}
        </span>
        ?
      </p>

      <div className="flex justify-center mb-6">
        <div className="flex">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              type="button"
              onClick={() => setRating(star)}
              onMouseEnter={() => setHoveredRating(star)}
              onMouseLeave={() => setHoveredRating(0)}
              className="cursor-pointer p-1"
            >
              <Star
                className={`h-8 w-8 ${
                  star <= (hoveredRating || rating) ? "text-yellow-400 fill-yellow-400" : "text-gray-300"
                }`}
              />
            </button>
          ))}
        </div>
      </div>

      <div className="flex justify-end space-x-3">
        <button
          onClick={onCancel}
          className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
        >
          Cancel
        </button>
        <button
          onClick={() => onSubmit(rating)}
          disabled={rating === 0}
          className="px-4 py-2 bg-green-50 text-white rounded-md hover:bg-green-600 transition-colors disabled:opacity-50"
        >
          Submit rating
        </button>
      </div>
    </div>
  )
}

