import React, { useState } from "react";
import Carousel from "./components/Carousel";

const images = [
  "https://cdn.pixabay.com/photo/2015/12/01/20/28/road-1072823_960_720.jpg",
  "https://cdn.pixabay.com/photo/2017/02/01/22/02/mountain-landscape-2031539_960_720.jpg",
  "https://cdn.pixabay.com/photo/2015/09/09/16/05/forest-931706_960_720.jpg",
];

const sampleSlides = [
  {
    content: (
      <>
        <img src="https://cdn.pixabay.com/photo/2015/12/01/20/28/road-1072823_960_720.jpg" />
        <div className="slide-title">Slide 1</div>
      </>
    ),
  },
  {
    content: (
      <>
        <img src="https://cdn.pixabay.com/photo/2017/02/01/22/02/mountain-landscape-2031539_960_720.jpg" />
        <div className="slide-title">Slide 2</div>
      </>
    ),
  },
  {
    content: (
      <>
        <img src="https://cdn.pixabay.com/photo/2015/09/09/16/05/forest-931706_960_720.jpg" />
        <div className="slide-title">Slide 3</div>
      </>
    ),
  },
];

export default function App() {
  const [slides, setSlides] = useState(sampleSlides);

  function removeLast() {
    setSlides(slides.slice(0, slides.length - 1));
  }

  function addImage() {
    setSlides(
      slides.concat({
        content: (
          <>
            <img src={images[Math.floor(Math.random() * images.length)]} />
            <div className="slide-title">Slide 3</div>
          </>
        ),
      })
    );
  }

  function addHtml() {
    setSlides(
      slides.concat({
        type: "html",
        content: `<h2>HTML content ${new Date()}</h2>`,
      })
    );
  }

  return (
    <div className="App">
      <h1>Carousel Demo</h1>
      <button onClick={removeLast}>Remove Last</button>
      <button onClick={addImage}>Add Image Slide</button>
      <button onClick={addHtml}>Add HTML Slide</button>
      <hr />
      <div className="carousel-wrapper">
        <Carousel slides={slides} />
      </div>
    </div>
  );
}
