import styled, { css, CSSProperties } from "styled-components";

export type SoundsId = "1" | "2" | "3" | "4";

interface StyledButtonProps {
  top: CSSProperties["top"];
  left: CSSProperties["left"];
  backgroundColor: CSSProperties["backgroundColor"];
  id: SoundsId;
  active: SoundsId | null;
}

export interface Props extends StyledButtonProps {
  onClick: (soundId: SoundsId) => void;
  active: SoundsId | null;
}

const Button = ({ onClick, active, top, id, left, backgroundColor }: Props) => (
  <StyledButton
    onClick={() => {
      onClick(id);
    }}
    backgroundColor={backgroundColor}
    top={top}
    left={left}
    id={id}
    active={active}
  />
);
export default Button;

const StyledButton = styled.div<StyledButtonProps>`
  position: absolute;
  display: inline-block;
  transform: translate(-50%, -50%);
  width: 20%;
  height: 25%;
  border-radius: 50%;
  outline: none;
  font-size: 18px;
  font-weight: bold;
  text-transform: uppercase;
  cursor: pointer;
  background-color: ${({ backgroundColor }) => backgroundColor};
  left: ${({ left }) => left};
  top: ${({ top }) => top};
  ${({ id, active }) =>
    id === active
      ? css`
          box-shadow: 0 0 10px 10px white;
        `
      : ""}
`;
