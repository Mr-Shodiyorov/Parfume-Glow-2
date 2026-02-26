import React, { useEffect, useState } from 'react'
import "./Hero.css"
import parfums1 from "../images/parfum1.svg"
import parfums2 from "../images/parfum2.jpg"
import parfums3 from "../images/parfum3.webp"

function Hero() {
    const [currentIndex, setCurrentIndex] = useState(0)
    const images = [parfums1, parfums2, parfums3]

    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentIndex((prevIndex) =>
                prevIndex == images.length - 1 ? 0 : prevIndex + 1
            )
        }, 3000) // 3 sekund

        return () => clearInterval(interval)
    }, [])

    return (
        <>
            <section className="hero">
                <div className="container">
                    <div className='hero__main'>
                        <h1 className='hero__title'>Glow parfum uz</h1>
                        <p className='hero__info'>У нас самые оригиналные и качественные парфюмы</p>

                    </div>

                </div>
                <div className="hero__slider">
                    <div
                        className="hero__slides"
                        style={{ transform: `translateX(-${currentIndex * 100}%)` }}
                    >
                        {images.map((img, index) => (
                            <img key={index} src={img} alt="parfum" />
                        ))}
                    </div>
                </div>
            </section>
        </>
    )
}

export default Hero