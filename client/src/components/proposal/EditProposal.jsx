import React, { useState } from "react";
import {
  TextField,
  Button,
  InputAdornment,
  CircularProgress,
  Typography,
} from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";

import { withRouter } from "react-router-dom";
import Axios from "../../axios-url";

const useStyles = makeStyles((theme) => ({
  formContainer: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    flexDirection: "column",
    height: "50vh",
  },
  fieldContainer: {
    display: "grid",
    minWidth: "30vw",
    "& *": {
      marginTop: "5px",
    },
  },
  button: {
    marginRight: theme.spacing(2),
    marginTop: "25px",
  },
}));

const SubmitForm = ({ proposal, token, history }) => {
  const classes = useStyles();
  const [loading, setLoading] = useState(false);
  const [fixedBidAmount, setFixedBidAmount] = useState(0);
  const [hourlyBidAmount, setHourlyBidAmount] = useState(0);
  const [error, setError] = useState("");
  const { job, freelancerId } = proposal;

  let formField;
  if (job.pay) {
    const { projectLengthInHours, pay } = job;
    const { type, price } = pay;

    formField = (
      <div className={classes.fieldContainer}>
        {" "}
        <TextField
          label={type === "fixed" ? "$ Fixed price" : "$ Hourly Rate"}
          variant="outlined"
          fullWidth
          margin="normal"
          defaultValue={
            type === "fixed" ? "$ " + price.amount : "$ " + price.maxRate
          }
          inputProps={{ readOnly: true }}
          startadornment={<InputAdornment position="start">$</InputAdornment>}
          size="small"
        />
        <TextField
          type="number"
          inputProps={{ inputmode: "numeric", pattern: "[0-9]*", min: 1 }}
          label={type === "fixed" ? "$ Bid Amount" : "$ Hourly Rate"}
          value={type === "fixed" ? fixedBidAmount : hourlyBidAmount}
          variant="outlined"
          placeholder="$ : Total amount the client will see on your proposal"
          onChange={
            type === "fixed"
              ? (e) => setFixedBidAmount(e.target.value)
              : (e) => setHourlyBidAmount(e.target.value)
          }
          fullWidth
          margin="normal"
          size="small"
          required
        />
        <TextField
          id="projectLengthInHours"
          label="Project Length"
          variant="outlined"
          margin="normal"
          value={Math.round(projectLengthInHours / 24) + " days"}
          inputProps={{ readOnly: true }}
          size="small"
        />
      </div>
    );
  }

  const changeTerms = (data) => {
    const { pay } = job;
    const { type } = pay;
    const { hourlyBidAmount, fixedBidAmount } = data;
    let updateData;

    if (type === "fixed") {
      updateData = {
        bidType: type,
        fixedBidAmount: fixedBidAmount,
      };
    } else {
      updateData = {
        bidType: type,
        hourlyBidAmount: hourlyBidAmount,
      };
    }

    setLoading(true);
    Axios.patch(
      `/api/v1/proposal/changeProposalDetails/${proposal._id}/${freelancerId}`,
      updateData,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    )
      .then((res) => {
        setLoading(false);
        history.push(`/proposals/${proposal._id}`);
      })
      .catch((error) => {
        setError(error.response.data.data.error);
        setLoading(false);
      });
  };
  const handleSubmit = (e) => {
    e.preventDefault();
    const data = { hourlyBidAmount, fixedBidAmount };
    changeTerms(data);
  };

  return (
    <>
      <form
        onSubmit={handleSubmit}
        className={classes.formContainer}
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          flexDirection: "column",
          height: "50vh",
        }}
      >
        <h3 style={{ textAlign: "center" }}>Change Terms</h3>
        {formField}
        {error ? (
          <Typography color="error" style={{ marginTop: "15px" }}>
            {error}
          </Typography>
        ) : null}
        <div>
          {" "}
          {loading ? (
            <div className={classes.button}>
              <CircularProgress size={23} />
            </div>
          ) : (
            <Button
              className={classes.button}
              variant="contained"
              color="primary"
              type="submit"
            >
              Submit
            </Button>
          )}
        </div>
      </form>
    </>
  );
};

export default withRouter(SubmitForm);
