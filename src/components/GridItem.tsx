import React, { useRef } from "react";
import { ResizableBox } from "react-resizable";
import ResizeObserver from "rc-resize-observer";
import Muuri from "muuri";
import "react-resizable/css/styles.css";
import { ILayout } from "./Container";
import { useDebounceFn, useUpdate } from "ahooks";
import { getXGridPos } from "./calculateLayout";

interface IGridItemProps {
  w: number;
  position: ILayout;
  col: number;
  resizeable?: boolean;
  grid: React.MutableRefObject<Muuri>;
}
export default function (props: React.PropsWithChildren<IGridItemProps>) {
  const { w, position, col, resizeable, grid } = props;
  const realw = Math.min(position.w, col);
  const width = position.wpx || Math.floor((w * realw) / col);

  const resize = !!(resizeable || position.resizeable);
  const autoh = position.autoh !== false;
  const update = useUpdate();
  // debounce refresh
  const { run: refresh } = useDebounceFn(
    () => {
      requestAnimationFrame(() => {
        update();
        if (grid.current) {
          grid.current.refreshItems();
          grid.current.layout();
        }
      });
    },
    {
      wait: 50
    }
  );

  // height change, debounce refresh
  const heightRef = useRef<number>(autoh ? 0 : position.h || 0);
  const divRef = useRef<HTMLDivElement | null>(null);
  const onHeightDetect = ({ offsetHeight }: any) => {
    if (heightRef.current !== offsetHeight && autoh) {
      console.log("hchange", position.i);
      heightRef.current = offsetHeight;
      refresh();
    }
  };

  const onResize = (e, { size }, stop = false) => {
    // update height
    if (!autoh) {
      position.h = size.height;
    }
    let nw = getXGridPos(size.width, w, col);
    nw = Math.max(nw, 1);
    position.w = nw;
    position.wpx = stop ? 0 : size.width;
    if (divRef.current) {
      const divw = stop ? Math.floor((w * nw) / col) : size.width;
      divRef.current.style.width = divw + "px";
      divRef.current.style.height = size.height + "px";
    }
    refresh();
  };
  return (
    <div
      className="item"
      data-id={position.i}
      style={{
        width: width + "px",
        height: autoh ? "auto" : position.h + "px"
      }}
      ref={divRef}
    >
      <ResizableBox
        width={width}
        height={autoh ? heightRef.current : position.h || 0}
        resizeHandles={resize ? (autoh ? ["w", "e"] : ["se"]) : []}
        onResize={onResize}
        maxConstraints={[w, Infinity]}
        onResizeStop={(e, data) => {
          console.log("resize end", position.i);
          onResize(e, data, true);
        }}
      >
        <ResizeObserver onResize={onHeightDetect}>
          <div className={`item-detect ${autoh ? "autoh" : "fixh"}`}>
            {props.children}
          </div>
        </ResizeObserver>
      </ResizableBox>
    </div>
  );
}
