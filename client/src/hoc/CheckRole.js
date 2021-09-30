import Cookie from "js-cookie";
import jwt_decode from "jwt-decode";
import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";

import { checkProfile } from "../actions/checkProfile";

function CheckRole(ComposedClass, userRole) {
  function RoleCheck(props) {
    const token = Cookie.get("token");
    const { role } = jwt_decode(token);
    const dispatch = useDispatch();
    const profile = useSelector((state) => state.checkProfileState);
    const { checkProfileSuccessfulRedirect } = profile;
    useEffect(() => {
      if (role === userRole) {
        dispatch(checkProfile(token));
      } else {
        if (role === "freelancer") {
          props.history.push("/find-work/recommended");
        } else if (role === "employer") {
          props.history.push("/employer/home");
        } else {
          props.history.push("/admin");
        }
      }
    }, [props.history, dispatch, role, token]);
    if (checkProfileSuccessfulRedirect) {
      const { data } = profile;
      const { hasProfile } = data;
      if (!hasProfile) {
        if (role === "freelancer") {
          props.history.push("/freelancer/createProfile");
        }
        if (role === "employer") {
          props.history.push("/employer/createProfile");
        }
        if (role === "admin") {
          props.history.push("/admin");
        }
      } else {
        if (role === "freelancer") {
          if (data && data.data) {
            const { expertise } = data.data;
            localStorage.setItem("service", expertise && expertise.service);
          }
        }

        return <ComposedClass {...props} />;
      }
    }

    return <ComposedClass {...props} />;
  }
  return RoleCheck;
}

export default CheckRole;
