"use client";
import { Series } from "@/lib/generated/prisma";
import Image from "next/image";
import { useEffect, useRef } from "react";
import { Button } from "./ui/button";

interface CarouselProps {
  series: Series[];
}

export const Carousel = ({ series }: CarouselProps) => {
  const carouselRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const thumbnailRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const carousel = carouselRef.current;
    const list = listRef.current;
    const thumbnail = thumbnailRef.current;
    
    if (!carousel || !list || !thumbnail) return;

    const nextBtn = document.getElementById("next");
    const prevBtn = document.getElementById("prev");
    
    if (!nextBtn || !prevBtn) return;

    const timeAutoNext = 3000;
    let runNextAuto: NodeJS.Timeout;

    const showSlider = (type: "next" | "prev") => {
      const sliderItems = list.querySelectorAll<HTMLDivElement>(".item");
      const thumbnailItems =
        thumbnail.querySelectorAll<HTMLDivElement>(".item");

      if (type === "next") {
        list.appendChild(sliderItems[0]);
        thumbnail.appendChild(thumbnailItems[0]);
        carousel.classList.add("next");
      } else {
        list.prepend(sliderItems[sliderItems.length - 1]);
        thumbnail.prepend(thumbnailItems[thumbnailItems.length - 1]);
        carousel.classList.add("prev");
      }

      clearTimeout(runNextAuto);
      runNextAuto = setTimeout(() => {
        showSlider("next");
      }, timeAutoNext);
    };

    // Add proper event listeners instead of overriding click property
    const handleNextClick = () => showSlider("next");
    const handlePrevClick = () => showSlider("prev");

    nextBtn.addEventListener("click", handleNextClick);
    prevBtn.addEventListener("click", handlePrevClick);

    runNextAuto = setTimeout(() => {
      showSlider("next");
    }, timeAutoNext);

    return () => {
      clearTimeout(runNextAuto);
      nextBtn.removeEventListener("click", handleNextClick);
      prevBtn.removeEventListener("click", handlePrevClick);
    };
  }, []);

  return (
    <div
      ref={carouselRef}
      className="carousel h-screen w-screen relative overflow-hidden"
    >
      <div ref={listRef} className="list">
        {series.map((content, idx) => (
          <div key={idx} className="item absolute inset-0">
            <Image
              src={content.thumbnailImageUrl || ""}
              alt={content.name}
              height={560}
              width={450}
              className="w-full h-full object-cover"
            />
            <div className="content absolute top-[20%] left-1/2 -translate-x-1/2 max-w-[80%] text-white">
              <div className="title text-5xl font-bold">{content.name}</div>
              <div className="topic text-5xl font-bold text-orange-500">
                {content.genreId}
              </div>
              <div className="des mt-4 text-sm">
                {content.description}
              </div>
              <div className="grid grid-cols-2 gap-2 mt-4 w-[260px]">
                <Button className="tracking-wider">
                  SEE MORE
                </Button>
                <Button variant="outline">
                  Watch
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>
      
      {/* Navigation Buttons */}
      <div className="absolute top-1/2 left-4 -translate-y-1/2 z-50">
        <Button id="prev" variant="outline" size="icon" className="rounded-full w-12 h-12">
          ←
        </Button>
      </div>
      <div className="absolute top-1/2 right-4 -translate-y-1/2 z-50">
        <Button id="next" variant="outline" size="icon" className="rounded-full w-12 h-12">
          →
        </Button>
      </div>
      
      {/* Thumbnails */}
      <div ref={thumbnailRef} className="thumbnail absolute bottom-12 left-1/2 -translate-x-1/2 flex gap-5 z-50">
        {series.map((content, idx) => (
          <div key={idx} className="item w-[150px] h-[220px] relative">
            <Image
              src={content.thumbnailImageUrl || ""}
              alt={content.name}
              height={560}
              width={450}
              className="w-full h-full object-cover"
            />
            <div className="content absolute bottom-2 left-2 right-2 text-white">
              <div className="title font-medium">{content.name}</div>
              <div className="description text-sm">Description</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
