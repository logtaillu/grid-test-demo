import "./styles.css";
import Test from "./components/Test";
import { useState } from "react";
import mockData from "./components/mockData";
export default function App() {
  const [data, setData] = useState(mockData);
  return (
    <div className="App">
      <button
        onClick={() => {
          console.log(data);
        }}
      >
        get layout
      </button>
      <Test data={data} />
    </div>
  );
}
