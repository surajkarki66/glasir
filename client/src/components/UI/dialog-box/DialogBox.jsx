import * as React from "react";
import {
  Dialog,
  useMediaQuery,
  useTheme,
  DialogActions,
  CircularProgress,
  Button,
} from "@material-ui/core";

export default function DialogBox({
  handleClose,
  open,
  handleConfirm,
  loading,
  confirmBtnTxt,
  children,
}) {
  const theme = useTheme();
  const fullScreen = useMediaQuery(theme.breakpoints.down("md"));

  return (
    <div>
      <Dialog
        fullScreen={fullScreen}
        open={open}
        onClose={handleClose}
        aria-labelledby="responsive-dialog-title"
      >
        {children}
        <DialogActions>
          <Button autoFocus onClick={handleClose} disabled={loading}>
            Cancel
          </Button>
          <Button onClick={handleConfirm} autoFocus disabled={loading}>
            {loading && <CircularProgress size={17} />}
            {!loading && confirmBtnTxt}
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}
