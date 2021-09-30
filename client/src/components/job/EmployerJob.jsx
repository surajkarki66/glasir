import moment from "moment";
import { Typography } from "@material-ui/core";
import React from "react";
import { makeStyles } from "@material-ui/core/styles";
import { Link } from "react-router-dom";

export const useStyles = makeStyles((theme) => ({
  employerJobContainer: {
    margin: "2% 0 2% 0",
    backgroundColor: "#eaeaea",
    borderRadius: "4px",
    padding: "2% 2% 2% 3%",
  },
}));

const EmployerJob = ({ job }) => {
  const { jobStatus, createdAt, title, _id, pay, proposals, hired } = job;
  const { type, price } = pay;

  const classes = useStyles();
  return (
    <div className={classes.employerJobContainer}>
      <div>
        {" "}
        <div>
          <Link
            to={`/employer/my-jobs/${_id}/${title}`}
            style={{
              textDecoration: "none",
              color: "inherit",
              "&:hover": {
                "& h5": {
                  textDecoration: "underline",
                },
              },
            }}
          >
            <Typography variant="body1">
              <b>{title}</b>
            </Typography>
          </Link>
        </div>
        <div>
          {type === "hourly" ? (
            <Typography variant="body1"> Hourly: ${price.maxRate}</Typography>
          ) : (
            <Typography variant="body1"> Fixed: ${price.amount}</Typography>
          )}
        </div>
      </div>
      <div style={{ display: "flex", justifyContent: "space-between" }}>
        <div style={{ fontStyle: "italic" }}>
          <Typography variant="body1">
            {jobStatus.charAt(0).toUpperCase() + jobStatus.slice(1)}
          </Typography>
        </div>
        <div>
          <Typography variant="body1">Proposals: {proposals.length}</Typography>
        </div>
        <div>
          <Typography variant="body1">Hired: {hired.length}</Typography>
        </div>
        <div>
          <Typography variant="body1">
            <strong>{moment(createdAt).fromNow()}</strong>
          </Typography>
        </div>
      </div>
    </div>
  );
};

export default EmployerJob;
