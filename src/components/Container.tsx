import React, { useEffect, useRef, useState } from "react";
import Muuri, { GridOptions } from "muuri";
import GridItem from "./GridItem";
import { useSize, useUpdate } from "ahooks";
import calculateLayout, { switchItem } from "./calculateLayout";
import { LayoutMap } from "./calculateLayout";
import RenderItem from "./RenderItem";
import ResizeObserver from "rc-resize-observer";
export interface ILayout {
  w: number;
  x: number;
  y: number;
  i: string;
  h?: number;
  autoh?: boolean;
  resizeable?: boolean;
  wpx?: number;
}
interface IContainerProps extends GridOptions {
  col: number;
  resizeable?: boolean;
  data: any[];
  id: string;
}
let grids: Muuri[] = [];
export default function (props: React.PropsWithChildren<IContainerProps>) {
  const {
    id,
    children,
    col,
    data,
    resizeable,
    dragStartPredicate,
    ...gridOptions
  } = props;
  const divRef = useRef<HTMLDivElement | null>(null);
  const gridRef = useRef<Muuri | null>(null);
  const wref = useRef(0);
  const update = useUpdate();
  LayoutMap.set(id, { data, col });
  useEffect(() => {
    if (divRef.current && !gridRef.current && !!wref.current) {
      gridRef.current = new Muuri(divRef.current, {
        layout: calculateLayout(id),
        dragStartPredicate: (item, event: any) => {
          if (event.target.classList.contains("react-resizable-handle")) {
            return false;
          } else if (event.srcEvent.handled) {
            return false;
          } else if (typeof dragStartPredicate === "function") {
            event.srcEvent.handled = true;
            return dragStartPredicate(item, event);
          } else {
            event.srcEvent.handled = true;
            return Muuri.ItemDrag.defaultStartPredicate(
              item,
              event,
              dragStartPredicate
            );
          }
        },
        layoutOnResize: false,
        // dragSortPredicate: (item, event) => {
        //   console.log(item.getGrid());
        //   return {
        //     threshold: 50,
        //     action: "move",
        //     migrateAction: "move"
        //   };
        // },
        dragSort: () => grids.slice(-2),
        ...gridOptions
      }).on("dragStart", function (item, event) {
        if (event.target.classList.contains("react-resizable-handle")) {
          event.srcEvent.preventDefault();
        }
      }).on("dragMove", function (item, event) {
        // 实际内容
        grid.layout();
      }).on("dragReleaseEnd", (item) => {
        switchItem(item);
      });
      const grid = gridRef.current;
      grids.push(grid);
    }
  }, [gridOptions, !!wref.current]);
  // 在宽度resize的时候重新执行布局，用于内部嵌套
  const onResize = ({ offsetWidth }) => {
    if (offsetWidth !== wref.current) {
      wref.current = offsetWidth;
      update();
      if (gridRef.current) {
        gridRef.current.layout();
      }
    }
  }

  const setRef = (n) => {
    divRef.current = n;
    if (!wref.current && n) {
      wref.current = n.offsetWidth;
      update();
    }
  }
  return (
    <ResizeObserver onResize={onResize}>
      <div className={"grid " + id} ref={setRef} data-grid={id}>
        {(data || []).map((child, index) => {
          return (
            <GridItem
              key={index}
              w={wref.current || 0}
              position={child.layout}
              col={col}
              resizeable={resizeable}
              grid={gridRef}
              gridId={id}
            >
              <RenderItem item={child} />
            </GridItem>
          );
        })}
      </div>
    </ResizeObserver>
  );
}
