import { createBrowserRouter } from "react-router";
import { Root } from "./Root";
import { Landing } from "./pages/Landing";
import { Results } from "./pages/Results";

export const router = createBrowserRouter([
  {
    path: "/",
    Component: Root,
    children: [
      { index: true, Component: Landing },
      { path: "search/:query", Component: Results },
    ],
  },
]);
