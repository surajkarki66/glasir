import React from "react";
import { Avatar, Typography } from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import { VerifiedUser } from "@material-ui/icons";
import { Link } from "react-router-dom";

import { FREELANCER_AVATAR_URL } from "../../helpers/helper";

const useStyles = makeStyles((theme) => ({
  freelancerCardContainer: {
    border: "1px solid #dfdfdf",
    padding: "4%",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    marginRight: "2%",
  },
  freelancerContainer: {
    padding: "1% 3% 1% 3%",
    display: "grid",
    gridTemplateColumns: "8% auto",
    backgroundColor: "#eaeaea",
    borderRadius: "4px",
    margin: "1% 0 2% 0",
  },
  loadingIcon: {
    display: "flex",
    marginLeft: "45%",
    marginTop: "12%",
  },
  upperRight: {
    display: "flex",
    justifyContent: "center",
  },

  texts: {
    display: "flex",
    justifyContent: "start",
  },
  pagination: { position: "relative", left: 0, right: 0, bottom: 0 },

  skillList: {
    display: "flex",
    "& p": {
      padding: "1% 2% 1% 2%",
      backgroundColor: "#f2f2f2",
      marginRight: "2%",
      borderRadius: "15px",
    },
  },
  avatar: {
    height: `70px !important`, // whatever height
    width: `70px !important`, // whatever height
  },
}));

const FreelancerCard = ({ freelancer }) => {
  const classes = useStyles();
  const {
    _id,
    firstName,
    lastName,
    location,
    title,
    hourlyRate,
    avatar,
    overview,
    totalMoneyEarned,
    isVerified,
    expertise,
  } = freelancer;
  const { country, province } = location;
  return (
    <div className={classes.freelancerContainer}>
      <div className={classes.right}>
        <Link
          to={`/freelancer/${_id}/details`}
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
          {avatar ? (
            <Avatar
              className={classes.avatar}
              alt={firstName + " " + lastName}
              src={FREELANCER_AVATAR_URL + avatar}
              sx={{ width: 56, height: 56 }}
            />
          ) : (
            <Avatar className={classes.avatar}>{firstName.charAt(0)}</Avatar>
          )}
        </Link>
      </div>
      <div className={classes.left}>
        <div className={classes.texts}>
          <Typography variant="h6">
            <b>{firstName + " " + lastName}</b>
          </Typography>
          {isVerified ? (
            <div style={{ marginLeft: "5px" }}>
              <VerifiedUser fontSize="small" />
            </div>
          ) : (
            <Typography variant="body2" style={{ marginLeft: "5px" }}>
              <i> (Not verified)</i>
            </Typography>
          )}{" "}
        </div>
        <div>
          {" "}
          <Typography variant="body1">
            <i>
              <b>{title}</b>
            </i>
          </Typography>
        </div>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            marginTop: "1%",
          }}
        >
          <Typography variant="body1">
            Hourly: <b>${hourlyRate.amount}</b> \hr
          </Typography>
          <Typography variant="body1">
            <b>${totalMoneyEarned.amount}</b> earned
          </Typography>
          <Typography variant="body1">
            <b>
              {province}, {country}
            </b>
          </Typography>
        </div>
        <div className={classes.coverLetter}>
          <Typography variant="body1">{overview}</Typography>
        </div>

        <div className={classes.skillList}>
          {expertise &&
            expertise.skills.map((skill) => (
              <Typography key={skill} variant="body2">
                {skill}
              </Typography>
            ))}
        </div>
      </div>
    </div>
  );
};

export default FreelancerCard;
