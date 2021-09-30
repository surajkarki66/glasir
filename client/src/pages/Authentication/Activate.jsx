import jwt_decode from "jwt-decode";
import { Button, CircularProgress, Typography } from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import React, { useState } from "react";
import { Redirect } from "react-router";
import { useParams } from "react-router-dom";

import Axios from "../../axios-url";

const useStyles = makeStyles((theme) => ({
  verifyEmail: {
    marginTop: "220px",
    flexDirection: "column",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
  },
}));

const Activate = () => {
  const classes = useStyles();
  const { token } = useParams("");
  const { role } = jwt_decode(token);

  const [loading, setLoading] = useState(false);
  const [verificationError, setVerificationError] = useState("");
  const [isSuccess, setIsSuccess] = useState(false);

  const onClickActiveBtn = (e) => {
    e.preventDefault();
    activate(token);
  };

  const activate = (token) => {
    setLoading(true);
    Axios.patch("/api/v1/user/activate/", { token })
      .then((res) => {
        setLoading(false);
        setIsSuccess(true);
        setVerificationError("");
      })
      .catch((err) => {
        const { data } = err.response;
        setLoading(false);
        setIsSuccess(false);
        setVerificationError(data.data.error);
      });
  };

  if (isSuccess) {
    if (role === "freelancer") {
      alert("Your account is activated successfully !");
      return <Redirect to="/find-work/recommended" />;
    }
    if (role === "employer") {
      alert("Your account is activated successfully !");
      return <Redirect to="/employer/home" />;
    }
  }
  return (
    <>
      {loading ? (
        <div style={{ display: "flex", marginLeft: "47%", marginTop: "17%" }}>
          <CircularProgress size={80} />
        </div>
      ) : (
        <div className={classes.verifyEmail}>
          <Typography variant="h5" style={{ textAlign: "center" }}>
            Activate your account
          </Typography>
          <Button
            style={{ marginTop: "10px" }}
            variant="contained"
            color="primary"
            onClick={onClickActiveBtn}
            loading={loading}
          >
            Activate
          </Button>
          {verificationError && <h4>{verificationError}</h4>}
        </div>
      )}
      );
    </>
  );
};

export default Activate;
