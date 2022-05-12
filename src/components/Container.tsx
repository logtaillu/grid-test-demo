import React, { useEffect, useRef } from "react";
import Muuri, { GridOptions } from "muuri";
import GridItem from "./GridItem";
import { useSize } from "ahooks";
import calculateLayout from "./calculateLayout";
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
  position: Array<ILayout>;
}
let grids = [];
export default function (props: React.PropsWithChildren<IContainerProps>) {
  const {
    children,
    col,
    position,
    resizeable,
    dragStartPredicate,
    ...gridOptions
  } = props;
  const divRef = useRef<HTMLDivElement | null>(null);
  const gridRef = useRef<Muuri | null>(null);
  const size = useSize(divRef);
  const layoutRef = useRef(position);
  const colRef = useRef(col);
  layoutRef.current = position;
  colRef.current = col;
  useEffect(() => {
    if (divRef.current && !gridRef.current && size?.width) {
      gridRef.current = new Muuri(divRef.current, {
        layout: calculateLayout(layoutRef, colRef),
        dragStartPredicate: (item, event) => {
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
        // dragSortPredicate: (item, event) => {
        //   console.log(item.getGrid());
        //   return {
        //     threshold: 50,
        //     action: "move",
        //     migrateAction: "move"
        //   };
        // },
        // dragSort: () => grids,
        ...gridOptions
      });
      const grid = gridRef.current;
      grids.push(grid);
      grid.on("dragStart", function (item, event) {
        if (event.target.classList.contains("react-resizable-handle")) {
          event.srcEvent.preventDefault();
        }
      });
      grid.on("dragMove", function (item, event) {
        // 实际内容
        grid.layout();
        // console.log("dragmove");
      });
      // grid.on("dragReleaseEnd", function (item) {
      //   console.log("dragmove");
      //   grid.layout();
      // });
      // grid.on("layoutEnd", function (items) {
      //   console.log("layoutEnd", items);
      // });
    }
  }, [gridOptions, !!size?.width]);
  return (
    <div className="grid" ref={divRef}>
      {React.Children.map(props.children, (child, index) => {
        return (
          <GridItem
            key={index}
            w={size?.width || 0}
            position={position[index]}
            col={col}
            resizeable={resizeable}
            grid={gridRef}
          >
            {child}
          </GridItem>
        );
      })}
    </div>
  );
}
