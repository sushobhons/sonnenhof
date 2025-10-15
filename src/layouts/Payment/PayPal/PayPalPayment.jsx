import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  PayPalScriptProvider,
  PayPalButtons,
  FUNDING,
} from "@paypal/react-paypal-js";

const PayPalPayment = () => {
  const paypalOptions = {
    "client-id":
      "Adv4szeitx58C28_RsMUWzJvoeOuhgS4o69fYWMfHpPB6wfnuLdcmE51U-vl1qqIr2k-ow1w__2ZBGfz",
    currency: "EUR",
  };

  const createOrder = (data, actions) => {
    return actions.order
      .create({
        purchase_units: [
          {
            amount: {
              value: 100,
            },
          },
        ],
        application_context: {
          shipping_preference: "NO_SHIPPING",
        },
      })
      .then((orderID) => {
        return orderID;
      });
  };

  //convert date format
  //   const convert_date_format = (date) => {
  //     const date_format = new Date(date);
  //     const options = { year: 'numeric', month: '2-digit', day: '2-digit' };
  //     const dateString = date_format.toLocaleDateString('en-GB', options).split('/').reverse().join('-');
  //     return dateString;
  //   }

  const onApprove = (data, actions) => {
    return actions.order.capture().then(function (details) {
      //   paypalPaymentInvoice(details);
    });
  };

  return (
    <PayPalScriptProvider options={paypalOptions}>
      {/* fundingSource={[FUNDING.PAYPAL,FUNDING.CARD]} */}
      {/* fundingSource={[FUNDING.PAYPAL, FUNDING.CARD]} */}
      {/* disableFunding={[]} // Ensure no funding sources are disabled */}

      <PayPalButtons
        style={{
          layout: "horizontal",
          color: "white", // Customize color
          shape: "rect",
        }}
        fundingSource={FUNDING.PAYPAL}
        createOrder={createOrder}
        onApprove={onApprove}
        //   onCancel={onCancel}
        label="Custom Label" // Rename the PayPal button
      />
    </PayPalScriptProvider>
  );
};

export default PayPalPayment;
