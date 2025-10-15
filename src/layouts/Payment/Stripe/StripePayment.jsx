import React, { useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Snackbar,
} from "@mui/material";

import { loadStripe } from "@stripe/stripe-js";
import {
  Elements,
  CardNumberElement,
  CardExpiryElement,
  CardCvcElement,
  useStripe,
  useElements,
} from "@stripe/react-stripe-js";
import API from "../../../api/axios";

const stripePromise = loadStripe(
  "pk_test_51RlpuuIXMqAcuDQyHFnV29sq61ioeHFoF9itOdFkeIDqf3CMftopeXYYohvhqnG4ZCS6sPP7XnHf1oTIq5EZIyUT009QQX6uly"
);

const elementStyle = {
  style: {
    base: {
      fontSize: "16px",
      color: "#000",
      "::placeholder": {
        color: "#888",
      },
    },
  },
};

const inputStyle = {
  padding: 10,
  border: "1px solid #ccc",
  borderRadius: 4,
  marginBottom: 16,
};

function CheckoutForm({
  onClose,
  formDataState,
  onStripePaymentSuccess,
  onStripeTokenPaymentSuccess,
  type,
}) {
  const stripe = useStripe();
  const elements = useElements();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [snackbarOpen, setSnackBarClose] = useState(true);

  const handleSubmit = async () => {
    if (!stripe || !elements) return;
    setLoading(true);

    try {
      let client_secret = "";
      if (type == "order-placed") {
        client_secret = formDataState?.order?.stripe_client_secret;
      } else if (type == "buy-credits") {
        client_secret = formDataState?.stripe_client_secret;
      }
      const result = await stripe.confirmCardPayment(client_secret, {
        payment_method: {
          card: elements.getElement(CardNumberElement),
        },
      });

      if (result.error) {
        console.error(result.error);
        setMessage(result.error.message);
      } else if (result.paymentIntent.status === "succeeded") {
        setMessage("✅ Payment successful!");
        const formData = new FormData();
        if (type == "order-placed") {
          formData.append(
            "payment_intent_id",
            formDataState?.order?.stripe_payment_intent_id
          );
        } else if (type == "buy-credits") {
          formData.append(
            "payment_intent_id",
            formDataState?.stripe_payment_intent_id
          );
        }

        if (type == "order-placed") {
          const apiRes = await API.post(
            `/customers/confirm-stripe-payment`,
            formData
          );
          if (apiRes.data.status) {
            setTimeout(onClose, 500);
            onStripePaymentSuccess(true);
          } else {
            console.log(result.paymentIntent.status);
          }
        } else if (type == "buy-credits") {
          const apiRes = await API.post(
            `/customers/confirm-stripe-token-payment`,
            formData
          );
          if (apiRes.data.status) {
            setTimeout(onClose, 500);
            onStripeTokenPaymentSuccess(true);
          } else {
            console.log(result.paymentIntent.status);
          }
        }
      }
    } catch (err) {
      console.error(err);
    }

    setLoading(false);
  };

  return (
    <>
      <DialogContent>
        <Typography variant="body1" mb={2}>
          Enter your card details:
        </Typography>

        <div style={inputStyle}>
          <Typography variant="caption">Card Number</Typography>
          <CardNumberElement options={elementStyle} />
        </div>

        <div style={inputStyle}>
          <Typography variant="caption">Expiry Date</Typography>
          <CardExpiryElement options={elementStyle} />
        </div>

        <div style={inputStyle}>
          <Typography variant="caption">CVC</Typography>
          <CardCvcElement options={elementStyle} />
        </div>

        {message && <Typography color="error">{message}</Typography>}
        {/* {!message && (
          <Typography color="error">
            <Snackbar
              open={open}
              autoHideDuration={5000}
              onClose={() => {
                setOpen(false);
                setTimeout(() => setOpen(true), 2000);
              }}
            //   message={message}
              message="Payment Successfully done!"
            />
          </Typography>
        )} */}
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose} color="secondary" sx={{ color: "#0f0f0f" }}>
          Cancel
        </Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          disabled={!stripe || loading}
          sx={{
            backgroundColor: "#0f0f0f",
            borderColor: "#0f0f0f",
            "&:hover": {
              backgroundColor: "#1a1a1a",
            },
          }}
        >
          {loading
            ? "Processing..."
            : `Pay ${
                type === "order-placed"
                  ? formDataState?.order?.total_inc_price
                  : type === "buy-credits"
                  ? formDataState?.total_inc_price
                  : ""
              }`}
        </Button>
      </DialogActions>
    </>
  );
}

export default function StripePayment({
  formDataState,
  onStripePaymentSuccess,
  onStripeTokenPaymentSuccess,
  type,
}) {
  const [open, setOpen] = useState(true);

  return (
    <Dialog open={open} onClose={() => setOpen(false)} maxWidth="xs" fullWidth>
      <DialogTitle>
        <b>Stripe Payment</b>
      </DialogTitle>

      <Elements stripe={stripePromise}>
        <CheckoutForm
          onClose={() => setOpen(false)}
          formDataState={formDataState}
          onStripePaymentSuccess={
            type == "order-placed" ? onStripePaymentSuccess : ""
          }
          onStripeTokenPaymentSuccess={
            type == "buy-credits" ? onStripeTokenPaymentSuccess : ""
          }
          type={type}
        />
      </Elements>
    </Dialog>
  );
}
