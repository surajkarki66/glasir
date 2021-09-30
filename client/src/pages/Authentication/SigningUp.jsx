import { useEffect } from "react";
import { connect } from "react-redux";

import { Container, Typography } from "@material-ui/core";

import { signUp } from "../../actions/signUp";

const SigningUp = ({ signUpData, signUp }) => {
  useEffect(() => {
    signUp(signUpData);
    // eslint-disable-next-line
  }, []);

  return (
    <Container>
      <Typography>{signUpData.signUpStatus}</Typography>
    </Container>
  );
};

const mapStateToPros = (state) => ({
  signUpData: state.signUpForm,
});

export default connect(mapStateToPros, { signUp })(SigningUp);
