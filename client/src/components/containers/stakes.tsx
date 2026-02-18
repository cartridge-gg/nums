import { StakeAdd, StakeSub } from "@/components/elements/stake-change";
import { StakeState } from "@/components/elements/stake-state";

export interface StakesProps {
  total: number;
  index: number;
  setIndex: (index: number) => void;
}

export const Stakes = ({ total, index, setIndex }: StakesProps) => {
  const handleDecrement = () => {
    if (index > 1) {
      setIndex(index - 1);
    }
  };

  const handleIncrement = () => {
    if (index < total) {
      setIndex(index + 1);
    }
  };

  return (
    <div className="flex gap-4 items-center w-full">
      <StakeSub onClick={handleDecrement} disabled={index <= 1} />
      <div className="flex flex-1 gap-1 h-full items-center">
        {Array.from({ length: total }, (_, i) => (
          <StakeState
            key={i}
            completed={i < index}
            className="flex-1"
            onClick={() => setIndex(i + 1)}
          />
        ))}
      </div>
      <StakeAdd onClick={handleIncrement} disabled={index >= total} />
    </div>
  );
};
