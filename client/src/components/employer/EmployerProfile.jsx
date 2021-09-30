import moment from "moment";
import {
  Avatar,
  Paper,
  Typography,
  Input,
  IconButton,
} from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import { LocationOn, VerifiedUser } from "@material-ui/icons";
import { Rating } from "@material-ui/lab";

import { EMPLOYER_AVATAR_URL } from "../../helpers/helper";

const useStyles = makeStyles((theme) => ({
  profileContainer: {
    backgroundColor: "#f1f2f4",
    padding: "1% 12% 4% 12%",
  },
  profile: {},
  nameContainer: {
    padding: "4%",
    borderBottom: "1px solid #dfdfdf",
    display: "flex",
  },
  name: {
    marginTop: "15px",
    marginLeft: "15px",
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
  payment: {
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

const EmployerProfile = ({ employer, handleAvatarChange, btnLoading }) => {
  const classes = useStyles();
  const {
    avatar,
    firstName,
    lastName,
    isVerified,
    location,
    phone,
    rating,
    company,
    totalMoneySpent,
    payment,
    createdAt,
  } = employer;
  const { country, city } = location;
  const { name, description, website, tagline } = company;
  const { phoneNumber } = phone;
  const { amount } = totalMoneySpent;
  const { method } = payment;
  const { averageScore } = rating;

  return (
    <div className={classes.profileContainer}>
      <Paper className={classes.profile}>
        <div className={classes.nameContainer}>
          <Input
            accept="image/*"
            id="icon-button-file"
            type="file"
            style={{ display: "none" }}
            onChange={handleAvatarChange}
          />
          <label htmlFor="icon-button-file">
            <IconButton
              color="primary"
              aria-label="upload picture"
              component="span"
              size="small"
            >
              {avatar ? (
                <Avatar
                  className={classes.avatar}
                  alt={firstName + " " + lastName}
                  src={EMPLOYER_AVATAR_URL + avatar}
                  sx={{ width: 56, height: 56 }}
                />
              ) : (
                <Avatar className={classes.avatar}>
                  {firstName.charAt(0)}
                </Avatar>
              )}
            </IconButton>
          </label>

          <div className={classes.name}>
            <div className={classes.verifyContainer}>
              <Typography variant="h4">{firstName + " " + lastName}</Typography>
              {isVerified ? (
                <div style={{ marginLeft: "5px" }}>
                  <VerifiedUser fontSize="small" />
                </div>
              ) : (
                <Typography style={{ marginLeft: "5px" }}>
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
        </div>
        <div className={classes.infoDescription}>
          <div className={classes.infoContainer}>
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
              <Typography variant="h6">Money spent</Typography>
              <Typography variant="body2">
                $ <b>{amount}</b>
              </Typography>
            </div>
            <div>
              <Typography variant="body2">
                Member since <b>{moment(createdAt).format("ll")}</b>
              </Typography>
            </div>
          </div>
          <div>
            <div className={classes.description}>
              <Typography variant="h6">Company</Typography>
              <div style={{ padding: "2%" }}>
                <Typography variant="body1">
                  <b>{name}</b>
                </Typography>
                {website && (
                  <Typography variant="subtitle1">
                    Website:{" "}
                    <i>
                      {" "}
                      <a href={website} target="_blank" rel="noreferrer">
                        {website}
                      </a>
                    </i>
                  </Typography>
                )}
                {tagline && (
                  <Typography variant="subtitle1">
                    Tagline: <b>{tagline}</b>
                  </Typography>
                )}
                <Typography variant="subtitle1">{description}</Typography>
              </div>
            </div>
            <div className={classes.payment}>
              <Typography variant="h6">Payment Method</Typography>
              <div style={{ padding: "2%" }}>
                <Typography variant="subtitle1">Method: {method}</Typography>
              </div>
            </div>
          </div>
        </div>
      </Paper>
    </div>
  );
};

export default EmployerProfile;
