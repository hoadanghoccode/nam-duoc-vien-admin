import { ConfigProvider } from "antd";
import viVN from "antd/locale/vi_VN";
import { Route, BrowserRouter as Router, Routes } from "react-router-dom";
import "./App.css";
import RouterConfig from "./routes/Router";
import { ToastContainer } from "react-toastify";

function App() {
  return (
    <ConfigProvider locale={viVN}>
      <Router>
        <Routes>
          {RouterConfig.map((route, index) => (
            <Route key={index} path={route.path} element={route.element}>
              {route.children?.map((child, childIndex) => (
                <Route
                  key={childIndex}
                  path={child.path}
                  element={child.element}
                />
              ))}
            </Route>
          ))}
        </Routes>
      </Router>
      <ToastContainer />
    </ConfigProvider>
  );
}

export default App;
