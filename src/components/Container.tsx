import React, { Fragment, useEffect, useRef, useState } from "react";
import Muuri, { GridOptions } from "muuri";
import GridItem from "./GridItem";
import { useSize, useUpdate } from "ahooks";
import calculateLayout, { switchItem } from "./calculateLayout";
import { LayoutMap, setLayoutMap } from "./calculateLayout";
import RenderItem from "./RenderItem";
import ResizeObserver from "rc-resize-observer";
import { dragSort, grids } from "./dragSortPredicate";
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
  level?: number;
}
export default function (props: React.PropsWithChildren<IContainerProps>) {
  const {
    id,
    children,
    col,
    data,
    resizeable,
    dragStartPredicate,
    dragSortPredicate,
    ...gridOptions
  } = props;
  const divRef = useRef<HTMLDivElement | null>(null);
  const gridRef = useRef<Muuri | null>(null);
  const wref = useRef(0);
  const update = useUpdate();
  const [childs] = useState<any[]>(data.concat([]));
  LayoutMap.set(id, {
    data,
    col,
    wref,
    resizeable,
    grid: gridRef,
    update
  });
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
        dragSort,
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
      // if (["board1","board2"].includes(id)) {
      grids[id] = grid;
      // }
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
      <div className={"grid " + id} ref={setRef} data-container={id}>
        {(childs || []).map((child, index) => {
          return (
            <GridItem
              key={child.id}
              position={child.layout}
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
