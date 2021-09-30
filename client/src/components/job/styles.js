import { makeStyles } from "@material-ui/core/styles";

export const useStyles = makeStyles((theme) => ({
  jobBoardContainer: {
    display: "grid",
    margin: "1% 8% 0 8%",
    [theme.breakpoints.down("xs")]: {
      margin: "1% 1% 0 1%",
    },
  },
  jobRequests: {
    marginTop: "2%",
  },
  loadingIcon: {
    display: "flex",
    marginLeft: "47%",
    marginTop: "18%",
  },
  pagination: { position: "relative", left: 0, right: 0, bottom: 0 },
}));

export const jobRequestStyles = makeStyles((theme) => ({
  jobRequestLink: {
    textDecoration: "none",
    color: "inherit",
    "&:hover": {
      "& h5": {
        textDecoration: "underline",
      },
    },
  },
  jobRequestContainer: {
    padding: "2% 3% 1% 3%",
    display: "grid",
    gridTemplateColumns: "80% auto",
    backgroundColor: "#eaeaea",
    borderRadius: "4px",
    margin: "3% 0 5% 0",
  },
  left: {
    borderRight: "1px solid #cecece",
  },
  texts: {
    display: "grid",
    gridTemplateRows: "55px 90px",
  },
  ratingsTagsContainer: {
    display: "flex",
  },
  ratings: { marginTop: "1%" },
  tagsContainer: {
    display: "flex",
    marginLeft: "15px",
    "& p": {
      marginRight: "8px",
      backgroundColor: "#a2a2a2",
      padding: "8px 7px 5px 7px",
      borderRadius: "4px",
    },
  },
  iconsContainer: {
    display: "flex",
    justifyContent: "end",
    width: "100%",
    marginRight: "2%",
    "& svg": {
      "&:hover": {
        cursor: "pointer",
      },
    },
    marginTop: "0.4%",
  },
  verifyContainer: {
    display: "flex",
    justifyContent: "end",
    marginTop: "1%",
    marginRight: "1%",
  },
  locationContainer: {
    display: "flex",
    justifyContent: "start",
    width: "100%",
    marginLeft: "2%",
  },
  proposalContainer: {
    display: "flex",
    justifyContent: "start",
    width: "100%",
    marginLeft: "3%",
  },
  upperRight: {
    display: "flex",
    justifyContent: "center",
  },
  timeContainer: {
    marginLeft: "8%",
  },
  levelContainer: {
    marginLeft: "10%",
  },
  typeContainer: {
    position: "relative",
    right: "3%",
  },
  budgetContainer: {
    position: "relative",
    left: "21%",
  },
  lowerRight: {
    display: "flex",
    justifyContent: "center",
    marginTop: "5%",
  },
  lower: {
    marginTop: "5%",
    display: "flex",
    justifyContent: "center",
  },
  spentContainer: {
    marginTop: "5%",
  },
}));

export const filterOptionsStyles = makeStyles((theme) => ({
  root: {
    width: 300,
  },
}));
