import { Fragment, useMemo } from "react";
import Container from "./Container";
const dragContainer: any = () => document.querySelector(".drag-container");


export default function (props) {
  const { data } = props;
  return (
    <Fragment>
      <Container
        id="wrapper"
        col={6}
        dragContainer={dragContainer()}
        data={data}
        dragEnabled={true}
        resizeable={true}
        dragStartPredicate={{ delay: 0, distance: 1 }}
        dragPlaceholder={{
          enabled: true,
          createElement(item) {
            const ele: any = item.getElement();
            return ele ? ele.cloneNode(true) : document.createElement("div");
          }
        }}
      />
    </Fragment>
  );
}
