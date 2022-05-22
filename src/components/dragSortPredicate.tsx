import React from 'react'
import Muuri, { GridOptions } from "muuri";
export const grids: { [id: string]: Muuri } = {};;
const rootid = "wrapper";
const ckey = "data-container";
const cquery = `[${ckey}]`;
const querystr = (id, itemid) => `[${ckey}='${id}'] ${cquery}:not([${ckey}='${id}'] ${cquery} ${cquery}):not([data-id=${itemid}] ${cquery})`

// copy函数from muuri
function isOverlapping(a, b) {
  return !(
    a.left + a.width <= b.left ||
    b.left + b.width <= a.left ||
    a.top + a.height <= b.top ||
    b.top + b.height <= a.top
  );
}
function getIntersectionArea(a, b) {
  if (!isOverlapping(a, b)) return 0;
  var width = Math.min(a.left + a.width, b.left + b.width) - Math.max(a.left, b.left);
  var height = Math.min(a.top + a.height, b.top + b.height) - Math.max(a.top, b.top);
  return width * height;
}
function getIntersectionScore(a, b) {
  var area = getIntersectionArea(a, b);
  if (!area) return 0;
  var maxArea = Math.min(a.width, b.width) * Math.min(a.height, b.height);
  return (area / maxArea) * 100;
}

// copy end 
const getGridScore = (rect, grid): number => {
  const gridRect = grid.getElement().getBoundingClientRect();
  return getIntersectionScore(rect, gridRect);
}
const threshold = 50;
const handleGrids = (rootid, rect, itemid): Muuri => {
  let target: Muuri = grids[rootid];
  let bestScore = -1;
  const mapGrids = curids =>{
    let matched = false;
    curids.map(id => {
      const grid = grids[id];
      const subids: string[] = [];
      // 获取第一级嵌套子id列表
      grid.getElement().querySelectorAll(querystr(id, itemid)).forEach(value => {
        const cur = value.getAttribute(ckey);
        if (cur) {
          subids.push(cur);
        }
      });
      let cmatch = false;
      if (subids.length) {
        cmatch = mapGrids(subids);
      }
      // 如果没有子元素捕获
      if (!cmatch) {
        const score = getGridScore(rect, grid);
        if (score > threshold && score > bestScore) {
          bestScore = score;
          target = grid;
          matched = true;
        }
      } else {
        matched = true;
      }
    });
    return matched;
  }
  mapGrids([rootid]);
  return target;
}

export const dragSort = (item: Muuri.Item): Muuri[] => {
  let t = new Date().getTime();
  // 过滤当前元素包含的容器
  const itemElement = item.getElement();
  const itemid = itemElement?.dataset?.id;
  // 当前元素位置
  const itemRect = item.getElement()?.getBoundingClientRect() || { x: 0, y: 0 };
  // 已处理节点
  const target = handleGrids(rootid, itemRect, itemid);
  console.log(new Date().getTime()  - t, target.getElement().dataset?.container)
  return [target];
}

export default (options) =>  (item: Muuri.Item, event) => {

}