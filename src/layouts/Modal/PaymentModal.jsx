import React, { useState } from 'react';
import {
  Modal,
  Box,
  Typography,
  Button,
  RadioGroup,
  FormControlLabel,
  Radio,
  IconButton
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';

const PaymentModal = () => {
  const [modalOpen, setModalOpen] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('tokens');

  const handleContinue = () => {
    if (paymentMethod === 'paypal') {
      window.location.href = '/paypal';
    } else {
      console.log('Paying with Tokens');
    }
    setModalOpen(false);
  };

  return (
    <>
      <Button variant="contained" onClick={() => setModalOpen(true)}>
        Choose Payment Method
      </Button>

      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        aria-labelledby="payment-modal-title"
        aria-describedby="payment-modal-description"
      >
        <Box
          sx={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: 420,
            bgcolor: 'background.paper',
            borderRadius: 2,
            boxShadow: 24,
            p: 4,
          }}
        >
          {/* Close Button */}
          <IconButton
            onClick={() => setModalOpen(false)}
            sx={{ position: 'absolute', top: 10, right: 10 }}
          >
            <CloseIcon />
          </IconButton>

          <Typography id="payment-modal-title" variant="h6" component="h2" mb={1.5}>
            Choose Your Payment Method
          </Typography>

          <Typography id="payment-modal-description" variant="body2" color="text.secondary" mb={2.5}>
            Please select how you'd like to complete your payment:
          </Typography>

          <RadioGroup
            value={paymentMethod}
            onChange={(e) => setPaymentMethod(e.target.value)}
          >
            <FormControlLabel
              value="tokens"
              control={<Radio />}
              label={
                <Box>
                  <Typography variant="body1" fontWeight="500">Pay with Tokens</Typography>
                  <Typography variant="caption" color="text.secondary">
                    Store token credits to pay for your order
                  </Typography>
                </Box>
              }
            />
            <FormControlLabel
              value="paypal"
              control={<Radio />}
              label={
                <Box>
                  <Typography variant="body1" fontWeight="500">Pay with PayPal</Typography>
                  <Typography variant="caption" color="text.secondary">
                    Secure checkout using your PayPal account.
                  </Typography>
                </Box>
              }
            />
          </RadioGroup>

          <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 4 }}>
            <Button variant="contained" onClick={handleContinue} sx={{ mr: 2 }}>
              Continue
            </Button>
            <Button variant="outlined" onClick={() => setModalOpen(false)}>
              Cancel
            </Button>
          </Box>
        </Box>
      </Modal>
    </>
  );
};

export default PaymentModal;
