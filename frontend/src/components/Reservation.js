import { useEffect, useState } from "react";
import styled from "styled-components";
import tombstone from "../assets/tombstone.png";

const Reservation = () => {
  const [reservation, setReservation] = useState(null);
  const [reservationId, setReservationId] = useState(null);

  useEffect(() => {
    // TODO: fetch the details of the most recent reservation from the backend based on its unique id
    if (reservationId) {
      fetch(`/api/get-reservation/${reservationId}`)
        .then((response) => response.json())
        .then((data) => {
          setReservation(data.data);
        })
        .catch((error) => {
          console.error("Error fetching reservation:", error);
        });
    }
  }, [reservationId]);

  return (
    <Wrapper>
      {reservation ? (
        <>
          <ReservationInfo>
            <h2>Your Reservation</h2>
            <p>
              Flight: {reservation.flight} Seat: {reservation.seat}
            </p>
            <p>
              Name: {reservation.givenName} {reservation.surname}
            </p>
            <p>Email: {reservation.email}</p>
          </ReservationInfo>
        </>
      ) : (
        <Tombstone src={tombstone} alt="tombstone" />
      )}
      <h2>No reservation found</h2>
    </Wrapper>
  );
};

const Wrapper = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100%;
`;

const ReservationInfo = styled.div`
  margin-right: 50px;
`;

const Tombstone = styled.img`
  height: 300px;
  width: auto;
`;

export default Reservation;
