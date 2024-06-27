const betObject = {
  4: 69.12,
  5: 34.56,
  6: 20.74,
  7: 13.83,
  8: 9.88,
  9: 8.3,
  10: 7.68,
  11: 7.68,
  12: 8.3,
  13: 9.88,
  14: 13.83,
  15: 20.74,
  16: 34.36,
  17: 69.12,
  l: 1.92,
  s: 1.92,
  b: 1.92,
  c: 1.92,
};

export function analyzeThreeDigitNumber(number) {
  const sum = number
    .toString()
    .split("")
    .map((digit) => parseInt(digit))
    .reduce((acc, digit) => acc + digit, 0);

  const isBig = sum >= 10 ? { b: betObject.b } : { s: betObject.s };
  const isOdd = number % 2 === 1 ? { l: betObject.l } : { c: betObject.c };
  const sumBet = { [sum]: betObject[sum] };

  return [isBig, isOdd, sumBet];
}

function generateDummyData() {
  const dummyData = [];
  for (let i = 0; i < 20; i++) {
    const betOptions = [
      "3",
      "4",
      "5",
      "6",
      "7",
      "8",
      "9",
      "10",
      "11",
      "12",
      "13",
      "14",
      "15",
      "16",
      "17",
      "l",
      "s",
      "b",
      "c",
    ];
    const randomBetIndex = Math.floor(Math.random() * betOptions.length);
    const randomBet = betOptions[randomBetIndex];
    const randomMoney = Math.floor(Math.random() * 1000);
    dummyData.push({
      id_product: "product_" + i,
      phone: "phone_" + i,
      code: "code_" + i,
      invite: "invite_" + i,
      stage: "stage_" + i,
      result: "result_" + i,
      level: Math.floor(Math.random() * 10),
      money: randomMoney,
      price: Math.floor(Math.random() * 100),
      amount: Math.floor(Math.random() * 100),
      fee: Math.floor(Math.random() * 100),
      get: Math.floor(Math.random() * 100),
      game: "game_" + i,
      join_bet: "join_bet_" + i,
      typeGame: "typeGame_" + i,
      bet: randomBet,
      status: 0,
      time: new Date().toISOString(),
    });
  }
  return dummyData;
}

export function generateRandomThreeDigitNumber(length) {
  let result = "";
  const validDigits = [1, 2, 3, 4, 5, 6];
  for (let i = 0; i < length; i++) {
    const digit = validDigits[Math.floor(Math.random() * validDigits.length)];
    result += digit;
  }
  return result;
}

export function calculateTotalMoneyPlaced(dummyData) {
  try {
    const totalMoneyPlaced = {};

    dummyData.forEach((bet) => {
      const { bet: betOption, money } = bet;
      totalMoneyPlaced[betOption] = (totalMoneyPlaced[betOption] || 0) + money;
    });

    return totalMoneyPlaced;
  } catch (error) {
    console.error("Error calculating total money placed:", error);
    throw error;
  }
}

export function calculatePotentialWinnings(betObject, betsPlaced) {
  const potentialWinnings = {};
  for (const bet in betsPlaced) {
    if (betObject[bet]) {
      potentialWinnings[bet] = betObject[bet] * betsPlaced[bet];
    }
  }
  return potentialWinnings;
}
export function generateThreeDigitNumber(sum) {
  const validDigits = [1, 2, 3, 4, 5, 6];
  const numbers = [];

  // Generate all possible combinations of three digits
  for (let i = 0; i < validDigits.length; i++) {
    for (let j = 0; j < validDigits.length; j++) {
      for (let k = 0; k < validDigits.length; k++) {
        const currentSum = validDigits[i] + validDigits[j] + validDigits[k];
        const number = `${validDigits[i]}${validDigits[j]}${validDigits[k]}`;

        // Check if the sum matches the given parameter and no two adjacent digits are the same
        if (currentSum === Number(sum) && !/(.)\1/.test(number)) {
          numbers.push(parseInt(number));
        }
      }
    }
  }

  if (numbers.length === 0) {
    return generateRandomThreeDigitNumber(3);
  }

  const randomIndex = Math.floor(Math.random() * numbers.length);
  return numbers[randomIndex];
}

export function findLowestPotentialPayout(potentialWinnings) {
  let lowestPayout = Infinity;
  let lowestBet = null;
  for (const bet in potentialWinnings) {
    if (potentialWinnings[bet] < lowestPayout) {
      lowestPayout = potentialWinnings[bet];
      lowestBet = bet;
    }
  }
  return lowestBet;
}

export function fillMissingNumbers(potentialWinnings) {
  const filledObject = { ...potentialWinnings };
  for (let i = 4; i <= 17; i++) {
    if (!(i in filledObject)) {
      filledObject[i] = 0;
    }
  }
  return filledObject;
}

function findLowestBet(lowestPotentialPayoutBet, potentialWinnings) {
  const validKeys = Object.keys(lowestPotentialPayoutBet).filter(
    (key) => key !== "l" && key !== "s" && key !== "c" && key !== "b"
  );
  const betsByMeaning = {
    odd: [],
    even: [],
    small: [],
    big: [],
  };

  validKeys.forEach((key) => {
    const value = lowestPotentialPayoutBet[key];
    if (key < 10) {
      if (key % 2 === 0) {
        betsByMeaning.even.push({ key, value });
      } else {
        betsByMeaning.odd.push({ key, value });
      }
    } else {
      if (key.toString().charAt(0) === "1") {
        betsByMeaning.big.push({ key, value });
      } else {
        betsByMeaning.small.push({ key, value });
      }
    }
  });

  let lowestBet = null;
  let lowestValue = Infinity;

  for (const category in betsByMeaning) {
    const bets = betsByMeaning[category];
    const minBet = bets.reduce(
      (min, bet) => {
        if (bet.value < min.value) {
          return bet;
        } else {
          return min;
        }
      },
      { value: Infinity }
    );
    if (minBet.value < lowestValue) {
      lowestBet = minBet;
      lowestValue = minBet.value;
    }
  }

  return lowestBet;
}
