import { useEffect } from "react";
import { isTouchSupport } from "../utils";

const [startEvent, endEvent, moveEvent] = isTouchSupport
  ? ["touchstart", "touchend", "touchmove"]
  : ["mousedown", "mouseup", "mousemove"];

export default function useSwipeAction(elementRef, callbacksRef) {
  useEffect(() => {
    let originalPosition;
    let lastOffset;

    function handleTouchEnd() {
      dispose();
      callbacksRef.current.end(lastOffset);
    }

    function handleTouchStart(e) {
      lastOffset = null;
      e.preventDefault();
      originalPosition = getTouchOffset(elementRef.current, e);
      elementRef.current.addEventListener(endEvent, handleTouchEnd);
      elementRef.current.addEventListener(moveEvent, handleTouchMove);
      callbacksRef.current.start(originalPosition);
    }

    function handleTouchMove(e) {
      callbacksRef.current.move(
        (lastOffset = getTouchOffset(elementRef.current, e, originalPosition))
      );
    }

    function dispose() {
      elementRef.current.removeEventListener(endEvent, handleTouchEnd);
      elementRef.current.removeEventListener(moveEvent, handleTouchMove);
    }

    elementRef.current.addEventListener(startEvent, handleTouchStart);

    return () => {
      dispose();
      elementRef.current.removeEventListener(startEvent, handleTouchStart);
    };
  }, []);
}

function getTouches(e) {
  return e.touches || [e];
}

function getTouchOffset(element, e, originalPosition) {
  const { clientX, clientY } = getTouches(e)[0];
  if (!originalPosition) originalPosition = { clientX, clientY };

  return {
    clientX,
    clientY,
    left: (originalPosition.clientX - clientX) / element.offsetWidth,
    top: (originalPosition.clientY - clientY) / element.offsetHeight,
  };
}

function getElementOffset(element) {
  let left = 0;
  let top = 0;
  while (element) {
    left += element.offsetLeft;
    top += element.offsetTop;
    element = element.offsetParent;
  }
  return { left, top };
}
