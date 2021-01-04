import React, { useState, useEffect, useRef } from "react";
import styled from "styled-components";
import useSwipeAction from "./hooks/useSwipeAction";

const defaultOptions = {
  slides: [],
  autoPlayMs: 2000,
  showIndicators: true,
  direction: 1,
  animationDelay: 400,
  threshold: 0.25,
};

export default function Carousel({
  autoPlayMs = defaultOptions.autoPlayMs,
  slides = defaultOptions.slides,
  showIndicators = defaultOptions.showIndicators,
  placeholder,
}) {
  const wrapperRef = useRef();
  const callbackRef = useRef();
  const blockingRef = useRef(false);
  const [selected, setSelected] = useState(slides.length ? 1 : 0);
  const [animated, setAnimated] = useState(true);
  const [swipeOffset, setSwipeOffset] = useState(false);
  // prepend last slide and append first slide to continuously effect when users is swiping first or last slide
  const allSlides = slides.length
    ? [slides[slides.length - 1]].concat(slides).concat([slides[0]])
    : placeholder
    ? [placeholder]
    : [];
  const totalSlides = allSlides.length;
  const transform = `translate3d(-${
    (selected + (swipeOffset || 0)) * 100
  }%, 0, 0)`;

  callbackRef.current = {
    start(pos) {
      blockingRef.current = true;
    },
    move(pos) {
      setSwipeOffset(pos.left);
    },
    end(pos) {
      if (!pos) {
        blockingRef.current = false;
        return;
      }
      setSwipeOffset(false);
      const nextSelected = Math.round(
        selected +
          (pos.left > defaultOptions.threshold
            ? 1
            : pos.left < -defaultOptions.threshold
            ? -1
            : 0)
      );
      setSelected(nextSelected);
      // re-adjust selected slide if selected slide is the first or last one
      if (nextSelected === 0 || nextSelected === totalSlides - 1) {
        const adjustedSelected =
          nextSelected === totalSlides - 1 ? 1 : totalSlides - 2;
        setTimeout(() => {
          callbackRef.current.jump(
            adjustedSelected,
            () => (blockingRef.current = false)
          );
        }, defaultOptions.animationDelay);
      } else {
        blockingRef.current = false;
      }
    },
    // changing selected slide without perform animation
    jump(index, callback) {
      setAnimated(false);
      requestAnimationFrame(() => {
        setSelected(index);
        requestAnimationFrame(() => {
          setAnimated(true);
          callback && callback();
        });
      });
    },
  };

  useSwipeAction(wrapperRef, callbackRef);

  useEffect(() => {
    if (!autoPlayMs || swipeOffset !== false || blockingRef.current) return;

    const timer = setTimeout(() => {
      const nextSelected = selected + 1;
      setSelected(nextSelected);
      if (nextSelected === totalSlides - 1) {
        setTimeout(
          () => callbackRef.current.jump(1),
          defaultOptions.animationDelay
        );
      }
    }, autoPlayMs);

    return () => {
      clearTimeout(timer);
    };
  }, [autoPlayMs, swipeOffset, selected, totalSlides]);

  return (
    <Wrapper ref={wrapperRef}>
      <SlideList
        animated={animated && swipeOffset === false}
        style={{ transform }}
      >
        {allSlides.map((slide, index) =>
          renderSlide(slide, index, selected === index)
        )}
      </SlideList>
      {showIndicators && (
        <IndicatorList>
          {allSlides.map((_, index) => (
            <Indicator
              key={index}
              selected={index === selected}
              onClick={() => setSelected(index)}
            />
          ))}
        </IndicatorList>
      )}
    </Wrapper>
  );
}

const SlideList = styled.ul`
  width: 100%;
  display: flex;
  flex-direction: row;
  list-style: none;
  margin: 0;
  padding: 0;
  position: relative;
  transition: ${(props) => (props.animated ? "transform" : "none")}
    ${defaultOptions.animationDelay}ms ease-in-out;
`;

const Slide = styled.li`
  flex: 1;
  min-width: 100%;
  position: relative;
`;

const IndicatorList = styled.ul`
  list-style: none;
  display: flex;
  flex-direction: row;
  align-items: center;
  margin: 0;
  padding: 0;
  position: absolute;
  top: 10px;
  left: 50%;
  transform: translateX(-50%);
`;

const Indicator = styled.li`
  &:before {
    content: "";
  }

  width: 10px;
  height: 10px;
  border-radius: 10px;
  background: white;
  margin: 2px;
  cursor: pointer;
  background: ${(props) => (props.selected ? "red" : "white")};

  &:first-child {
    display: none;
  }
  &:last-child {
    display: none;
  }
`;

const Wrapper = styled.div`
  position: relative;
  width: 100%;
  overflow: hidden;
`;

function renderSlide(slide, index, isSelected) {
  const { type, content, data } = slide;
  if (type === "html")
    return <Slide key={index} dangerouslySetInnerHTML={{ __html: content }} />;
  return (
    <Slide key={index}>
      {typeof content === "function" ? content(data, index) : content}
    </Slide>
  );
}
