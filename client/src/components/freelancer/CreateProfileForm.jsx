import React, { useState } from "react";
import { v4 as uuidv4 } from "uuid";
import "./CreateProfileForm.css";
import {
  Typography,
  TextField,
  MenuItem,
  Button,
  Stepper,
  Step,
  StepLabel,
  RadioGroup,
  Radio,
  InputAdornment,
  FormControlLabel,
} from "@material-ui/core";
import IntlTelInput from "react-intl-tel-input";
import {
  KeyboardDatePicker,
  MuiPickersUtilsProvider,
} from "@material-ui/pickers";
import DateFnsUtils from "@date-io/date-fns";
import IconButton from "@material-ui/core/IconButton";
import RemoveIcon from "@material-ui/icons/Remove";
import AddIcon from "@material-ui/icons/Add";
import { CircularProgress } from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import { Redirect } from "react-router-dom";
import { CountryDropdown, RegionDropdown } from "react-country-region-selector";

import "react-intl-tel-input/dist/main.css";

import Axios from "../../axios-url";

const useStyles = makeStyles((theme) => ({
  formContainer: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    flexDirection: "column",
  },
  fieldContainer: {
    display: "grid",
    minWidth: "45vw",
    "& *": {
      // marginTop: "5px",
    },
  },
  button: {
    marginRight: theme.spacing(2),
  },
  country: { height: "2.5rem", marginBottom: "15px" },
}));

function getSteps() {
  return [
    "Basic information",
    "Description",
    "Expertise",
    "Location",
    "Education",
    "Employment",
    "Additional",
  ];
}

function getStepContent(
  stepIndex,
  basicProps,
  descriptionProps,
  expertiseProps,
  locationProps,
  educationProps,
  employmentProps,
  additionalProps
) {
  switch (stepIndex) {
    case 0:
      return <BasicForm basicProps={basicProps} />;

    case 1:
      return <DescriptionForm descriptionProps={descriptionProps} />;

    case 2:
      return <ExpertiseForm expertiseProps={expertiseProps} />;

    case 3:
      return <LocationForm locationProps={locationProps} />;

    case 4:
      return <EducationForm educationProps={educationProps} />;

    case 5:
      return <EmploymentForm employmentProps={employmentProps} />;

    case 6:
      return <AdditionalForm additionalProps={additionalProps} />;

    default:
      return "unknown step";
  }
}

const BasicForm = ({ basicProps }) => {
  const { basic, setBasic } = basicProps;
  const classes = useStyles();

  const form = (
    <div className={classes.fieldContainer}>
      {" "}
      <TextField
        type="text"
        inputProps={{ inputMode: "text", minLength: 2, maxLength: 32 }}
        label="First Name"
        variant="outlined"
        placeholder="Enter first name"
        margin="normal"
        value={basic.firstName}
        onChange={(e) =>
          setBasic({
            ...basic,
            firstName: e.target.value,
          })
        }
        required
        size="small"
      />
      <TextField
        type="text"
        inputProps={{ inputMode: "text", minLength: 2, maxLength: 32 }}
        label="Last Name"
        variant="outlined"
        placeholder="Enter last name"
        margin="normal"
        value={basic.lastName}
        onChange={(e) =>
          setBasic({
            ...basic,
            lastName: e.target.value,
          })
        }
        size="small"
        required
      />
      <TextField
        type="text"
        inputProps={{ inputMode: "text", minLength: 10, maxLength: 70 }}
        label="Title"
        variant="outlined"
        placeholder="Enter the title that describes you"
        margin="normal"
        value={basic.title}
        onChange={(e) =>
          setBasic({
            ...basic,
            title: e.target.value,
          })
        }
        size="small"
        required
      />
    </div>
  );

  return <>{form}</>;
};
const DescriptionForm = ({ descriptionProps }) => {
  const { description, setDescription } = descriptionProps;
  const classes = useStyles();
  return (
    <div className={classes.fieldContainer}>
      <TextField
        type="text"
        inputProps={{ inputMode: "text", minLength: 10, maxLength: 5000 }}
        label="Overview"
        variant="outlined"
        placeholder="Highlight your top skills, experience and interests."
        margin="normal"
        value={description.overview}
        onChange={(e) =>
          setDescription({
            ...description,
            overview: e.target.value,
          })
        }
        size="small"
        required
        multiline
        cols={12}
        minRows={7}
        maxRows={7}
      />
      <TextField
        type="number"
        inputProps={{ inputMode: "numeric", min: 1 }}
        label="Hourly rate ($)"
        value={description.hourlyRate}
        variant="outlined"
        placeholder="Enter your hourly rate"
        startadornment={<InputAdornment position="start">$</InputAdornment>}
        onChange={(e) =>
          setDescription({
            ...description,
            hourlyRate: Number(e.target.value),
          })
        }
        style={{ marginTop: "30px" }}
        required
        size="small"
      />
    </div>
  );
};
const ExpertiseForm = ({ expertiseProps }) => {
  const { expertise, setExpertise, skills, setSkills } = expertiseProps;

  const classes = useStyles();

  const services = [
    {
      value: "Administration",
      label: "Administration",
    },
    {
      value: "Design And Creative",
      label: "Design And Creative",
    },
    {
      value: "Engineering And Architecture",
      label: "Engineering And Architecture",
    },
    {
      value: "Marketing",
      label: "Marketing",
    },
    {
      value: "Web,Mobile And Software Dev",
      label: "Web,Mobile And Software Dev",
    },
    {
      value: "Writing",
      label: "Writing",
    },
  ];

  const expertiseLevels = [
    {
      value: "Beginner",
      label: "Beginner",
      description: "I am relatively new to this field",
    },
    {
      value: "Intermediate",
      label: "Intermediate",
      description: "I have substantial experience in this field",
    },
    {
      value: "Expert",
      label: "Expert",
      description: "I have comprehensive and deep expertise in this field",
    },
  ];

  const handleChangeInput = (id, event) => {
    const newSkills = skills.map((i) => {
      if (id === i.id) {
        i[event.target.name] = event.target.value;
      }
      return i;
    });

    setSkills(newSkills);
  };

  const handleAddFields = () => {
    setSkills([...skills, { id: uuidv4(), name: "" }]);
  };

  const handleRemoveFields = (id) => {
    const values = [...skills];
    values.splice(
      values.findIndex((value) => value.id === id),
      1
    );
    setSkills(values);
  };

  return (
    <div className={classes.fieldContainer}>
      <TextField
        variant="outlined"
        select
        label="Service"
        value={expertise.service}
        onChange={(e) =>
          setExpertise({ ...expertise, service: e.target.value })
        }
        helperText="What is the main service you offer?"
        margin="normal"
        required
        size="small"
      >
        {services.map((option) => (
          <MenuItem key={option.value} value={option.value}>
            {option.label}
          </MenuItem>
        ))}
      </TextField>
      {skills.map((s) => (
        <div key={s.id}>
          <TextField
            name="name"
            label="Skill"
            variant="outlined"
            value={s.name}
            required
            inputProps={{ inputMode: "text", minLength: 2 }}
            onChange={(event) => handleChangeInput(s.id, event)}
            size="small"
          />

          <IconButton
            disabled={skills.length === 1}
            onClick={() => handleRemoveFields(s.id)}
          >
            <RemoveIcon />
          </IconButton>
          <IconButton onClick={handleAddFields}>
            <AddIcon />
          </IconButton>
        </div>
      ))}

      <RadioGroup
        aria-label="expertise-level"
        name="Expertise level"
        value={expertise.expertiseLevel}
        onChange={(e) =>
          setExpertise({ ...expertise, expertiseLevel: e.target.value })
        }
      >
        <Typography variant="subtitle1"> Expertise level:</Typography>
        {expertiseLevels.map((option) => (
          <FormControlLabel
            key={option.value}
            value={option.value}
            control={<Radio required={true} />}
            label={
              <Typography>
                {option.label} <i>({option.description})</i>
              </Typography>
            }
          />
        ))}
      </RadioGroup>
    </div>
  );
};

const LocationForm = ({ locationProps }) => {
  const { location, setLocation } = locationProps;
  const classes = useStyles();

  return (
    <div className={classes.fieldContainer}>
      <CountryDropdown
        name="Country"
        value={location.country}
        onChange={(val) => setLocation({ ...location, country: val })}
        classes={classes.country}
        //  whitelist={["NP"]}
      />
      <RegionDropdown
        name="Country"
        country={location.country}
        value={location.province}
        onChange={(val) => setLocation({ ...location, province: val })}
        classes={classes.country}
      />

      <TextField
        type="text"
        inputProps={{ inputMode: "text", minLength: 5, maxLength: 70 }}
        label="Street"
        value={location.street}
        variant="outlined"
        placeholder="Street"
        onChange={(e) => setLocation({ ...location, street: e.target.value })}
        required
        size="small"
        style={{ marginBottom: "15px" }}
      />
      <TextField
        type="text"
        inputProps={{ inputMode: "text", minLength: 5, maxLength: 70 }}
        label="City"
        value={location.city}
        variant="outlined"
        placeholder="City"
        onChange={(e) => setLocation({ ...location, city: e.target.value })}
        size="small"
        required
      />
      <TextField
        type="number"
        inputProps={{ inputMode: "numeric" }}
        label="Zip"
        variant="outlined"
        placeholder="Zip"
        fullWidth
        margin="normal"
        value={location.zip}
        onChange={(e) =>
          setLocation({ ...location, zip: Number(e.target.value) })
        }
        size="small"
        required
      />
    </div>
  );
};

const EducationForm = ({ educationProps }) => {
  const { education, setEducation } = educationProps;
  const classes = useStyles();

  return (
    <div className={classes.fieldContainer}>
      <TextField
        type="text"
        inputProps={{ inputMode: "text", minLength: 5, maxLength: 200 }}
        label="School"
        value={education.school}
        variant="outlined"
        placeholder="Enter the school or university or college name"
        onChange={(e) => setEducation({ ...education, school: e.target.value })}
        required
        style={{ marginBottom: "15px" }}
        size="small"
      />
      <TextField
        type="text"
        inputProps={{ inputMode: "text", minLength: 2, maxLength: 70 }}
        label="Area of study"
        value={education.areaOfStudy}
        variant="outlined"
        placeholder="Enter your study area"
        onChange={(e) =>
          setEducation({ ...education, areaOfStudy: e.target.value })
        }
        required
        style={{ marginBottom: "15px" }}
        size="small"
      />
      <TextField
        type="text"
        inputProps={{ inputMode: "text", minLength: 5, maxLength: 100 }}
        label="Degree"
        value={education.degree}
        variant="outlined"
        placeholder="Enter your degree"
        onChange={(e) => setEducation({ ...education, degree: e.target.value })}
        required
        style={{ marginBottom: "15px" }}
        size="small"
      />
      <MuiPickersUtilsProvider utils={DateFnsUtils}>
        <KeyboardDatePicker
          autoOk
          variant="inline"
          inputVariant="outlined"
          label="From"
          format="MM/dd/yyyy"
          value={education.datesAttended.from}
          InputAdornmentProps={{ position: "end" }}
          onChange={(date) =>
            setEducation({
              ...education,
              datesAttended: { ...education.datesAttended, from: date },
            })
          }
          style={{ marginBottom: "15px" }}
          size="small"
        />
        <KeyboardDatePicker
          autoOk
          variant="inline"
          inputVariant="outlined"
          label="To (or expected graduation year)"
          format="MM/dd/yyyy"
          value={education.datesAttended.to}
          InputAdornmentProps={{ position: "end" }}
          onChange={(date) =>
            setEducation({
              ...education,
              datesAttended: { ...education.datesAttended, to: date },
            })
          }
          style={{ marginBottom: "15px" }}
          size="small"
        />
      </MuiPickersUtilsProvider>
      <TextField
        type="text"
        inputProps={{ inputMode: "text", minLength: 5, maxLength: 200 }}
        label="Description"
        value={education.description}
        variant="outlined"
        placeholder="Briefly explain your education."
        onChange={(e) =>
          setEducation({ ...education, description: e.target.value })
        }
        size="small"
        style={{ marginBottom: "15px" }}
        required
        multiline
        cols={12}
        minRows={3}
        maxRows={4}
      />
    </div>
  );
};
const EmploymentForm = ({ employmentProps }) => {
  const { employment, setEmployment } = employmentProps;
  const classes = useStyles();

  return (
    <div className={classes.fieldContainer}>
      <TextField
        type="text"
        inputProps={{ inputMode: "text", minLength: 2, maxLength: 200 }}
        label="Company"
        value={employment.company}
        variant="outlined"
        placeholder="Name of company"
        onChange={(e) =>
          setEmployment({ ...employment, company: e.target.value })
        }
        style={{ marginBottom: "15px" }}
        size="small"
        required
      />
      <CountryDropdown
        name="Country"
        value={employment.location.country}
        onChange={(val) =>
          setEmployment({
            ...employment,
            location: { ...employment.location, country: val },
          })
        }
        classes={classes.country}
      />
      <TextField
        type="text"
        inputProps={{ inputMode: "text", minLength: 5, maxLength: 70 }}
        label="City"
        value={employment.location.city}
        variant="outlined"
        placeholder="City"
        onChange={(e) =>
          setEmployment({
            ...employment,
            location: { ...employment.location, city: e.target.value },
          })
        }
        size="small"
        required
      />
      <TextField
        type="text"
        inputProps={{ inputMode: "text", minLength: 5, maxLength: 70 }}
        label="Title"
        variant="outlined"
        placeholder="Enter the title that describes you in that company"
        margin="normal"
        value={employment.title}
        onChange={(e) =>
          setEmployment({
            ...employment,
            title: e.target.value,
          })
        }
        size="small"
        style={{ marginBottom: "15px" }}
        required
      />
      <MuiPickersUtilsProvider utils={DateFnsUtils}>
        <KeyboardDatePicker
          autoOk
          variant="inline"
          inputVariant="outlined"
          label="From"
          format="MM/dd/yyyy"
          value={employment.period.from}
          InputAdornmentProps={{ position: "end" }}
          onChange={(date) =>
            setEmployment({
              ...employment,
              period: { ...employment.period, from: date },
            })
          }
          size="small"
          style={{ marginBottom: "15px" }}
        />
        <KeyboardDatePicker
          autoOk
          variant="inline"
          inputVariant="outlined"
          label="To"
          format="MM/dd/yyyy"
          value={employment.period.to}
          InputAdornmentProps={{ position: "end" }}
          onChange={(date) =>
            setEmployment({
              ...employment,
              period: { ...employment.period, to: date },
            })
          }
          size="small"
          style={{ marginBottom: "15px" }}
        />
      </MuiPickersUtilsProvider>
      <TextField
        type="text"
        inputProps={{ inputMode: "text", minLength: 5, maxLength: 255 }}
        label="Description"
        value={employment.description}
        variant="outlined"
        placeholder="Briefly explain your employment details in that company."
        onChange={(e) =>
          setEmployment({ ...employment, description: e.target.value })
        }
        size="small"
        style={{ marginBottom: "10px" }}
        required
        multiline
        cols={12}
        minRows={3}
        maxRows={3}
      />
    </div>
  );
};

const AdditionalForm = ({ additionalProps }) => {
  const { englishLanguage, setEnglishLanguage, phone, setPhone } =
    additionalProps;
  const classes = useStyles();

  const proficiencies = [
    {
      value: "Basic",
      label: "Basic",
      description: "I write in this language decently",
    },
    {
      value: "Conversational",
      label: "Conversational",
      description: "I write and speak this language well",
    },
    {
      value: "Fluent",
      label: "Fluent",
      description: "I write and speak this language almost perfectly",
    },
    {
      value: "Native Or Bilingual",
      label: "Native Or Bilingual",
      description:
        "I write and speak this language almost perfectly, including colloquialisms",
    },
  ];

  return (
    <div className={classes.fieldContainer}>
      <RadioGroup
        aria-label="english-proficiency-level"
        name="English proficiency level"
        value={englishLanguage.proficiency}
        onChange={(e) =>
          setEnglishLanguage({
            ...englishLanguage,
            proficiency: e.target.value,
          })
        }
      >
        <Typography variant="subtitle1"> English proficiency level:</Typography>
        {proficiencies.map((option) => (
          <FormControlLabel
            key={option.value}
            value={option.value}
            control={<Radio required={true} />}
            label={
              <Typography>
                {option.label} <i>({option.description})</i>
              </Typography>
            }
          />
        ))}
      </RadioGroup>
      <IntlTelInput
        style={{ marginTop: "-10px" }}
        fieldName="Phone"
        preferredCountries={["np"]}
        // value={phone.phoneNumber}
        onPhoneNumberChange={(
          isValid,
          value,
          selectedCountryData,
          fullNumber,
          extension
        ) => {
          const { dialCode } = selectedCountryData;
          setPhone({
            ...phone,
            phoneNumber: "+" + dialCode + value,
          });
        }}
      />
    </div>
  );
};

const CreateProfileForm = ({ token }) => {
  const classes = useStyles();
  const [success, setSuccess] = useState(false);

  const [basic, setBasic] = useState({
    firstName: "",
    lastName: "",
    title: "",
  });
  const [description, setDescription] = useState({
    overview: "",
    hourlyRate: 0,
  });
  const [expertise, setExpertise] = useState({
    service: "",
    expertiseLevel: "",
  });
  const [skills, setSkills] = useState([{ id: uuidv4(), name: "" }]);

  const [location, setLocation] = useState({
    country: "",
    province: "",
    city: "",
    street: "",
    zip: "",
  });
  const [education, setEducation] = useState({
    school: "",
    areaOfStudy: "",
    degree: "",
    datesAttended: { from: new Date(), to: new Date() },
    description: "",
  });
  const [employment, setEmployment] = useState({
    company: "",
    location: { country: "", city: "" },
    title: "",
    period: { from: new Date(), to: new Date() },
    description: "",
  });

  const [englishLanguage, setEnglishLanguage] = useState({ proficiency: "" });
  const [phone, setPhone] = useState({ phoneNumber: "" });

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const [activeStep, setActiveStep] = useState(0);
  const [skippedSteps, setSkippedSteps] = useState([]);
  const steps = getSteps();

  const basicProps = {
    basic,
    setBasic,
  };

  const descriptionProps = { description, setDescription };

  const expertiseProps = {
    expertise,
    setExpertise,
    skills,
    setSkills,
  };

  const locationProps = {
    location,
    setLocation,
  };

  const educationProps = {
    education,
    setEducation,
  };

  const employmentProps = {
    employment,
    setEmployment,
  };

  const additionalProps = {
    englishLanguage,
    setEnglishLanguage,
    phone,
    setPhone,
  };
  const isStepOptional = (step) => {
    return step === 4 || step === 5;
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
    createProfile();
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

  const createProfile = () => {
    setLoading(true);
    const newSkills = skills.map((s) => {
      return s.name;
    });

    const profileData = {
      firstName: basic.firstName,
      lastName: basic.lastName,
      title: basic.title,
      overview: description.overview,
      hourlyRate: { amount: description.hourlyRate },
      expertise: { ...expertise, skills: newSkills },
      education,
      location,
      employments: [employment],
      englishLanguage,
      phone,
    };

    Axios.post("/api/v1/freelancer/create-profile", profileData, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((res) => {
        setError("");
        setLoading(false);
        setSuccess(true);
        setActiveStep(activeStep + 1);
      })
      .catch((err) => {
        setError(err.response.data.data.error);
        setLoading(false);
        setSuccess(false);
      });
  };
  if (success) {
    return <Redirect to="/find-work/recommended" />;
  }
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

      <form className={classes.formContainer} onSubmit={handleNext}>
        {getStepContent(
          activeStep,
          basicProps,
          descriptionProps,
          expertiseProps,
          locationProps,
          educationProps,
          employmentProps,
          additionalProps
        )}
        {error ? (
          <Typography color="error" style={{ marginTop: "15px" }}>
            {error}
          </Typography>
        ) : null}
        <div style={{ display: "flex", marginTop: "10px" }}>
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

export default CreateProfileForm;
