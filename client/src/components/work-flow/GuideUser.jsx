import { useStyles } from "./styles";
import Typography from "@material-ui/core/Typography";
import Grid from "@material-ui/core/Grid";

const GuideUser = () => {
  const classes = useStyles();
  return (
    <div className={classes.root}>
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <Typography
            align="center"
            variant="h4"
            style={{ top: "15px", position: "relative" }}
          >
            How it works
          </Typography>
        </Grid>
        <Grid item xs={6} sm={3}>
          <Typography align="center" variant="body1">
            1. Post a job/Submit proposal
          </Typography>
        </Grid>
        <Grid item xs={6} sm={3}>
          <Typography align="center" variant="body1">
            2. Choose best proposal/Wait for response
          </Typography>
        </Grid>
        <Grid item xs={6} sm={3}>
          <Typography align="center" variant="body1">
            3. Communicate during project
          </Typography>
        </Grid>
        <Grid item xs={6} sm={3}>
          <Typography align="center" variant="body1">
            4. Send/Receive payment
          </Typography>
        </Grid>
      </Grid>
    </div>
  );
};

export default GuideUser;
