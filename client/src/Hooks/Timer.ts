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
    const [isRunning, setIsRunning] = useState<boolean>(false)

    useEffect(() => {
        if (!isRunning) {
            return
        }

        if (currentTime >= duration) {
            setIsRunning(false)
            return
        }

        const timeout = setTimeout(() => {
            setCurrentTime(currentTime + step)
        }, step)

        return () => {
            clearTimeout(timeout)
        }
    }, [currentTime, duration, step, isRunning])

    return {
        currentTime,
        isRunning,
        percentage: currentTime / duration,
        isDone: currentTime >= duration,
        start: () => {
            setIsRunning(true)
        },
        reset: () => {
            setIsRunning(false)
            setCurrentTime(0)
        }
    }
}
