import { makeStyles } from "@material-ui/core/styles";

export const useStyles = makeStyles((theme) => ({
  root: {
    flexGrow: 1,
  },
  menuButton: {
    marginRight: theme.spacing(2),
  },
  homeLink: {
    flexGrow: 1,
    textDecoration: "none",
    color: "inherit",
  },
  buttonContainer: {
    "& a": {
      textDecoration: "none",
      color: "inherit",
    },
  },
}));
