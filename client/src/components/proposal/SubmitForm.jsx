import React, { useState } from "react";
import {
  Typography,
  TextField,
  Button,
  Stepper,
  Step,
  StepLabel,
} from "@material-ui/core";
import { CircularProgress } from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import { withRouter } from "react-router-dom";
import Axios from "../../axios-url";

const useStyles = makeStyles((theme) => ({
  formContainer: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    flexDirection: "column",
    height: "50vh",
  },
  fieldContainer: {
    display: "grid",
    minWidth: "35vw",
    "& *": {
      marginTop: "5px",
    },
  },
  button: {
    marginRight: theme.spacing(2),
  },
}));

function getSteps() {
  return ["Terms", "Additional details"];
}

function getStepContent(stepIndex, termsProps, additionalDetailsProps) {
  switch (stepIndex) {
    case 0:
      return <TermsForm termsProps={termsProps} />;

    case 1:
      return (
        <AdditionalDetailsForm
          additionalDetailsProps={additionalDetailsProps}
        />
      );
    default:
      return "unknown step";
  }
}

const TermsForm = ({ termsProps }) => {
  const {
    job,
    fixedBidAmount,
    hourlyBidAmount,
    setFixedBidAmount,
    setHourlyBidAmount,
  } = termsProps;
  let form;
  const classes = useStyles();
  if (job.pay) {
    const { projectLengthInHours, pay } = job;
    const { type, price } = pay;

    form = (
      <div className={classes.fieldContainer}>
        {" "}
        <TextField
          label={type === "fixed" ? "$ Fixed price" : "$ Hourly Rate"}
          variant="outlined"
          placeholder="Job pay"
          fullWidth
          margin="normal"
          defaultValue={
            type === "fixed" ? "$ " + price.amount : "$ " + price.maxRate
          }
          inputProps={{ readOnly: true }}
          size="small"
        />
        <TextField
          type="number"
          inputProps={{ inputMode: "numeric", pattern: "[0-9]*", min: 1 }}
          label={type === "fixed" ? "$ Bid Amount" : "$ Hourly Rate"}
          value={type === "fixed" ? fixedBidAmount : hourlyBidAmount}
          variant="outlined"
          placeholder="$ : Total amount the client will see on your proposal"
          onChange={
            type === "fixed"
              ? (e) => setFixedBidAmount(e.target.value)
              : (e) => setHourlyBidAmount(e.target.value)
          }
          fullWidth
          margin="normal"
          required
          size="small"
        />
        <TextField
          id="projectLengthInHours"
          label="Project Length"
          variant="outlined"
          fullWidth
          margin="normal"
          defaultValue={Math.round(projectLengthInHours / 24) + " days"}
          inputProps={{ readOnly: true }}
          size="small"
        />
      </div>
    );
  }

  return <>{form}</>;
};
const AdditionalDetailsForm = ({ additionalDetailsProps }) => {
  const { setFiles, coverLetter, setCoverLetter } = additionalDetailsProps;
  const classes = useStyles();

  return (
    <div className={classes.fieldContainer}>
      <TextField
        type="text"
        inputProps={{ inputMode: "text", minLength: 10 }}
        id="coverLetter"
        label="Cover Letter"
        value={coverLetter}
        variant="outlined"
        placeholder="Introduce yourself and explain why you’re a strong candidate for this job"
        fullWidth
        multiline
        cols={12}
        rows={8}
        rowsMax={8}
        margin="normal"
        onChange={(e) => setCoverLetter(e.target.value)}
        required
      />

      <input
        onChange={(e) => {
          const files = e.target.files;
          if (files.length <= 10) {
            setFiles(files);
          } else {
            e.target.value = null;
            alert("Number of files exceeded the limit");
          }
        }}
        multiple
        type="file"
        required
      />
    </div>
  );
};

const SubmitForm = ({ job, freelancerId, token, history }) => {
  const classes = useStyles();
  const [fixedBidAmount, setFixedBidAmount] = useState(0);
  const [hourlyBidAmount, setHourlyBidAmount] = useState(0);
  const [coverLetter, setCoverLetter] = useState("");
  const [files, setFiles] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const [activeStep, setActiveStep] = useState(0);
  const [skippedSteps, setSkippedSteps] = useState([]);
  const steps = getSteps();

  const termsProps = {
    job,
    fixedBidAmount,
    hourlyBidAmount,
    setFixedBidAmount,
    setHourlyBidAmount,
  };

  const additionalDetailsProps = {
    files,
    coverLetter,
    setCoverLetter,
    setFiles,
  };

  const isStepOptional = (step) => {
    return step === 2 || step === 3;
  };

  const isStepSkipped = (step) => {
    return skippedSteps.includes(step);
  };

  const handleNext = (e) => {
    e.preventDefault();
    if (activeStep !== steps.length - 1) {
      setActiveStep(activeStep + 1);
      setSkippedSteps(
        skippedSteps.filter((skipItem) => skipItem !== activeStep)
      );
      return;
    }
    createProposal();
  };

  const handleBack = () => {
    setActiveStep(activeStep - 1);
  };

  const handleSkip = () => {
    if (!isStepSkipped(activeStep)) {
      setSkippedSteps([...skippedSteps, activeStep]);
    }
    setActiveStep(activeStep + 1);
  };

  const createProposal = () => {
    const { projectLengthInHours, pay, _id } = job;
    const { type } = pay;
    const formData = new FormData();
    formData.append("jobId", _id);
    formData.append("freelancerId", freelancerId);
    formData.append("projectLengthInHours", projectLengthInHours);
    formData.append("bidType", type);
    formData.append("coverLetter", coverLetter);
    formData.append("status", "initial");
    if (type === "fixed") {
      formData.append("fixedBidAmount", fixedBidAmount);
    } else {
      formData.append("hourlyBidAmount", hourlyBidAmount);
    }
    for (let i = 0; i < files.length; i++) {
      formData.append("additionalFiles", files[i]);
    }
    setLoading(true);
    Axios.post("/api/v1/proposal/createProposal", formData, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((res) => {
        setLoading(false);
        setError("");
        setActiveStep(activeStep + 1);
        history.push(`/find-work/jobs/details/${_id}`);
      })
      .catch((err) => {
        setError(err.response.data.data.error);
        setLoading(false);
      });
  };
  return (
    <div>
      <Stepper alternativeLabel activeStep={activeStep}>
        {steps.map((step, index) => {
          const labelProps = {};
          const stepProps = {};
          if (isStepOptional(index)) {
            labelProps.optional = (
              <Typography
                variant="caption"
                align="center"
                style={{ display: "block" }}
              >
                optional
              </Typography>
            );
          }
          if (isStepSkipped(index)) {
            stepProps.completed = false;
          }
          return (
            <Step {...stepProps} key={index}>
              <StepLabel {...labelProps}>{step}</StepLabel>
            </Step>
          );
        })}
      </Stepper>

      <form
        encType="multipart/form-data"
        className={classes.formContainer}
        onSubmit={handleNext}
      >
        {getStepContent(activeStep, termsProps, additionalDetailsProps)}
        {error ? (
          <Typography color="error" style={{ marginTop: "15px" }}>
            {error}
          </Typography>
        ) : null}
        <div style={{ marginTop: "30px", display: "flex" }}>
          {" "}
          <Button
            className={classes.button}
            disabled={activeStep === 0 || loading}
            onClick={handleBack}
            variant="outlined"
          >
            back
          </Button>
          {isStepOptional(activeStep) && (
            <Button
              className={classes.button}
              variant="contained"
              color="primary"
              onClick={handleSkip}
            >
              skip
            </Button>
          )}
          {loading ? (
            <div style={{ marginLeft: "30px", marginTop: "9px" }}>
              <CircularProgress size={20} />
            </div>
          ) : (
            <Button
              className={classes.button}
              variant="contained"
              color="primary"
              type="submit"
            >
              {activeStep === steps.length - 1 ? "Finish" : "Next"}
            </Button>
          )}
        </div>
      </form>
    </div>
  );
};

export default withRouter(SubmitForm);
