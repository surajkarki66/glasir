import { makeStyles } from "@material-ui/core/styles";

export const useStyles = makeStyles((theme) => ({
  proposalMainContainer: {
    display: "grid",
    margin: "1% 8% 0 8%",
    [theme.breakpoints.down("xs")]: {
      margin: "1% 1% 0 1%",
    },
  },
  proposals: {
    marginTop: "2%",
  },
  loadingIcon: {
    display: "flex",
    marginLeft: "47%",
    marginTop: "17%",
  },
  pagination: { position: "absolute", left: 0, right: 0, bottom: 0 },
}));

export const proposalStyles = makeStyles((theme) => ({
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
  freelancerProposalContainer: {
    display: "flex",
    justifyContent: "space-between",
    margin: "2% 0 2% 0",
    backgroundColor: "#eaeaea",
    borderRadius: "4px",
    padding: "2% 2% 2% 3%",
  },
  tagsContainer: {
    display: "flex",
    "& p": {
      marginRight: "8px",
      backgroundColor: "#a2a2a2",
      padding: "8px 7px 5px 7px",
      borderRadius: "4px",
    },
  },
  clientInfo: {
    padding: "8%",
    borderBottom: "1px solid #cec7c6",
  },
  activity: {
    padding: "8%",
    borderBottom: "1px solid #cec7c6",
  },
  terms: {
    padding: "8%",
    borderBottom: "1px solid #cec7c6",
  },
  buttonContainer: {
    padding: "8%",
    display: "flex",
    flexDirection: "column",

    "& button": {
      marginBottom: "20px",
    },
  },
  coverLetterContainer: {
    "& div": {
      padding: "0%",
    },
  },
}));
