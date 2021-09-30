import React from "react";
import Cookie from "js-cookie";
import { Route, Redirect } from "react-router-dom";

export const ProtectedRoute = ({ component: Component, ...rest }) => {
  return (
    <Route
      {...rest}
      render={(props) => {
        const token = Cookie.get("token");
        if (token) {
          return <Component {...props} />;
        } else {
          return (
            <Redirect
              to={{ pathname: "/sign-in", state: { from: props.location } }}
            />
          );
        }
      }}
    />
  );
};
