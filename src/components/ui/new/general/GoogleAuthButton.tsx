import GoogleButton from "react-google-button";

interface GoogleAuthButtonProps {
  onClick: () => void;
}

export function GoogleAuthButton({ onClick }: GoogleAuthButtonProps) {
  return (
    <GoogleButton
      label=""
      onClick={onClick}
      style={{
        width: "100px",
        height: "52px",
        backgroundColor: "white",
        border: "1px solid #00000033",
        borderRadius: "20px",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    />
  );
}
