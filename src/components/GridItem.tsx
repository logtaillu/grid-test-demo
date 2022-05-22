import React, { useCallback, useRef } from "react";
import { ResizableBox } from "react-resizable";
import ResizeObserver from "rc-resize-observer";
import Muuri from "muuri";
import "react-resizable/css/styles.css";
import { ILayout } from "./Container";
import { useDebounceFn, useUpdate } from "ahooks";
import { getXGridPos, LayoutMap } from "./calculateLayout";

interface IGridItemProps {
  position: ILayout;
  gridId: string;
}
export default function (props: React.PropsWithChildren<IGridItemProps>) {
  const { position, gridId } = props;
  const divRef = useRef<HTMLDivElement | null>(null);
  const layout = useCallback(()=>{
    return LayoutMap.get(divRef.current?.dataset?.grid || gridId);
    
  },[props.gridId]);
  const glayout = layout();
  const realw = Math.min(position.w, glayout.col);
  const calcPx = (wgrid: number) => {
    return Math.floor((glayout.wref.current * wgrid) / glayout.col)
  }
  const width = position.wpx || calcPx(realw);

  const resize = !!(glayout.resizeable || position.resizeable);
  const autoh = position.autoh !== false;
  const update = useUpdate();
  // debounce refresh
  const { run: refresh } = useDebounceFn(
    () => {
      // update();
      const grid = layout().grid;
      if (grid.current) {
        grid.current.refreshItems().layout();
      }
      update();
    },
    {
      wait: 50
    }
  );

  // height change, debounce refresh
  const heightRef = useRef<number>(autoh ? 0 : position.h || 0);
  const onHeightDetect = ({ offsetHeight }: any) => {
    if (heightRef.current !== offsetHeight && autoh) {
      // console.log("hchange", position.i, offsetHeight);
      heightRef.current = offsetHeight;
      if (divRef.current) {
        divRef.current.style.height = offsetHeight + "px";
        const resizeBox: any = divRef.current.firstElementChild;
        if(resizeBox){
          resizeBox.style.height = offsetHeight + "px";
        }
      }
      refresh();
    }
  };
  const maxw = calcPx(glayout.col - position.x);
  const minw = calcPx(1);
  const onResize = (e, { size }, stop = false) => {
    // update height
    if (!autoh) {
      position.h = size.height;
    }
    const clayout = layout();
    let nw = getXGridPos(size.width, clayout.wref.current, clayout.col);
    nw = Math.max(nw, 1);
    position.w = nw;
    position.wpx = stop ? 0 : size.width;
    if (divRef.current) {
      let curh = autoh ? heightRef.current : position.h || 0;
      const resizeBox: any = divRef.current.firstElementChild;
      if(resizeBox && autoh){
        curh = resizeBox.firstElementChild.offsetHeight;
        resizeBox.style.height = curh + "px";
      }
      if(stop){
        const divw = Math.floor((clayout.wref.current * nw) / clayout.col);
        if(resizeBox){
          resizeBox.style.width = divw + "px";
        }
        divRef.current.style.width = divw + "px";
        divRef.current.style.height = curh + "px";
      } else {
        divRef.current.style.width = size.width + "px";
        divRef.current.style.height = curh + "px";
      }
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
