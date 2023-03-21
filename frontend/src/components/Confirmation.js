import styled from "styled-components";
import tombstone from "../assets/tombstone.png";
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

const Confirmation = () => {
  const { _id } = useParams();
  const [guest, setGuest] = useState();

  useEffect(() => {
    if (_id) {
      fetch(`/api/get-reservation/${_id}`)
        .then((res) => res.json())
        .then((data) => {
          setGuest(data.data);
        })
        .catch((error) => {
          console.log(error);
        });
    }
  }, [_id]);

  return (
    <Wrapper>
      {!guest ? (
        <p>loading</p>
      ) : (
        <div>
          <div>
            Email: <Span>{guest.data.email}</Span>
          </div>
          <div>
            First Name: <Span>{guest.data.givenName}</Span>
          </div>
          <div>
            Last Name: <Span>{guest.data.surname}</Span>
          </div>
          <div>
            Flight Number: <Span>{guest.data.flight}</Span>
          </div>
          <div>
            Seat Number: <Span>{guest.data.seat}</Span>
          </div>
          <div>
            Conformation number: <Span>{guest.data._id}</Span>
          </div>
        </div>
      )}
    </Wrapper>
  );
};

const Wrapper = styled.div``;

const Span = styled.span``;

export default Confirmation;
