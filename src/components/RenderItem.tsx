import { Fragment, useMemo } from "react";
import Container from "./Container";
const dragContainer: any = () => document.querySelector(".drag-container");
const TextDiv = (item) => <div className="item-content">{item.text}</div>;
const ContainerDiv = (item) => {
    const { children } = item;
    return (
        <div className="sub">
            <div className="title">{item.text}</div>
            <Container
                id={item.id}
                col={4}
                data={children}
                dragEnabled={true}
                resizeable={true}
                dragStartPredicate={{ delay: 0, distance: 1 }}
                dragContainer={dragContainer()}
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

export default function ({item}) {
    const Component = ComponentMap[item.type] || "div";
    return <Component key={item.id} {...item} />;
}