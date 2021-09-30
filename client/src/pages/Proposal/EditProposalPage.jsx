import Cookie from "js-cookie";
import React from "react";
import { makeStyles } from "@material-ui/core/styles";
import { Container, Box, Paper } from "@material-ui/core";

import EditForm from "../../components/proposal/EditProposal";

const useStyles = makeStyles((theme) => ({
  container: {
    display: "flex",
    justifyContent: "center",
    marginTop: theme.spacing(1),
  },
}));

const EditProposalPage = ({ history }) => {
  const { state } = history.location;
  const { proposal } = state;
  const classes = useStyles();
  const token = Cookie.get("token");

  return (
    <Container className={classes.container} component={Box}>
      <Paper
        component={Box}
        p={4}
        style={{ boxShadow: "2px 2px 3px 2px #888888" }}
      >
        <EditForm proposal={proposal} token={token} />{" "}
      </Paper>
    </Container>
  );
};

export default EditProposalPage;
