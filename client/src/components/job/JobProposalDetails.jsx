import moment from "moment";
import { Avatar, Paper, Typography } from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import { LocationOn, VerifiedUser } from "@material-ui/icons";
import { Rating } from "@material-ui/lab";
import { Link } from "react-router-dom";

import HireCheck from "../proposal/HireCheck";

import { FREELANCER_AVATAR_URL } from "../../helpers/helper";

const useStyles = makeStyles((theme) => ({
  profileContainer: {
    backgroundColor: "#f1f2f4",
    padding: "0% 12% 4% 12%",
  },
  profile: {},
  nameContainer: {
    padding: "4%",
    borderBottom: "1px solid #dfdfdf",
    display: "flex",
  },
  name: {
    marginTop: "15px",
    marginLeft: "12px",
    "& h4": {
      fontWeight: "bold",
    },
  },
  infoDescription: {
    display: "grid",
    gridTemplateColumns: "30% auto",
  },
  infoContainer: {
    borderRight: "1px solid #dfdfdf",
    padding: "12%",
    "& div": {
      marginBottom: "8%",
    },
  },
  description: {
    padding: "4%",
    borderBottom: "1px solid #dfdfdf",
  },
  skills: {
    padding: "4%",
    borderBottom: "1px solid #dfdfdf",
  },
  skillList: {
    display: "flex",
    "& p": {
      padding: "1% 2% 1% 2%",
      backgroundColor: "#f2f2f2",
      marginRight: "2%",
      borderRadius: "15px",
    },
  },
  employment: {
    padding: "4%",
    borderBottom: "1px solid #dfdfdf",
  },
  verifyPhoneContainer: {
    display: "flex",
    justifyContent: "start",
  },
  verifyContainer: {
    display: "flex",
    justifyContent: "start",
  },
  locationContainer: {
    display: "flex",
    justifyContent: "start",
    width: "100%",
  },
  avatar: {
    height: `90px !important`, // whatever height
    width: `90px !important`, // whatever height
  },
}));

const JobProposalDetails = ({ details, jobId }) => {
  const classes = useStyles();
  const { freelancer, coverLetter, bidType, fixedBidAmount, hourlyBidAmount } =
    details;
  let Details;
  if (freelancer) {
    const {
      _id,
      avatar,
      firstName,
      lastName,
      overview,
      hourlyRate,
      isVerified,
      location,
      phone,
      rating,
      totalMoneyEarned,
      createdAt,
      englishLanguage,
      title,
    } = freelancer;

    const { proficiency } = englishLanguage;
    const { country, city } = location;

    const { averageScore } = rating;
    const { phoneNumber } = phone;
    const { amount } = totalMoneyEarned;
    Details = (
      <Paper className={classes.profile}>
        <div className={classes.nameContainer}>
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
          <div className={classes.name}>
            <div className={classes.verifyContainer}>
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
                <Typography variant="h4">
                  {firstName + " " + lastName}
                </Typography>{" "}
              </Link>
              {isVerified ? (
                <div>
                  <VerifiedUser fontSize="small" />
                </div>
              ) : (
                <Typography variant="caption" style={{ marginLeft: "1px" }}>
                  <i> (Not verified)</i>
                </Typography>
              )}{" "}
            </div>
            <div className={classes.locationContainer}>
              <LocationOn fontSize="small" style={{ marginTop: "1px" }} />
              <Typography variant="subtitle1">
                {city}, {country}
              </Typography>
            </div>
          </div>
          <div style={{ marginLeft: "50%" }}>
            <HireCheck
              jobId={jobId}
              freelancerId={_id}
              proposalId={details._id}
              bidType={bidType}
              fixedBidAmount={fixedBidAmount}
              hourlyBidAmount={hourlyBidAmount}
            />
          </div>
        </div>
        <div className={classes.infoDescription}>
          <div className={classes.infoContainer}>
            <div>
              <Typography variant="h6">Hourly rate</Typography>
              <Typography variant="body2" style={{ marginTop: "4px" }}>
                $ {hourlyRate.amount}
              </Typography>
            </div>
            <div>
              <div>
                <Typography variant="h6">Rating</Typography>
                <Rating
                  name="disabled"
                  value={averageScore}
                  precision={0.5}
                  disabled
                />
                <span style={{ bottom: "5px", position: "relative" }}>
                  {" "}
                  ({rating.rateCounts}{" "}
                  {rating.rateCounts <= 1 ? "review" : "reviews"})
                </span>
              </div>
              <Typography variant="h6">Availability</Typography>
              <Typography variant="body2" style={{ marginTop: "4px" }}>
                <i> As Needed - Open to Offers</i>
              </Typography>
            </div>
            <div>
              <Typography variant="h6">Language</Typography>
              <Typography variant="body2" style={{ marginTop: "4px" }}>
                English: <b>{proficiency}</b>
              </Typography>
            </div>

            <div>
              <Typography variant="h6">Phone</Typography>

              <div className={classes.verifyPhoneContainer}>
                <Typography variant="body2">{phoneNumber} </Typography>
                {phone.isVerified ? (
                  <div style={{ marginLeft: "3%" }}>
                    <VerifiedUser fontSize="small" />
                  </div>
                ) : (
                  <Typography variant="caption" style={{ marginLeft: "3%" }}>
                    <b>
                      {" "}
                      <i> (Not verified)</i>
                    </b>
                  </Typography>
                )}{" "}
              </div>
            </div>
            <div>
              <Typography variant="h6">Money earned</Typography>
              <Typography variant="body2">$ {amount}</Typography>
            </div>
            <div>
              <Typography variant="body1">
                Member since <b>{moment(new Date(createdAt)).format("ll")}</b>
              </Typography>
            </div>
          </div>
          <div>
            <div className={classes.description}>
              <Typography variant="h5">{title}</Typography>
              <Typography variant="body2" style={{ marginTop: "15px" }}>
                {overview}
              </Typography>
            </div>
            <div className={classes.description}>
              <Typography variant="h5">Cover letter</Typography>
              <pre
                style={{
                  whiteSpace: "pre-line",
                  lineHeight: "20px",
                }}
              >
                <Typography variant="body2" style={{ marginTop: "15px" }}>
                  {coverLetter}
                </Typography>
              </pre>
            </div>
          </div>
        </div>
      </Paper>
    );
  }

  return <div className={classes.profileContainer}>{Details}</div>;
};

export default JobProposalDetails;
