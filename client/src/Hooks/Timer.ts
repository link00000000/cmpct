import { useEffect } from 'react'
import { useState } from 'react'

export const useTimer = (duration: number, step = 1000) => {
    if (duration < 0) {
        throw new Error('Timer duration must be greater than zero')
    }

    if (step < 0) {
        throw new Error('Timer step must be greater than zero')
    }

    const [currentTime, setCurrentTime] = useState<number>(0)

    useEffect(() => {
        if (currentTime >= duration) {
            return
        }

        const timeout = setTimeout(() => {
            setCurrentTime(currentTime + step)
        }, step)

        return () => {
            clearTimeout(timeout)
        }
    }, [currentTime, duration, step])

    return {
        currentTime,
        percentage: currentTime / duration,
        isDone: currentTime >= duration
    }
}
