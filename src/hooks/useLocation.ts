import { useState, useEffect } from 'react'

type Position = {
  latitude: number
  longitude: number
}

type LocationError = {
  code: number
  message: string
}

export default function useLocation() {
  const [location, setLocation] = useState<Position >()
  const [error, setError] = useState<LocationError | null>(null)

  useEffect(() => {
    if (!navigator.geolocation) {
      setError({ code: 0, message: "Geolocation is not supported by your browser" })
    } else {
      navigator.geolocation.getCurrentPosition(
        (position) => {
            console.log('position', position)
          setLocation({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          })
        },
        (error) => {
          setError({ code: error.code, message: error.message })
        }
      )
    }
  }, [])

  return { location, error }
}