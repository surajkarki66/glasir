import React from "react";
import { useParams } from "react-router-dom";
import { makeStyles } from "@material-ui/core/styles";
import { Typography } from "@material-ui/core";
import EmployerJobDetail from "../../components/job/EmployerJobDetail";

export const useStyles = makeStyles((theme) => ({
  jobMainContainer: {
    display: "grid",
    margin: "1% 8% 0 8%",
    [theme.breakpoints.down("xs")]: {
      margin: "1% 1% 0 1%",
    },
  },
  jobs: {
    marginTop: "2%",
  },
  loadingIcon: {
    display: "flex",
    marginLeft: "47%",
    marginTop: "17%",
  },
  pagination: { position: "relative", left: 0, right: 0, bottom: 0 },
}));

const EmployerJobDetailPage = () => {
  const classes = useStyles();

  const { jobId, title } = useParams();

  return (
    <div className={classes.jobMainContainer}>
      <div>
        <Typography variant="h5" style={{ marginTop: "18px" }}>
          {title}
        </Typography>
      </div>

      <EmployerJobDetail id={jobId} />
    </div>
  );
};

export default EmployerJobDetailPage;
