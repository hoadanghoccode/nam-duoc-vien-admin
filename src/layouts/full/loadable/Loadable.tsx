// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import { Spin } from "antd";
import { Suspense } from "react";

// ===========================|| LOADABLE - LAZY LOADING ||=========================== //

const Loadable = (Component: any) => (props: any) =>
  (
    <Suspense
      fallback={
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            height: "100vh",
          }}
        >
          <Spin size="large" />
        </div>
      }
    >
      <Component {...props} />
    </Suspense>
  );

export default Loadable;
