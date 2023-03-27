import styled from "styled-components";
import tombstone from "../assets/tombstone.png";
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

const Confirmation = () => {
  const { id } = useParams();
  const [guest, setGuest] = useState();

  useEffect(() => {
    console.log("id:", id);
    if (id) {
      fetch(`/api/get-reservation/${id}`)
        .then((res) => res.json())
        .then((data) => {
          console.log(data);
          setGuest(data);
        })
        .catch((error) => {
          console.log(error);
        });
    }
  }, [id]);
  return (
    <Wrapper>
      {!guest ? (
        <p>loading</p>
      ) : (
        <div>
          <div>
            Email: <Span>{guest.email}</Span>
          </div>
          <div>
            First Name: <Span>{guest.firstName}</Span>
          </div>
          <div>
            Last Name: <Span>{guest.lastName}</Span>
          </div>
          <div>
            Flight Number: <Span>{guest.flight}</Span>
          </div>
          <div>
            Seat Number: <Span>{guest.seat}</Span>
          </div>
          <div>
            Conformation number: <Span>{guest._id}</Span>
          </div>
        </div>
      )}
      <Image src={tombstone} alt="Tombstone" />
    </Wrapper>
  );
};

const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100vh;
  font-size: 42px;
  border-style: solid;
  border: 1px;
  border-color: red;
`;

const Span = styled.span`
  margin: 10px;
  font-family: sans-serif;
`;

const Image = styled.img`
  width: 200px;
  margin-top: 20px;
`;

export default Confirmation;
