import { makeStyles } from "@material-ui/core/styles";

export const useStyles = makeStyles((theme) => ({
  root: {
    display: "flex",
    flexDirection: "column",
    minHeight: "8vh",
  },
  footer: {
    // padding: theme.spacing(3, 2),
    textAlign: "center",
    marginTop: "auto",
    backgroundColor: "#3f51b5",
    color: "white",
    position: "fixed",
    bottom: 0,
    left: 0,
    width: "100%",
  },
}));
