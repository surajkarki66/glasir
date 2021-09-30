import Cookie from "js-cookie";
import React from "react";
import { Paper, Box, Container } from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import { useSelector } from "react-redux";

import CreateJobForm from "../../components/job/CreateJobForm";

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

const CreateJob = ({ history }) => {
  const classes = useStyles();
  const token = Cookie.get("token");
  const profile = useSelector((state) => state.checkProfileState);

  return (
    <Container className={classes.container}>
      <Paper component={Box} p={4} className={classes.paper}>
        {profile.data ? (
          <>
            <h3 style={{ textAlign: "center" }}>Post a job</h3>
            <CreateJobForm employer={profile.data} token={token} />
          </>
        ) : null}
      </Paper>
    </Container>
  );
};

export default CreateJob;
