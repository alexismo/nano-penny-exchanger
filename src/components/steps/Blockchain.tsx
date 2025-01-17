import React from "react";
import QRCode from "qrcode";
import { Box } from "@lightspeed/flame/Core";
import { Button } from "@lightspeed/flame/Button";
import { IconVerified } from "@lightspeed/flame/Icon/Verified";
import { Spinner } from "@lightspeed/flame/Spinner";
import { Text } from "@lightspeed/flame/Text";
import { StepContext, Steps } from "contexts/Step";
import { BalanceContext, initialBalance } from "contexts/Balance";
import {
  WalletContext,
  initialWallet,
  initialIsValidWallet
} from "contexts/Wallet";
import {
  IsSubscribedContext,
  initialIsSubscribed
} from "contexts/IsSubscribed";
import { HashContext, initialHash } from "contexts/Hash";
import { IsConfirmedContext, initialIsConfirmed } from "contexts/IsConfirmed";
import { Connection } from "classes/Connection";

const CONFIRMATION_MAX_TIMEOUT = 10000;
const RESET_STEPS_MAX_TIMEOUT = 60000;
let resetStepsTimeout: any = null;
let confirmationTimeout: any = null;

const BlockchainStep: React.FunctionComponent = () => {
  const [isDone, setIsDone] = React.useState(false);
  const [step, setStep] = React.useContext(StepContext);
  const [, setBalance] = React.useContext(BalanceContext);
  const [, setWallet, , setIsValidWallet] = React.useContext(WalletContext);
  const [, setIsSubscribed] = React.useContext(IsSubscribedContext);
  const [, setIsConfirmed] = React.useContext(IsConfirmedContext);
  const [hash, setHash] = React.useContext(HashContext);
  const [isConfirmed] = React.useContext(IsConfirmedContext);
  const isActive = step === Steps.BLOCKCHAIN;

  const reset = () => {
    setIsDone(false);
    setBalance(initialBalance);
    setWallet(initialWallet);
    setIsValidWallet(initialIsValidWallet);
    setIsSubscribed(initialIsSubscribed);
    setIsConfirmed(initialIsConfirmed);
    setHash(initialHash);

    // @ts-ignore
    Connection.ws.send(JSON.stringify({ method: "reset" }));

    setStep(Steps.WALLET);
  };

  React.useEffect(() => {
    if (!hash) return;

    const canvasHash = document.getElementById("canvas-hash");

    QRCode.toCanvas(canvasHash, `https://www.nanode.co/block/${hash}`, {
      margin: 2,
      width: 50
    });
  }, [hash]);

  React.useEffect(() => {
    if (isConfirmed) {
      clearTimeout(confirmationTimeout);
    }
  }, [isConfirmed]);

  React.useEffect(() => {
    if (isActive) {
      confirmationTimeout = setTimeout(() => {
        setIsDone(true);
      }, CONFIRMATION_MAX_TIMEOUT);

      resetStepsTimeout = setTimeout(() => {
        reset();
      }, RESET_STEPS_MAX_TIMEOUT);
    } else {
      clearTimeout(confirmationTimeout);
      clearTimeout(resetStepsTimeout);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isActive]);

  return (
    <Box
      width="33%"
      textAlign="center"
      color={isActive ? "gray-100" : "gray-500"}
    >
      <Box pb={2}>
        {step !== Steps.BLOCKCHAIN ? (
          <Text>Broadcast transaction to Nano blockchain</Text>
        ) : null}

        {hash && step === Steps.BLOCKCHAIN ? (
          <canvas id="canvas-hash"></canvas>
        ) : null}
      </Box>

      {step === Steps.BLOCKCHAIN ? (
        <>
          {isDone ? (
            <Box pb={3} fontSize="0.825rem" color="#D7DCE1">
              The transaction is broadcasted, you should see the Nano being
              received in your walled shortly
            </Box>
          ) : null}

          {isConfirmed ? (
            <Box pb={3} fontSize="0.825rem" color="#D7DCE1">
              The transaction is fully verified on the Nano blockchain!{" "}
              <span role="img" aria-labelledby="celebrate">
                🎉
              </span>
            </Box>
          ) : null}

          {!isDone ? (
            <Box pb={2}>
              {!isConfirmed ? (
                <>
                  <Box pb={3} fontSize="0.825rem" color="#D7DCE1">
                    The transaction is being validated on the Nano blockchain
                  </Box>
                  <Spinner size="2.2rem" color="#4CADE9" />
                </>
              ) : (
                <IconVerified size="2.2rem" color="#4CADE9" />
              )}
            </Box>
          ) : null}

          {isConfirmed || isDone ? (
            <Box>
              <Button variant="secondary" fill onClick={reset}>
                Done!
              </Button>
            </Box>
          ) : null}
        </>
      ) : null}
    </Box>
  );
};

export default BlockchainStep;
