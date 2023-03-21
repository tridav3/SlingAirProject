import { useState, useEffect } from "react";
import styled from "styled-components";
import { useNavigate } from "react-router-dom";
import Plane from "./Plane";
import Form from "./Form";

const SeatSelect = ({ selectedFlight, setReservationId }) => {
  const [selectedSeat, setSelectedSeat] = useState("");
  const Navigate = useNavigate();
  const uuid = require("uuid");

  const handleSubmit = (e, formData) => {
    e.preventDefault();
    console.log(formData);
    const reservationData = {
      id: uuid.v4(),
      email: formData.email,
      selectedSeat: selectedSeat,
      selectedFlight: selectedFlight,
      givenName: formData.firstName,
      surname: formData.lastName,
    };

    if (!selectedSeat) {
      return;
    }

    fetch("/api/add-reservation", {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify(reservationData),
    })
      .then((res) => res.json())
      .then((data) => {
        localStorage.setItem("reservationId", data.data.insertedId);
        setReservationId(data.data.insertedId);
        console.log(data);
        Navigate(`/confirmation/${data.data.insertedId}`);
        console.log(data);
      })
      .catch((error) => console.log(error));
  };

  return (
    <Wrapper>
      <h2>Select your seat and Provide your information!</h2>
      <>
        <FormWrapper>
          <Plane
            setSelectedSeat={setSelectedSeat}
            selectedFlight={selectedFlight}
          />
          <Form handleSubmit={handleSubmit} selectedSeat={selectedSeat} />
        </FormWrapper>
      </>
    </Wrapper>
  );
};

const FormWrapper = styled.div`
  display: flex;
  margin: 50px 0px;
`;

const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-top: 50px;
`;

export default SeatSelect;
