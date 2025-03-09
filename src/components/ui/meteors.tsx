import { cn } from "../../lib/utils"
import React, { useEffect, useState } from "react"

export const Meteors = ({
  number,
  className,
}: {
  number?: number
  className?: string
}) => {
  const [meteorStyles, setMeteorStyles] = useState<Array<{
    top: string
    left: string
    delay: string
    duration: string
  }>>([])

  useEffect(() => {
    const styles = Array(number || 40).fill(null).map(() => ({
      top: Math.floor(Math.random() * 100) + "%",
      left: Math.floor(Math.random() * 100) + "%",
      delay: (Math.random() * (0.8 - 0.2) + 0.2) + "s",
      duration: Math.floor(Math.random() * (10 - 2) + 2) + "s"
    }))
    setMeteorStyles(styles)
  }, [number])

  return (
    <div className="absolute inset-0 overflow-hidden z-20">
      {meteorStyles.map((style, idx) => (
        <span
          key={"meteor" + idx}
          className={cn(
            "absolute h-1 w-1 rounded-[9999px] bg-[#CCCCCC] shadow-[0_0_0_1px_#ffffff10] rotate-[215deg]",
            "before:absolute before:top-1/2 before:transform before:-translate-y-[50%] before:w-[100px] before:h-[2px] before:bg-gradient-to-r before:from-[#CCCCCC] before:to-transparent",
            "animate-meteor-effect pointer-events-none",
            className
          )}
          style={{
            top: style?.top || "0%",
            left: style?.left || "0%",
            animationDelay: style?.delay || "0s",
            animationDuration: style?.duration || "5s",
          }}
        ></span>
      ))}
    </div>
  )
} 