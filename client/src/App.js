import React from "react";
import { Route, Switch, BrowserRouter } from "react-router-dom";
import { ProtectedRoute } from "./hoc/ProtectedRoute";
import CheckRole from "./hoc/CheckRole";
import EmployerProfilePage from "./pages/Employer/EmployerProfilePage";
import EmployerHome from "./pages/Employer/EmployerHome";
import FreelancerProfilePage from "./pages/Freelancer/FreelancerProfilePage";
import FreelancerHome from "./pages/Freelancer/FreelancerHome";
import JobRequestPage from "./pages/Job/JobRequestPage";
import SignIn from "./pages/Authentication/SignIn";
import SignUp from "./pages/Authentication/SignUp";
import Header from "./components/header/Header";
import SigningUp from "./pages/Authentication/SigningUp";
import Landing from "./pages/Landing";
import CreateProposalPage from "./pages/Proposal/CreateProposalPage";
import SavedJobPage from "./pages/Job/SavedJobPage";
import CreateJob from "./pages/Job/CreateJob";
import FreelancerProposalPage from "./pages/Proposal/FreelancerProposalPage";
import ProposalDetailsPage from "./pages/Proposal/ProposalDetailsPage";
import EditProposalPage from "./pages/Proposal/EditProposalPage";
import CreateEmployerProfile from "./pages/Employer/CreateEmployerProfile";
import CreateFreelancerProfile from "./pages/Freelancer/CreateFreelancerProfile";
import EmployerJobsPage from "./pages/Job/EmployerJobsPage";
import EmployerJobDetailPage from "./pages/Job/EmployerJobDetailPage";
import FreelancerDetailsPage from "./pages/Freelancer/FreelancerDetailsPage";
import JobProposalDetailsPage from "./pages/Job/JobProposalDetailsPage";
import HireFreelancerPage from "./pages/Contract/HireFreelancerPage";
import Activate from "./pages/Authentication/Activate";
import ContractDetailsPage from "./pages/Contract/ContractDetailsPage";
import Contracts from "./pages/Contract/Contracts";
import FreelancerAccount from "./pages/Account/FreelancerAccount";
import EmployerAccount from "./pages/Account/EmployerAccount";
// import Footer from "./components/footer/Footer";

import "./App.css";

function App() {
  return (
    <div className="App">
      <BrowserRouter>
        <Header />
        <Switch>
          <Route exact path="/user/activate/:token" component={Activate} />
          <ProtectedRoute
            exact
            path="/find-work/recommended"
            component={CheckRole(FreelancerHome, "freelancer")}
          />
          <ProtectedRoute
            exact
            path="/freelancer/account"
            component={CheckRole(FreelancerAccount, "freelancer")}
          />
          <ProtectedRoute
            exact
            path="/employer/account"
            component={CheckRole(EmployerAccount, "employer")}
          />
          <ProtectedRoute
            exact
            path="/employer/home"
            component={CheckRole(EmployerHome, "employer")}
          />
          <ProtectedRoute
            exact
            path="/find-work/jobs/details/:id"
            component={CheckRole(JobRequestPage, "freelancer")}
          />
          <ProtectedRoute
            exact
            path="/find-work/jobs/details/:id/apply"
            component={CheckRole(CreateProposalPage, "freelancer")}
          />
          <ProtectedRoute
            exact
            path="/find-work/jobs/saved"
            component={CheckRole(SavedJobPage, "freelancer")}
          />
          <ProtectedRoute
            exact
            path="/job-post"
            component={CheckRole(CreateJob, "employer")}
          />

          <ProtectedRoute
            exact
            path="/proposals"
            component={CheckRole(FreelancerProposalPage, "freelancer")}
          />
          <ProtectedRoute
            exact
            path="/proposals/:id"
            component={CheckRole(ProposalDetailsPage, "freelancer")}
          />
          <ProtectedRoute
            exact
            path="/proposals/:id/edit"
            component={CheckRole(EditProposalPage, "freelancer")}
          />
          <Route exact path="/sign-in" component={SignIn} />
          <Route exact path="/sign-up" component={SignUp} />
          <Route exact path="/signing-up" component={SigningUp} />

          <ProtectedRoute
            exact
            path="/employer/createProfile"
            component={CreateEmployerProfile}
          />
          <ProtectedRoute
            exact
            path="/freelancer/createProfile"
            component={CreateFreelancerProfile}
          />

          <ProtectedRoute
            exact
            path="/freelancer/profile"
            component={CheckRole(FreelancerProfilePage, "freelancer")}
          />
          <ProtectedRoute
            exact
            path="/freelancer/:id/details"
            component={FreelancerDetailsPage}
          />
          <ProtectedRoute
            exact
            path="/employer/profile"
            component={CheckRole(EmployerProfilePage, "employer")}
          />
          <ProtectedRoute
            exact
            path="/employer/my-jobs"
            component={CheckRole(EmployerJobsPage, "employer")}
          />
          <ProtectedRoute
            exact
            path="/employer/my-jobs/:jobId/:title"
            component={CheckRole(EmployerJobDetailPage, "employer")}
          />
          <ProtectedRoute
            exact
            path="/employer/my-jobs/:jobId/proposal/:proposalId"
            component={CheckRole(JobProposalDetailsPage, "employer")}
          />
          <ProtectedRoute
            exact
            path="/employer/my-jobs/:jobId/hire/freelancer/:freelancerId"
            component={CheckRole(HireFreelancerPage, "employer")}
          />
          <ProtectedRoute exact path="/contracts" component={Contracts} />
          <ProtectedRoute
            exact
            path="/contracts/:id/details"
            component={ContractDetailsPage}
          />
          <Route exact path="/" component={Landing} />
        </Switch>
        {/* <Footer /> */}
      </BrowserRouter>
    </div>
  );
}

export default App;
