'use client'

import { useEffect, useRef } from 'react'
import { Meteors } from '../components/ui/meteors'
import './globals.css'

const items = [
  'project-001',
  'project-014',
  'project-500',
  'about-us',
  'blog',
]

export default function Home() {
  const listRef = useRef<HTMLUListElement>(null)
  const isDragging = useRef(false)
  const startX = useRef(0)
  const scrollLeft = useRef(0)

  useEffect(() => {
    // Set light mode by default
    document.documentElement.dataset.theme = 'light'
  }, [])

  useEffect(() => {
    const list = listRef.current
    if (!list) return

    const handleMouseDown = (e: MouseEvent) => {
      isDragging.current = true
      document.documentElement.dataset.dragging = 'true'
      startX.current = e.pageX - list.offsetLeft
      scrollLeft.current = list.scrollLeft
    }

    const handleMouseUp = () => {
      isDragging.current = false
      document.documentElement.dataset.dragging = 'false'
    }

    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging.current) return
      e.preventDefault()
      const x = e.pageX - list.offsetLeft
      const walk = (x - startX.current) * 2
      list.scrollLeft = scrollLeft.current - walk
    }

    list.addEventListener('mousedown', handleMouseDown)
    document.addEventListener('mouseup', handleMouseUp)
    document.addEventListener('mousemove', handleMouseMove)

    return () => {
      list.removeEventListener('mousedown', handleMouseDown)
      document.removeEventListener('mouseup', handleMouseUp)
      document.removeEventListener('mousemove', handleMouseMove)
    }
  }, [])

  return (
    <div className="container relative min-h-screen overflow-hidden">
      <Meteors number={40} />
      <header className="relative z-10">
        <h1>ghost-projects</h1>

        <p>
        every great dream begins with a dreamer. always remember, 
        you have within you the strength, the patience, 
        and the passion to reach for the stars, to change the world.
        </p>
        <p>
          never stop chasing ghosts.
        </p>
        <p>
          almost everything, all external expectations, all pride, 
          all fear of embarrassment or failure, 
          these things just fall away in the face of death, 
          leaving only what is truly important. 
          remembering that you are going to die is the best way I know to avoid the 
          trap of thinking you have something to lose. 
          you are already naked. there is no reason not to follow your heart.
        </p>
      </header>
      <main className="relative z-10">
        <ul ref={listRef}>
          {items.map((item) => (
            <li key={item}>
              <article>
                <a href="#">
                  <span aria-hidden="true">
                    {/* {(index + 1).toString().padStart(2, '0')}.&nbsp; */}
                  </span>
                  {item}
                </a>
                <div>
                  <div 
                    className="absolute bottom-0 left-0 right-0 flex items-end justify-end p-4 text-sm"
                    style={{
                      backgroundColor: item === 'project-001' ? '#3D3D3D' :
                                     item === 'project-014' ? '#E7EAEE' :
                                     item === 'project-500' ? '#C3FF2A' :
                                     item === 'about-us' ? '#FF680A' :
                                     '#5C5C5C',
                      color: item === 'project-014' || item === 'project-500' ? '#000' : '#fff',
                      height: '80%'
                    }}
                  >
                    {item === 'project-001' ? '001' :
                     item === 'project-014' ? '014' :
                     item === 'project-500' ? '500' :
                     item === 'about-us' ? 'about-us' :
                     'blog'}
                  </div>
                </div>
              </article>
            </li>
          ))}
        </ul>
      </main>
    </div>
  )
}
