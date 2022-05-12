import Muuri, { LayoutFunctionCallback, LayoutFunction } from "muuri";
interface ILayoutItem {
  x: number; // x col
  y: number; // y level
  w: number; // wpx
  h: number; // hpx
  i: number; // index
  ele: any;
}

interface IRect {
  x: number; // x col
  y: number; // y level
  w: number; // wpx
  h: number; // hpx
  i: number;
}
const sortLayout = (ary: ILayoutItem[]) => {
  ary.sort((a, b) =>
    a.y === b.y ? (a.x === b.x ? a.i - b.i : a.x - b.x) : a.y - b.y
  );
};
const placeRect = (
  item: ILayoutItem,
  rects: IRect[],
  width: number,
  height: number
) => {
  const { x, y, i, h, w, ele } = item;
  // 1. get X position & handle new line
  let xpos = x;
  if (xpos + w > width) {
    xpos = 0;
  }
  // 2. y pos
  let ypos = 0;
  for (let i = rects.length - 1; i >= 0; i--) {
    const cur = rects[i];
    // [cur.x, cur.x + w), [xpos, xpos +w)
    if (!(cur.x + cur.w <= xpos || xpos + w <= cur.x)) {
      ypos = Math.max(ypos, cur.y + cur.h);
    }
  }
  rects.push({ x: xpos, y: ypos, w, h, i });
  if (ele) {
    ele.ypos = ypos;
  }
  return Math.max(height, ypos + h);
};
const placeLayout = (ary: ILayoutItem[], slots: number[], width: number) => {
  sortLayout(ary);
  const rects: IRect[] = [];
  let maxh = 0;
  ary.map((item) => {
    maxh = placeRect(item, rects, width, maxh);
  });
  rects.map(({ x, y, i }) => {
    slots[i * 2] = x;
    slots[i * 2 + 1] = y;
  });
  return maxh;
};

export const getXGridPos = (x, width, col) => {
  // 向前最接近
  // grid <= (x*col)/w
  let xgrid = parseInt(((x * col) / width).toFixed(0), 10);
  xgrid = Math.min(Math.max(0, xgrid), col);
  return xgrid;
};

const calculateLayout = (layoutRef, colRef) => (
  grid: Muuri,
  layoutId: number,
  items: Muuri.Item[],
  width: number,
  height: number,
  callback: LayoutFunctionCallback
): LayoutFunction => {
  var layout: any = {
    id: layoutId,
    items: items,
    slots: [],
    styles: {}
  };
  var timerId = window.setTimeout(function () {
    // 实际内容
    console.log("calculate Layout", layoutId);
    const positions = layoutRef.current || [];
    const posmap = {};
    positions.map((s) => (posmap[s.i] = s));
    const col = colRef.current;
    const ary: ILayoutItem[] = (items || []).map((item: any, index) => {
      const id: string = item.getElement()?.dataset?.id || "";
      const ele = posmap[id];
      const dragging = item.isDragging();
      if (dragging && ele) {
        const { _tX, _tY } = item;
        ele.x = getXGridPos(_tX, width, Number(col));
        ele.ypos = _tY;
      }
      const { x, y, ypos } = ele || {};
      const m = item.getMargin();
      const w = item.getWidth() + m.left + m.right;
      const h = item.getHeight() + m.top + m.bottom;
      return {
        x: Math.floor((width * Number(x)) / Number(col)),
        y: isNaN(Number(ypos)) ? Number(y) : Number(ypos),
        h,
        i: index,
        w,
        ele
      };
    });
    const height = placeLayout(ary, layout.slots, width);
    layout.styles.height = height + "px";
    callback(layout);
  }, 100);
  return function () {
    window.clearTimeout(timerId);
  };
};
export default calculateLayout;
