import { useMemo } from "react";
import Container from "./Container";
const TextDiv = (item) => <div className="item-content">{item.text}</div>;
const ContainerDiv = (item) => {
  const { children } = item;
  const position = useMemo(() => {
    return (children || []).map((s) => s.layout);
  }, [children]);
  return (
    <div className="sub">
      <div className="title">{item.text}</div>
      <Container
        id={item.id}
        col={4}
        position={position}
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
      >
        {(children || []).map((s) => {
          const Component = ComponentMap[s.type] || "div";
          return <Component key={s.id} {...s} />;
        })}
      </Container>
    </div>
  );
};
const ComponentMap: any = {
  text: TextDiv,
  container: ContainerDiv
};

export default function (props) {
  const { data } = props;
  const position = useMemo(() => {
    return (data || []).map((s) => s.layout);
  }, [data]);
  return (
    <Container
      id="wrapper"
      col={6}
      position={position}
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
    >
      {(data || []).map((s) => {
        const Component = ComponentMap[s.type] || "div";
        return <Component key={s.id} {...s} />;
      })}
    </Container>
  );
}
