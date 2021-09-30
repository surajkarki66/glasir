import Cookie from "js-cookie";
import { useSelector, useDispatch } from "react-redux";
import React, { useEffect } from "react";
import { useParams } from "react-router-dom";
import { Container, Paper, Box } from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import { CircularProgress } from "@material-ui/core";

import { checkProfile } from "../../actions/checkProfile";
import ContractForm from "../../components/contract/ContractForm";

const useStyles = makeStyles((theme) => ({
  container: {
    display: "flex",
    justifyContent: "center",
    marginTop: theme.spacing(1),
  },
  loadingIcon: {
    display: "flex",
    marginTop: "16%",
  },
}));

const HireFreelancerPage = ({ history }) => {
  const classes = useStyles();
  const { jobId, freelancerId } = useParams();
  const dispatch = useDispatch();
  const profile = useSelector((state) => state.checkProfileState);
  const token = Cookie.get("token");
  const { location } = history;
  const { bidType, proposalId, fixedBidAmount, hourlyBidAmount } =
    location.state;

  useEffect(() => {
    if (!profile.data) {
      dispatch(checkProfile(token));
    }
  }, [dispatch, profile.data, token]);

  return (
    <Container className={classes.container} component={Box}>
      {profile.data ? (
        <Paper
          component={Box}
          p={4}
          style={{ boxShadow: "2px 2px 3px 2px #888888" }}
        >
          <h3 style={{ textAlign: "center" }}>Create Contract</h3>
          <ContractForm
            jobId={jobId}
            freelancerId={freelancerId}
            proposalId={proposalId}
            bidType={bidType}
            hourlyBidAmount={hourlyBidAmount && hourlyBidAmount.amount}
            fixedBidAmount={fixedBidAmount && fixedBidAmount.amount}
            employerId={profile.data ? profile.data.data._id : null}
            token={token}
          />{" "}
        </Paper>
      ) : (
        <div className={classes.loadingIcon}>
          <CircularProgress variant="indeterminate" disableShrink size={80} />
        </div>
      )}
    </Container>
  );
};

export default HireFreelancerPage;
