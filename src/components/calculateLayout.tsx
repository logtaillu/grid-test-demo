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
    ele.y = ypos;
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
  x = isNaN(x) ? 0 : x;
  let xgrid = parseInt(((x * col) / width).toFixed(0), 10);
  xgrid = Math.min(Math.max(0, xgrid), col);
  return xgrid;
};
export const LayoutMap = new Map();
// map存值
export const setLayoutMap = (id, value) => {
  if (LayoutMap.has(id)) {
    const item = LayoutMap.get(id);
    LayoutMap.set(id, { ...item, ...value });
  } else {
    LayoutMap.set(id, value);
  }
}
// get position from map
const getPosition = (gridId) => {
  const layout = LayoutMap.get(gridId) || {};
  const ary = layout.data || [];
  return ary;
}

const getPositionMap = (gridId) => {
  const ary = getPosition(gridId);
  const map = {};
  ary.map(s => map[s.id] = s.layout);
  return map;
}
const getItemConfig = (gridId, itemId) => {
  const ary = getPosition(gridId);
  const item = ary.find(s => s.id === itemId);
  return item && item.layout;
}

export const switchItem = (item: Muuri.Item) => {
  const g = item.getGrid();
  if (!g) {
    return;
  }
    const fromid = item.getElement()?.dataset.grid;
    const toid = g.getElement()?.dataset.grid;
    if (fromid !== toid) {
      const frompos = getPosition(fromid);
      const topos = getPosition(toid);
      const ele = item.getElement();
      const id = ele?.dataset.id;
      const idx = frompos.findIndex(s => s.id === id);
      if (idx >= 0) {
        const itemPos = frompos.splice(idx, 1);
        topos.push(itemPos[0]);
      }
      if (ele) {
        ele.dataset.grid = toid;
      }
    }
    g.refreshItems([item]);
}
const calculateLayout = (id) => (
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
  // console.log("to layout", id)
  var timerId = window.setTimeout(function () {
    // 实际内容
    const curlayout = LayoutMap.get(id) || {};
    const posmap = getPositionMap(id);
    const col = curlayout.col;
    const ary: ILayoutItem[] = (items || []).map((item, index) => {
      const id: string = item.getElement()?.dataset?.id || "";
      const gridId: string = item.getElement()?.dataset?.grid || "";
      const ele = posmap[id] || getItemConfig(gridId, id);
      const dragging = item.isDragging();
      if (dragging && ele) {
        const gridRect = grid.getElement().getBoundingClientRect();
        const itemRect = item.getElement()?.getBoundingClientRect() || {x:0,y:0};
        const relativeX = itemRect.x - gridRect.x;
        const relativeY = itemRect.y - gridRect.y;
        ele.x = getXGridPos(relativeX, width, Number(col));
        ele.y = relativeY;
      }
      const { x, y, w: wgrid } = ele || {};
      const m = item.getMargin();
      const w = Math.floor((width * Math.min(wgrid, col)) / col);
      const h = item.getHeight() + m.top + m.bottom;
      return {
        x: Math.floor((width * Number(x)) / Number(col)),
        y: Number(y),
        h,
        i: index,
        w,
        ele
      };
    });
    const h = placeLayout(ary, layout.slots, width);
    layout.styles.height = h + "px";
    callback(layout);
  }, 100);
  return function () {
    window.clearTimeout(timerId);
  };
};
export default calculateLayout;
