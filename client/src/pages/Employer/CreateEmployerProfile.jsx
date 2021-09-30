import Cookie from "js-cookie";
import jwt_decode from "jwt-decode";
import React, { useEffect } from "react";
import { Paper, Box, Container } from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import { useSelector, useDispatch } from "react-redux";
import { withRouter } from "react-router-dom";
import CreateProfileForm from "../../components/employer/CreateProfileForm";

import { checkProfile } from "../../actions/checkProfile";

const useStyles = makeStyles((theme) => ({
  container: {
    display: "flex",
    justifyContent: "center",
    marginTop: theme.spacing(1),
  },
  paper: {
    boxShadow: "2px 2px 3px 2px #888888",
  },
}));

const CreateEmployerProfile = ({ history }) => {
  const classes = useStyles();
  const token = Cookie.get("token");
  const { role } = jwt_decode(token);
  const dispatch = useDispatch();

  const profile = useSelector((state) => state.checkProfileState);
  useEffect(() => {
    if (!profile.data) {
      dispatch(checkProfile(token));
    }
    if (profile.data) {
      const { hasProfile } = profile.data;
      if (hasProfile) {
        if (role === "employer") {
          history.push("/employer/home");
        }
        if (role === "freelancer") {
          history.push("/find-work/recommended");
        }
      }
    }
  }, [dispatch, history, profile.data, role, token]);

  return (
    <Container className={classes.container}>
      <Paper component={Box} p={4} className={classes.paper}>
        <h3 style={{ textAlign: "center" }}>Create Profile</h3>
        <CreateProfileForm token={token} />
      </Paper>
    </Container>
  );
};

export default withRouter(CreateEmployerProfile);
