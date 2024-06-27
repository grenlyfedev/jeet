const generateRandomBets = () => {
  const bets = [];
  const betOptions = [
    "0",
    "1",
    "2",
    "3",
    "4",
    "5",
    "6",
    "7",
    "8",
    "9",
    "l",
    "n",
    "d",
    "x",
    "t",
  ];

  const getRandomBet = () =>
    betOptions[Math.floor(Math.random() * betOptions.length)];
  const getRandomMoney = () => Math.floor(Math.random() * 1000) + 100; // Random money between 100 and 1100

  for (let i = 0; i < 1000; i++) {
    bets.push({
      bet: getRandomBet(),
      money: getRandomMoney(),
    });
  }

  return bets;
};

export const calculatePayoutsWithColors = (bets) => {
  console.log("🚀 ~ calculatePayoutsWithColors ~ bets:", bets);
  const betMultipliers = {
    0: 9,
    1: 9,
    2: 9,
    3: 9,
    4: 9,
    5: 9,
    6: 9,
    7: 9,
    8: 9,
    9: 9,
    l: 2,
    n: 2,
    d: 1.5,
    x: 1.5,
    t: 4.5,
  };

  const smallNumbers = ["0", "1", "2", "3", "4"];
  const bigNumbers = ["5", "6", "7", "8", "9"];
  const greenNumbers = ["1", "2", "7", "9", "5"];
  const redNumbers = ["0", "2", "4", "6", "8"];
  const violetNumbers = ["0", "5"];

  const determineResultWithLowestPayout = () => {
    let payoutByResult = {};

    // Initialize potential results
    for (let i = 0; i <= 9; i++) {
      payoutByResult[i.toString()] = {
        payout: 0,
        count: 0,
        color: getColor(i.toString()),
      };
    }

    bets.forEach((bet) => {
      let multiplier = betMultipliers[bet.bet];
      if (smallNumbers.includes(bet.bet)) {
        smallNumbers.forEach((number) => {
          payoutByResult[number].payout += bet.money * multiplier;
          payoutByResult[number].count++;
        });
      } else if (bigNumbers.includes(bet.bet)) {
        bigNumbers.forEach((number) => {
          payoutByResult[number].payout += bet.money * multiplier;
          payoutByResult[number].count++;
        });
      } else if (["d", "x", "t"].includes(bet.bet)) {
        Object.keys(payoutByResult).forEach((number) => {
          if (payoutByResult[number].color === bet.bet) {
            payoutByResult[number].payout += bet.money * multiplier;
            payoutByResult[number].count++;
          }
        });
      } else if (!isNaN(parseInt(bet.bet))) {
        payoutByResult[bet.bet].payout += bet.money * multiplier;
        payoutByResult[bet.bet].count++;
      }
    });

    // Find the result that minimizes payout
    let result = Object.keys(payoutByResult).reduce((acc, key) => {
      if (
        payoutByResult[key].payout < payoutByResult[acc].payout ||
        (payoutByResult[key].payout === payoutByResult[acc].payout &&
          payoutByResult[key].count < payoutByResult[acc].count)
      ) {
        return key;
      }
      return acc;
    });

    return result;
  };

  const getColor = (number) => {
    if (greenNumbers.includes(number.toString())) return "x"; // green
    if (redNumbers.includes(number.toString())) return "d"; // red
    if (violetNumbers.includes(number.toString())) return "t"; // violet
    return null;
  };

  // Check if any bet option was not placed
  const allBetOptions = [
    ...smallNumbers,
    ...bigNumbers,
    ...greenNumbers,
    ...redNumbers,
    ...violetNumbers,
  ];
  const placedBetOptions = bets.map((bet) => bet.bet);
  const unplacedBetOptions = allBetOptions.filter(
    (option) => !placedBetOptions.includes(option)
  );

  // Add unplaced bet options to the bets array
  unplacedBetOptions.forEach((option) => {
    bets.push({
      bet: option,
      money: 0, // No money bet on unplaced options
    });
  });

  let result = determineResultWithLowestPayout();
  let totalPayout = 0;

  bets.forEach((bet) => {
    let conditionMet = false;
    if (
      bet.bet === result.toString() ||
      (bet.bet === "n" && smallNumbers.includes(result)) ||
      (bet.bet === "l" && bigNumbers.includes(result)) ||
      getColor(result) === bet.bet
    ) {
      conditionMet = true;
    }
    if (conditionMet) {
      let multiplier = betMultipliers[bet.bet];
      totalPayout += bet.money * multiplier;
    }
  });

  // return { result, totalPayout };
  return result;
};
