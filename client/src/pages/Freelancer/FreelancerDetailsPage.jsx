import Cookie from "js-cookie";
import React, { useState, useEffect, useCallback } from "react";
import { useParams } from "react-router-dom";
import moment from "moment";
import { Avatar, Paper, Typography, CircularProgress } from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import { LocationOn, VerifiedUser } from "@material-ui/icons";
import { Rating } from "@material-ui/lab";
import Axios from "../../axios-url";

import {
  FREELANCER_AVATAR_URL,
  FREELANCER_DOCUMENTS_FILES_URL,
} from "../../helpers/helper";

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
    marginLeft: "15px",
    marginTop: "15px",
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
const FreelancerDetailsPage = () => {
  const { id } = useParams();
  const [loading, setLoading] = useState(false);
  // eslint-disable-next-line no-unused-vars
  const [error, setError] = useState("");
  const [freelancer, setFreelancer] = useState({});
  const token = Cookie.get("token");
  const classes = useStyles();
  const getFreelancerDetails = useCallback(
    async (freelancerId) => {
      setLoading(true);
      try {
        const res = await Axios.get(`/api/v1/freelancer/${freelancerId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const { data, status } = res.data;
        if (status === "success") {
          setFreelancer(data);
          setLoading(false);
        }
        setLoading(false);
      } catch (error) {
        setError(error.response.data.data.error);
        setLoading(false);
      }
    },
    [setError, token]
  );

  useEffect(() => {
    if (id) {
      getFreelancerDetails(id);
    }
  }, [getFreelancerDetails, id]);

  let details;
  if (freelancer) {
    const {
      avatar,
      firstName,
      lastName,
      overview,
      hourlyRate,
      isVerified,
      location,
      phone,
      rating,
      education,
      employments,
      totalMoneyEarned,
      createdAt,
      citizenship,
      resume,
      expertise,
      englishLanguage,
      title,
    } = freelancer;
    if (
      expertise &&
      englishLanguage &&
      location &&
      education &&
      rating &&
      phone &&
      totalMoneyEarned
    ) {
      const { skills, service, expertiseLevel } = expertise;
      const { proficiency } = englishLanguage;
      const { country, city } = location;
      const { school, degree, areaOfStudy, datesAttended } = education;
      const { averageScore } = rating;
      const { phoneNumber } = phone;
      const { amount } = totalMoneyEarned;
      details = (
        <Paper className={classes.profile}>
          <div className={classes.nameContainer}>
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

            <div className={classes.name}>
              <div className={classes.verifyContainer}>
                <Typography variant="h4">
                  {firstName + " " + lastName}
                </Typography>
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
                <Typography variant="h6">Hourly rate</Typography>
                <Typography variant="body" style={{ marginTop: "4px" }}>
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
              {education && (
                <div>
                  <Typography variant="h6">Education</Typography>
                  <Typography variant="body1" style={{ marginTop: "4px" }}>
                    {school}
                  </Typography>
                  <Typography variant="subtitle1">
                    ({areaOfStudy}, {degree})
                  </Typography>
                  <Typography variant="subtitle2">
                    <b>
                      {datesAttended && (
                        <>
                          {" "}
                          {moment(new Date(datesAttended.from)).format(
                            "ll"
                          )} - {moment(new Date(datesAttended.to)).format("ll")}{" "}
                        </>
                      )}{" "}
                    </b>
                  </Typography>
                </div>
              )}

              <div>
                <Typography variant="h6">Phone</Typography>

                <div className={classes.verifyPhoneContainer}>
                  <Typography variant="body1">{phoneNumber} </Typography>
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
                <Typography variant="body1">$ {amount}</Typography>
              </div>
              <div>
                <Typography variant="body1">
                  Member since <b>{moment(new Date(createdAt)).format("ll")}</b>
                </Typography>
              </div>
            </div>
            <div>
              <div className={classes.description}>
                <Typography variant="h6">
                  <b>{title}</b>
                </Typography>
                <Typography variant="body2" style={{ marginTop: "15px" }}>
                  {overview}
                </Typography>
              </div>
              <div className={classes.description}>
                <Typography variant="h6">Expertise</Typography>
                <Typography variant="body1" style={{ marginTop: "10px" }}>
                  <b>{service}</b>
                </Typography>
                <Typography variant="body1">({expertiseLevel})</Typography>
              </div>
              <div className={classes.skills}>
                <Typography variant="h6">Skills</Typography>
                <div className={classes.skillList}>
                  {skills.map((skill) => (
                    <Typography key={skill} variant="body2">
                      {skill}
                    </Typography>
                  ))}
                </div>
              </div>
              <div>
                {employments && (
                  <div className={classes.employment}>
                    <Typography variant="h6">Employment History</Typography>
                    <div style={{ padding: "2%" }}>
                      {employments.map((e) => (
                        <>
                          <Typography variant="h6">{e.company}</Typography>
                          <div className={classes.locationContainer}>
                            <Typography variant="caption">
                              {e.location.city}, {e.location.country}
                            </Typography>
                          </div>
                          <Typography variant="body1">{e.title}</Typography>
                          <Typography variant="subtitle2">
                            <b>
                              ( {moment(new Date(e.period.from)).format("ll")} -{" "}
                              {moment(new Date(e.period.to)).format("ll")} )
                            </b>
                          </Typography>
                        </>
                      ))}
                    </div>
                  </div>
                )}
              </div>
              <div>
                <div className={classes.employment}>
                  <Typography variant="h6">Documents</Typography>
                  {resume && (
                    <div
                      style={{
                        marginTop: "4px",
                        borderBottom: "0px",
                        display: "flex",
                        justifyContent: "left",
                        paddingLeft: 0,
                        paddingRight: 0,
                        paddingBottom: 0,
                        paddingTop: 0,
                      }}
                    >
                      <a
                        href={`${FREELANCER_DOCUMENTS_FILES_URL + resume}`}
                        style={{ color: "#303f9f" }}
                        download
                      >
                        <Typography variant="body2"> {resume}</Typography>
                      </a>
                    </div>
                  )}
                  {citizenship && (
                    <div
                      style={{
                        marginTop: "4px",
                        borderBottom: "0px",
                        display: "flex",
                        justifyContent: "left",
                        paddingLeft: 0,
                        paddingRight: 0,
                        paddingBottom: 0,
                        paddingTop: 0,
                      }}
                    >
                      <a
                        href={`${FREELANCER_DOCUMENTS_FILES_URL + citizenship}`}
                        style={{ color: "#303f9f" }}
                        download
                      >
                        <Typography variant="body2"> {citizenship}</Typography>
                      </a>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </Paper>
      );
    }
  }
  return (
    <div>
      {!loading && freelancer ? (
        <div className={classes.profileContainer}> {details}</div>
      ) : (
        <div style={{ display: "flex", marginLeft: "47%", marginTop: "18%" }}>
          <CircularProgress variant="indeterminate" disableShrink size={80} />
        </div>
      )}
    </div>
  );
};

export default FreelancerDetailsPage;
