export const CountdownTimer = ({ blocks }: { blocks: number }) =>
  blocks > 0 ? (
    <div>
      <h2>Countdown timer</h2>
      <div className="relative">
        <span className="text-2xl font-bold animate-ping opacity-100">
          {blocks}{" "}
        </span>
        {blocks > 1 ? "blocks are" : "block is"} remaining
      </div>
    </div>
  ) : null;

export default CountdownTimer;
