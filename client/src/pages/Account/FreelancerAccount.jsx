import { useSelector } from "react-redux";
import React, { useState } from "react";
import { makeStyles } from "@material-ui/core/styles";
import {
  CircularProgress,
  Typography,
  Container,
  Box,
  Paper,
} from "@material-ui/core";

const useStyles = makeStyles((theme) => ({
  root: {
    padding: "2% 5% 5% 5%",
    backgroundColor: "#f2f2f2",
  },
  loadingIcon: {
    display: "flex",
    marginLeft: "47%",
    marginTop: "15%",
  },

  accountContainer: {
    display: "flex",
    justifyContent: "center",
    marginTop: theme.spacing(3),
  },
}));

const Account = (props) => {
  const classes = useStyles();
  const { currentBalance, user } = props.profile;
  return (
    <Container className={classes.accountContainer} component={Box}>
      <Paper
        component={Box}
        p={4}
        style={{ boxShadow: "2px 2px 3px 2px #888888" }}
      >
        <Typography variant="h6">
          Username: <b>{user && user.username}</b>
        </Typography>
        <Typography variant="h6">
          Email: <b>{user && user.email}</b>
        </Typography>
        <Typography variant="h6">
          Current Balance: $<b>{currentBalance && currentBalance.amount}</b>
        </Typography>
      </Paper>
    </Container>
  );
};
const AccountPage = () => {
  const classes = useStyles();

  // eslint-disable-next-line no-unused-vars
  const [error, setError] = useState("");
  const { data } = useSelector((state) => state.checkProfileState);

  return (
    <div className={classes.root}>
      <Typography variant="h5" style={{ textAlign: "center" }}>
        My Account
      </Typography>
      <div>
        {data ? (
          <>
            <Account profile={data.data} />
          </>
        ) : (
          <div className={classes.loadingIcon}>
            <CircularProgress variant="indeterminate" disableShrink size={80} />
          </div>
        )}
      </div>
    </div>
  );
};

export default AccountPage;
