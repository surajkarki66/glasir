import React from "react";
import { connect, useDispatch } from "react-redux";
import { Link } from "react-router-dom";
import { makeStyles } from "@material-ui/core/styles";
import {
  Backdrop,
  Button,
  Fade,
  Modal,
  TextField,
  Typography,
  RadioGroup,
  FormControlLabel,
  Radio,
} from "@material-ui/core";

import { updateSignUpForm, signUp } from "../../actions/signUp";
import { SIGNING_UP } from "../../actions/types";

const useStyles = makeStyles((theme) => ({
  root: {
    width: "100vw",
    flexGrow: 1,
    position: "absolute",
    bottom: 0,
    backgroundColor: "#bfbfbf",
  },
  signUpContainer: {
    display: "flex",
    justifyContent: "center",
    marginTop: "8%",
  },
  formContainer: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    flexDirection: "column",
    height: "50vh",
  },
  heading: {
    margin: "20px 0 15px 0",
    display: "flex",
    justifyContent: "center",
  },
  fieldContainer: {
    display: "grid",
    minWidth: "30vw",
    "& *": {
      marginTop: "4px",
    },
  },
  formControl: {
    margin: "8px",
  },
  firstForm: {
    maxWidth: "90vw",
  },
  modal: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  paper: {
    backgroundColor: theme.palette.background.paper,
    boxShadow: theme.shadows[5],
    padding: theme.spacing(2, 4, 3),
  },
}));

const SignUp = ({ signUpForm, signUp }) => {
  const classes = useStyles();
  const dispatch = useDispatch();
  const [username, changeUsername] = React.useState("");
  const [usernameError, changeUsernameError] = React.useState("");
  const [email, changeEmail] = React.useState("");
  const [emailError, changeEmailError] = React.useState("");
  const [password, changePassword] = React.useState("");
  const [passwordError, changePasswordError] = React.useState("");
  const [password2, changePassword2] = React.useState("");
  const [passwordError2, changePasswordError2] = React.useState("");
  const [role, setRole] = React.useState(""); // added role
  const [roleError, changeRoleError] = React.useState("");
  const { signingUp, signUpStatus, signUpSuccessful } = signUpForm;

  const checkForm2 = () => {
    if (username.length < 8) {
      changeUsernameError("Username length should be more than 8");
      return false;
    } else {
      changeUsernameError("");
      let re = /\S+@\S+\.\S+/;
      let validEmail = re.test(email);
      if (email === "") {
        changeEmailError("Enter email");
        return false;
      } else if (!validEmail) {
        changeEmailError("Email is not valid");
        return false;
      }
      changeEmailError("");
      if (password.length < 8) {
        changePasswordError("Password length should be more than 8");
        return false;
      }
      let rePassword = /(?=.*[a-z])/;
      if (!rePassword.test(password)) {
        changePasswordError(
          "Password should contain at least one lower case letter"
        );
        return false;
      }
      rePassword = /(?=.*[A-Z])/;
      if (!rePassword.test(password)) {
        changePasswordError(
          "Password should contain at least one upper case letter"
        );
        return false;
      }
      rePassword = /(?=.*\d)/;
      if (!rePassword.test(password)) {
        changePasswordError("Password should contain at least one digit");
        return false;
      }

      changePasswordError("");

      if (!(password === password2)) {
        changePasswordError2("Passwords do not match");
        return false;
      }
      changePasswordError2("");

      if (role === "") {
        changeRoleError("Please select what you want to do on Glasir");
        return false;
      }
      changeRoleError("");
      return true;
    }
  };

  const handleSignUp = () => {
    if (checkForm2()) {
      signUp({ username, email, password, role });
    }
  };

  const handleClose = () => {
    dispatch({
      type: SIGNING_UP,
      payload: false,
    });
  };

  const Error = ({ test }) => {
    if (test !== "") {
      return (
        <Typography variant="body2" color="error">
          {test}
        </Typography>
      );
    }
    return null;
  };

  return (
    <div className={classes.signUpContainer}>
      <form noValidate autoComplete="off" className={classes.formContainer}>
        <Typography variant="h3" style={{ marginTop: 10 }}>
          Sign Up
        </Typography>
        <div className={classes.fieldContainer}>
          <TextField
            id="standard-password-input"
            label="Username"
            type="text"
            fullWidth
            size="medium"
            value={username}
            onChange={(e) => changeUsername(e.target.value)}
          />
          <Error test={usernameError} />
          <TextField
            fullWidth
            id="standard-password-input"
            label="Email"
            type="email"
            autoComplete="current-password"
            size="medium"
            value={email}
            onChange={(e) => changeEmail(e.target.value)}
          />
          <Error test={emailError} />
          <TextField
            fullWidth
            id="standard-password-input"
            label="Password"
            type="password"
            autoComplete="current-password"
            size="medium"
            value={password}
            onChange={(e) => changePassword(e.target.value)}
          />
          <Error test={passwordError} />
          <TextField
            fullWidth
            id="standard-password-input"
            label="Confirm Password"
            type="password"
            autoComplete="current-password"
            size="medium"
            value={password2}
            onChange={(e) => changePassword2(e.target.value)}
          />
          <Error test={passwordError2} />

          <RadioGroup
            aria-label="role"
            name="Role"
            value={role}
            onChange={(e) => setRole(e.target.value)}
            style={{ marginTop: "20px" }}
          >
            <Typography variant="subtitle1"> I want to:</Typography>
            <FormControlLabel
              value="freelancer"
              control={<Radio required={true} />}
              label={
                <Typography style={{ marginTop: "16px" }}>
                  Work as a freelancer
                </Typography>
              }
            />
            <FormControlLabel
              value="employer"
              control={<Radio required={true} />}
              label={
                <Typography style={{ marginTop: "16px" }}>
                  Hire for a project
                </Typography>
              }
            />
          </RadioGroup>
          <Error test={roleError} />
        </div>
        <Button color="primary" variant="contained" onClick={handleSignUp}>
          Sign Up
        </Button>
      </form>

      <Modal
        aria-labelledby="transition-modal-title"
        aria-describedby="transition-modal-description"
        className={classes.modal}
        open={signingUp}
        onClose={handleClose}
        closeAfterTransition
        BackdropComponent={Backdrop}
        BackdropProps={{
          timeout: 500,
        }}
      >
        <Fade in={signingUp}>
          <div className={classes.paper}>
            <p id="transition-modal-description">{signUpStatus}</p>
            {signUpSuccessful ? (
              <p>
                Click <Link to="/sign-in">here</Link> to goto Sign In page
              </p>
            ) : null}
          </div>
        </Fade>
      </Modal>
    </div>
  );
};

const mapStateToPros = (state) => ({
  signUpForm: state.signUpForm,
});

export default connect(mapStateToPros, { updateSignUpForm, signUp })(SignUp);
