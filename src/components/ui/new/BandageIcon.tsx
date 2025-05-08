import "./bandage.css";

export const BandageIcon = () => {
  return (
    <div className="bandage-container">
      <div className="bandage-background"></div>
      <div className="bandage">
        <div className="bandage-cross-container">
          <span className="bandage-cross">&#10010;</span> {/* Heavy Plus Sign */}
        </div>
      </div>
    </div>
  );
};