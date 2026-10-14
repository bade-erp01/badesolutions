// "use client";
// import useEmblaCarousel from "embla-carousel-react";
// import Autoplay from "embla-carousel-autoplay";
// import { useEffect, useState } from "react";
// import { ChevronLeftIcon, ChevronRightIcon } from "@heroicons/react/24/solid";

// const slides = [
//   {
//     image: "/images/slide1.jpg",
//     caption: "Discover premium quality products",
//   },
//   {
//     image: "/images/slide2.jpg",
//     caption: "Fast delivery across the nation",
//   },
//   {
//     image: "/images/slide3.jpg",
//     caption: "Join thousands of happy customers",
//   },
// ];

// export default function EmblaCarousel() {
//   const [emblaRef, emblaApi] = useEmblaCarousel(
//     { loop: true },
//     [Autoplay({ delay: 4000, stopOnInteraction: false })]
//   );
//   const [selectedIndex, setSelectedIndex] = useState(0);

//   useEffect(() => {
//     if (!emblaApi) return;
//     const onSelect = () => setSelectedIndex(emblaApi.selectedScrollSnap());
//     emblaApi.on("select", onSelect);
//     onSelect();
//   }, [emblaApi]);

//   const scrollPrev = () => emblaApi?.scrollPrev();
//   const scrollNext = () => emblaApi?.scrollNext();

//   return (
//     <div className="relative w-full max-w-5xl mx-auto overflow-hidden rounded-lg shadow-lg">
//       <div className="embla" ref={emblaRef}>
//         <div className="embla__container flex">
//           {slides.map((slide, index) => (
//             <div
//               className="embla__slide flex-shrink-0 w-full relative"
//               key={index}
//             >
//               <img
//                 src={slide.image}
//                 alt={`Slide ${index + 1}`}
//                 className="w-full h-[400px] object-cover"
//               />
//               <div className="absolute bottom-0 left-0 w-full bg-black bg-opacity-50 text-white text-sm p-4">
//                 {slide.caption}
//               </div>
//             </div>
//           ))}
//         </div>
//       </div>

//       {/* Navigation Buttons */}
//       <button
//         onClick={scrollPrev}
//         className="absolute top-1/2 left-4 transform -translate-y-1/2 bg-white p-2 rounded-full shadow hover:bg-gray-100"
//       >
//         <ChevronLeftIcon className="h-6 w-6 text-gray-700" />
//       </button>
//       <button
//         onClick={scrollNext}
//         className="absolute top-1/2 right-4 transform -translate-y-1/2 bg-white p-2 rounded-full shadow hover:bg-gray-100"
//       >
//         <ChevronRightIcon className="h-6 w-6 text-gray-700" />
//       </button>

//       {/* Dot Indicators */}
//       <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex gap-2">
//         {slides.map((_, index) => (
//           <button
//             key={index}
//             onClick={() => emblaApi?.scrollTo(index)}
//             className={`w-3 h-3 rounded-full ${
//               selectedIndex === index ? "bg-indigo-600" : "bg-gray-300"
//             }`}
//           />
//         ))}
//       </div>
//     </div>
//   );
// }




"use client";
import useEmblaCarousel from "embla-carousel-react";
import Autoplay from "embla-carousel-autoplay";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeftIcon, ChevronRightIcon } from "@heroicons/react/24/solid";

const slides = [
  {
    image: "/images/slide1.jpg",
    caption: "Discover premium quality products",
  },
  {
    image: "/images/slide2.jpg",
    caption: "Fast delivery across the nation",
  },
  {
    image: "/images/slide3.jpg",
    caption: "Join thousands of happy customers",
  },
];

export default function AnimatedCarousel() {
  const [emblaRef, emblaApi] = useEmblaCarousel(
    { loop: true },
    [Autoplay({ delay: 5000, stopOnInteraction: false })]
  );
  const [selectedIndex, setSelectedIndex] = useState(0);

  useEffect(() => {
    if (!emblaApi) return;
    const onSelect = () => setSelectedIndex(emblaApi.selectedScrollSnap());
    emblaApi.on("select", onSelect);
    onSelect();
  }, [emblaApi]);

  const scrollPrev = () => emblaApi?.scrollPrev();
  const scrollNext = () => emblaApi?.scrollNext();

  return (
    <div className="relative w-full max-w-5xl mx-auto overflow-hidden rounded-lg shadow-lg">
      <div className="embla" ref={emblaRef}>
        <div className="embla__container flex">
          <AnimatePresence mode="wait">
            {slides.map((slide, index) => (
              <motion.div
                key={index}
                className="embla__slide flex-shrink-0 w-full relative"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: selectedIndex === index ? 1 : 0, scale: selectedIndex === index ? 1 : 0.95 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.6 }}
              >
                <img
                  src={slide.image}
                  alt={`Slide ${index + 1}`}
                  className="w-full h-[220px] sm:h-[320px] lg:h-[400px] object-cover"
                />
                <motion.div
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.3 }}
                  className="absolute bottom-0 left-0 w-full bg-black bg-opacity-50 text-white text-sm p-4"
                >
                  {slide.caption}
                </motion.div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </div>

      {/* Navigation Buttons */}
      <button
        onClick={scrollPrev}
        className="absolute top-1/2 left-4 transform -translate-y-1/2 bg-white p-2 rounded-full shadow hover:bg-gray-100"
      >
        <ChevronLeftIcon className="h-6 w-6 text-gray-700" />
      </button>
      <button
        onClick={scrollNext}
        className="absolute top-1/2 right-4 transform -translate-y-1/2 bg-white p-2 rounded-full shadow hover:bg-gray-100"
      >
        <ChevronRightIcon className="h-6 w-6 text-gray-700" />
      </button>

      {/* Dot Indicators */}
      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex gap-2">
        {slides.map((_, index) => (
          <button
            key={index}
            onClick={() => emblaApi?.scrollTo(index)}
            className={`w-3 h-3 rounded-full ${
              selectedIndex === index ? "bg-indigo-600" : "bg-gray-300"
            }`}
          />
        ))}
      </div>
    </div>
  );
}
