import moment from "moment";
import { Typography } from "@material-ui/core";
import React from "react";
import { Link } from "react-router-dom";
import { makeStyles } from "@material-ui/core/styles";

export const useStyles = makeStyles((theme) => ({
  proposalContainer: {
    marginTop: "5px",
    display: "grid",
    gridTemplateColumns: "75% auto",
  },
  detailContainer: {
    borderRight: "1px solid #cec7c6",
    "& div": {
      padding: "3%",
      borderBottom: "1px solid #cec7c6",
    },
  },
  contractContainer: {
    display: "flex",
    justifyContent: "space-between",
    margin: "2% 0 2% 0",
    backgroundColor: "#eaeaea",
    borderRadius: "4px",
    padding: "2% 2% 2% 3%",
  },
}));
const ContractCard = ({ contract }) => {
  const { contractTitle, _id, isClosed, isActive, createdAt, job } = contract;
  const { title } = job;

  const classes = useStyles();

  return (
    <div className={classes.contractContainer}>
      {" "}
      <div style={{ fontStyle: "italic" }}>
        <Typography variant="body1">
          {isActive ? "Active" : "Not active"}
        </Typography>
        <Typography variant="body1">{isClosed && "( Closed )"}</Typography>
        <Link to={`/find-work/jobs/details/${job._id}`}>
          <Typography variant="body2">
            <b>{title}</b>
          </Typography>
        </Link>
      </div>
      <div>
        <Link
          to={`/contracts/${_id}/details`}
          style={{ flexGrow: 1, textDecoration: "none", color: "inherit" }}
        >
          <Typography variant="body1">
            <b>{contractTitle}</b>
          </Typography>
        </Link>
      </div>
      <div>
        <Typography variant="body1">
          <strong>{moment(createdAt).fromNow()}</strong>
        </Typography>
      </div>
    </div>
  );
};

export default ContractCard;
