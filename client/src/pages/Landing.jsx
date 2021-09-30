import { Typography, Button } from "@material-ui/core";
import Widget from "rasa-webchat";
import { withRouter } from "react-router-dom";
import React, { useEffect } from "react";
import Cookie from "js-cookie";
import jwt_decode from "jwt-decode";

import WorkFlow from "../components/work-flow/GuideUser";
import background from "../hero.jpg";

const Landing = (props) => {
  useEffect(() => {
    const token = Cookie.get("token");
    if (token) {
      const { role } = jwt_decode(token);
      if (role === "freelancer") {
        props.history.push("/find-work/recommended");
      } else if (role === "employer") {
        props.history.push("/employer/home");
      } else {
        props.history.push("/admin");
      }
    }
  }, [props.history]);
  return (
    <div>
      <div>
        <header style={{ display: "flex", justifyContent: "start" }}>
          <div style={{ padding: "5%" }}>
            <Typography variant="h2">
              Join the world's <br /> work marketplace
            </Typography>
            <Typography variant="h6" style={{ marginTop: "10px" }}>
              <i>
                {" "}
                Find great talent. Build your business.
                <br /> Take your career to the next level.
              </i>
            </Typography>
            <div style={{ marginTop: "13px" }}>
              <Button
                color="primary"
                variant="contained"
                onClick={(e) => props.history.push("/sign-up")}
              >
                Join
              </Button>
            </div>
          </div>
          <div
            style={{
              marginLeft: "45px",
              marginTop: "25px",
            }}
          >
            <img
              src={background}
              height="350px"
              alt="header"
              style={{ borderRadius: "30px" }}
            />
          </div>
        </header>
        <WorkFlow />
      </div>

      <Widget
        initPayload={"/get_started"}
        socketUrl={"http://localhost:5005"}
        socketPath={"/socket.io/"}
        customData={{ language: "en" }}
        title={"Need help"}
      />
    </div>
  );
};

export default withRouter(Landing);
