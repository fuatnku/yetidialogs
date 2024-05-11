import { ChakraProvider } from "@chakra-ui/react";
import { useState } from "react";
import { Workflow } from "./Workflow/Workflow";
import { useStoreState } from 'react-flow-renderer';


function App() {
  const [count, setCount] = useState(0);
//  const elements = useStoreState((state) => state.elements);

//  console.log(elements);

  return (
    <ChakraProvider>
      <Workflow />
    </ChakraProvider>
  );
}

export default App;
