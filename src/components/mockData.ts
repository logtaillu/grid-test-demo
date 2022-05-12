const data = ["first" /**, "bbb", "ccc" */].map((text, idx) => ({
  id: text,
  type: "container",
  text: text,
  layout: {
    w: 2,
    x: idx * 2,
    y: 0,
    i: text,
    h: 400
  },
  children:
    idx === 0
      ? ["second"].map((f, e) => ({
          id: `${text}-${f}`,
          type: "container",
          text: f,
          layout: {
            w: 4,
            x: 0,
            y: e,
            i: `${text}-${f}`
          },
          children: ["item1", "item2"].map((t, idd) => ({
            id: `${text}-${f}-${t}`,
            type: "text",
            text: t,
            layout: {
              w: 2,
              x: idd * 2,
              y: 0,
              i:  `${text}-${f}-${t}`,
              h: 110,
              autoh: false
            }
          }))
        }))
      : ["sub1", "sub2", "sub3", "sub4"].map((t, idd) => ({
          id: text + idd,
          type: "text",
          text: t,
          layout: {
            w: 4,
            x: 0,
            y: idd,
            i: text + idd,
            h: 100
          }
        }))
}));
export default data;
