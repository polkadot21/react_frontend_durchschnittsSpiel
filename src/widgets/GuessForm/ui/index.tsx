import { Button, Input, useAppStore } from "../../../shared";
import { ChangeEventHandler, useState } from "react";
import { EButtonVariant } from "../../../shared/ui/Button";
import { toast } from "react-toastify";

type TFields = "guess" | "salt";

export const GuessForm: React.FC<{ isSubmittingPhase: boolean }> = ({
  isSubmittingPhase,
}) => {
  const [enterGuess, revealSaltAndGuess] = useAppStore((state) => [
    state.enterGuess,
    state.revealSaltAndGuess,
  ]);
  const [formState, setFormState] = useState<{ [T in TFields]: number }>({
    guess: 0,
    salt: 0,
  });
  const [visibilityState, setVisibilityState] = useState<{
    [T in TFields]: boolean;
  }>({
    guess: false,
    salt: false,
  });

  const handleChangeValue: ChangeEventHandler<HTMLInputElement> = (e) => {
    const { value, id } = e.target;
    setFormState((prev) => ({ ...prev, [id]: +value }));
  };

  const handleVisibilityChange = (field: TFields) => {
    setVisibilityState((prev) => ({ ...prev, [field]: !prev[field] }));
  };

  return (
    <form
      onSubmit={async (event) => {
        event.preventDefault();
        const formValues = { ...formState };
        setFormState(() => ({
          guess: 0,
          salt: 0,
        }));
        if (formState.guess < 0 || formState.guess > 1000) {
          toast.error("Guess value must be a digit between 0 and 1000");
          return;
        }
        if (!isSubmittingPhase) {
          await revealSaltAndGuess(formValues);
        } else {
          await enterGuess(formValues);
        }
      }}
    >
      <div className="flex">
        <Input
          label="Your guess"
          id="guess"
          type={!isSubmittingPhase ? "number" : "password"}
          placeholder="Your guess"
          value={formState.guess}
          onChange={handleChangeValue}
        />
        <Button
          variant={EButtonVariant.ICON}
          type="button"
          onClick={() => handleVisibilityChange("guess")}
        >
          <i
            className={`fas ${isSubmittingPhase ? "fa-eye" : "fa-eye-slash"}`}
            id="toggleGuessVisibility"
          ></i>
        </Button>
      </div>
      <div className="flex">
        <Input
          label="Your salt"
          id="salt"
          type={!isSubmittingPhase ? "number" : "password"}
          placeholder="Your salt"
          value={formState.salt}
          onChange={handleChangeValue}
        />
        <Button
          variant={EButtonVariant.ICON}
          type="button"
          onClick={() => handleVisibilityChange("salt")}
        >
          <i
            className={`fas ${isSubmittingPhase ? "fa-eye" : "fa-eye-slash"}`}
            id="toggleGuessVisibility"
          ></i>
        </Button>
      </div>
      <Button type="submit">{`${
        !isSubmittingPhase ? "Reveal" : "Submit"
      } your guess`}</Button>
    </form>
  );
};
