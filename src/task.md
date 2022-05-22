1. 限制resize范围 ok
2. 嵌套容器撑开=>逐层resize=>现在的问题：里面resize后外面没有resize=>refreshItems前需要撑开格子 ok
3. 嵌套拖拽
    a. 拖拽后resize异常=>移动后入参仍然在原容器的地方
    多数值存到map，从map里取
    b. 嵌套不同级容器
4. responsive
5. drag from out

https://github.com/clauderic/dnd-kit
https://5fc05e08a4a65d0021ae0bf2-gngonedmxi.chromatic.com/?path=/story/core-droppable-usedroppable--collision-detection-algorithms
https://5fc05e08a4a65d0021ae0bf2-gngonedmxi.chromatic.com/?path=/docs/presets-sortable-multiple-containers--basic-setup
可能可以做drag/drop容器，处理多级嵌套的问题，前提是并存
dnd kit=>容器
muuri:布局
最好能依靠本身处理所有问题
=>重写dragSortPredicate
=>移动后清除缓存