import moment from "moment";
import { Typography } from "@material-ui/core";
import React from "react";
import { Link } from "react-router-dom";

import { proposalStyles } from "./styles";

const FreelancerProposal = ({ proposal }) => {
  const { status, createdAt, job, _id } = proposal;
  const { title } = job;
  const classes = proposalStyles();

  return (
    <div className={classes.freelancerProposalContainer}>
      {" "}
      <div style={{ fontStyle: "italic" }}>
        <Typography variant="body1">
          {status.charAt(0).toUpperCase() + status.slice(1)}
        </Typography>
      </div>
      <div>
        <Link
          to={`/proposals/${_id}`}
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
        <Typography variant="body1">
          <strong>{moment(new Date(createdAt)).fromNow()}</strong>
        </Typography>
      </div>
    </div>
  );
};

export default FreelancerProposal;
