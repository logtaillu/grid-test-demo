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
  grid: React.MutableRefObject<Muuri | null>;
  gridId: string;
}

export default function (props: React.PropsWithChildren<IGridItemProps>) {
  const { w, position, col, resizeable, grid, gridId } = props;
  const realw = Math.min(position.w, col);
  const calcPx = (wgrid: number) => {
    return Math.floor((w * wgrid) / col)
  }
  const width = position.wpx || calcPx(realw);

  const resize = !!(resizeable || position.resizeable);
  const autoh = position.autoh !== false;
  const update = useUpdate();
  // debounce refresh
  const { run: refresh } = useDebounceFn(
    () => {
      requestAnimationFrame(() => {
        update();
        if (grid.current) {
          grid.current.refreshItems().layout();
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
      // console.log("hchange", position.i, offsetHeight);
      heightRef.current = offsetHeight;
      if (divRef.current) {
        divRef.current.style.height = offsetHeight + "px";
      }
      refresh();
    }
  };
  const maxw = calcPx(col - position.x);
  const minw = calcPx(1);
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
      data-grid={gridId}
      style={{
        width: width + "px",
        height: autoh ? (heightRef.current || "auto") : position.h + "px"
      }}
      ref={divRef}
    >
      <ResizableBox
        width={width}
        height={autoh ? heightRef.current : position.h || 0}
        resizeHandles={resize ? (autoh ? ["w", "e"] : ["se", "w","e","s","n"]) : []}
        onResize={onResize}
        maxConstraints={[maxw, Infinity]}
        minConstraints={[minw, 10]}
        onResizeStop={(e, data) => {
          // console.log("resize end", position.i);
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
